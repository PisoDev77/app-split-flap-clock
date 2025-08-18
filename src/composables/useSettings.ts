import { ref, computed, watch } from 'vue'

/**
 * ## 사용자 설정 관리 컴포저블
 * 
 * **앱의 사용자 설정**을 관리하고 로컬 스토리지에 저장합니다.
 * 
 * ### 기능
 * - 배경 효과 설정 관리
 * - 애니메이션 강도 조절
 * - 파티클 효과 토글
 * - 시간 형식 설정
 * - 자동 저장 및 복원
 * 
 * @since 1.0.0
 */

interface Settings {
  backgroundEffectsEnabled: boolean
  showParticles: boolean
  animationIntensity: 'low' | 'medium' | 'high'
  timeFormat: '12h' | '24h'
  enableSounds: boolean
  reducedMotion: boolean
}

const DEFAULT_SETTINGS: Settings = {
  backgroundEffectsEnabled: true,
  showParticles: true,
  animationIntensity: 'medium',
  timeFormat: '24h',
  enableSounds: false,
  reducedMotion: false
}

// 리액티브 설정 상태
const settings = ref<Settings>({ ...DEFAULT_SETTINGS })

/**
 * ## 설정 로드
 * 
 * **로컬 스토리지에서 저장된 설정**을 불러옵니다.
 * 
 * @example
 * ```typescript
 * loadSettings()
 * ```
 */
const loadSettings = (): void => {
  try {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...DEFAULT_SETTINGS, ...parsed }
    }
    
    // 개별 설정들도 체크 (하위 호환성)
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      const individualSetting = localStorage.getItem(key)
      if (individualSetting !== null) {
        if (key === 'backgroundEffectsEnabled' || key === 'showParticles' || key === 'enableSounds' || key === 'reducedMotion') {
          (settings.value as any)[key] = individualSetting === 'true'
        } else {
          (settings.value as any)[key] = individualSetting
        }
      }
    })
    
    // 시스템 설정 확인
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settings.value.reducedMotion = true
      settings.value.backgroundEffectsEnabled = false
      settings.value.showParticles = false
    }
    
  } catch (error) {
    console.error('설정 로드 실패:', error)
    settings.value = { ...DEFAULT_SETTINGS }
  }
}

/**
 * ## 설정 저장
 * 
 * **현재 설정을 로컬 스토리지**에 저장합니다.
 * 
 * @example
 * ```typescript
 * saveSettings()
 * ```
 */
const saveSettings = (): void => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
    
    // 개별 설정도 저장 (다른 컴포넌트에서 직접 접근용)
    Object.entries(settings.value).forEach(([key, value]) => {
      localStorage.setItem(key, String(value))
    })
    
  } catch (error) {
    console.error('설정 저장 실패:', error)
  }
}

/**
 * ## 배경 효과 토글
 * 
 * **배경 효과 활성화/비활성화**를 토글합니다.
 * 
 * @example
 * ```typescript
 * toggleBackgroundEffects()
 * ```
 */
const toggleBackgroundEffects = (): void => {
  settings.value.backgroundEffectsEnabled = !settings.value.backgroundEffectsEnabled
}

/**
 * ## 파티클 효과 토글
 * 
 * **파티클 효과 표시/숨김**을 토글합니다.
 * 
 * @example
 * ```typescript
 * toggleParticles()
 * ```
 */
const toggleParticles = (): void => {
  settings.value.showParticles = !settings.value.showParticles
}

/**
 * ## 애니메이션 강도 설정
 * 
 * **애니메이션 강도를 변경**합니다.
 * 
 * @param {string} intensity - **설정할 강도** ('low' | 'medium' | 'high')
 * 
 * @example
 * ```typescript
 * setAnimationIntensity('high')
 * ```
 */
const setAnimationIntensity = (intensity: 'low' | 'medium' | 'high'): void => {
  settings.value.animationIntensity = intensity
}

/**
 * ## 시간 형식 설정
 * 
 * **시간 표시 형식을 변경**합니다.
 * 
 * @param {string} format - **시간 형식** ('12h' | '24h')
 * 
 * @example
 * ```typescript
 * setTimeFormat('12h')
 * ```
 */
const setTimeFormat = (format: '12h' | '24h'): void => {
  settings.value.timeFormat = format
}

/**
 * ## 설정 초기화
 * 
 * **모든 설정을 기본값으로 리셋**합니다.
 * 
 * @example
 * ```typescript
 * resetSettings()
 * ```
 */
const resetSettings = (): void => {
  settings.value = { ...DEFAULT_SETTINGS }
  localStorage.removeItem('app-settings')
  
  // 개별 설정들도 제거
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * ## 성능 모드 설정
 * 
 * **저성능 기기를 위한 설정**을 적용합니다.
 * 
 * @example
 * ```typescript
 * enablePerformanceMode()
 * ```
 */
const enablePerformanceMode = (): void => {
  settings.value.backgroundEffectsEnabled = false
  settings.value.showParticles = false
  settings.value.animationIntensity = 'low'
  settings.value.reducedMotion = true
}

/**
 * ## 접근성 모드 설정
 * 
 * **접근성을 위한 설정**을 적용합니다.
 * 
 * @example
 * ```typescript
 * enableAccessibilityMode()
 * ```
 */
const enableAccessibilityMode = (): void => {
  settings.value.reducedMotion = true
  settings.value.backgroundEffectsEnabled = false
  settings.value.showParticles = false
  settings.value.animationIntensity = 'low'
}

// 계산된 속성들
const isPerformanceMode = computed(() => {
  return !settings.value.backgroundEffectsEnabled && 
         !settings.value.showParticles && 
         settings.value.animationIntensity === 'low'
})

const effectsEnabled = computed(() => {
  return settings.value.backgroundEffectsEnabled && !settings.value.reducedMotion
})

// 설정 변경 감지 및 자동 저장
watch(settings, () => {
  saveSettings()
}, { deep: true })

// 시스템 설정 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches && !settings.value.reducedMotion) {
      enableAccessibilityMode()
    }
  })
}

export function useSettings() {
  return {
    // 상태
    settings,
    
    // 계산된 속성
    isPerformanceMode,
    effectsEnabled,
    
    // 메서드
    loadSettings,
    saveSettings,
    toggleBackgroundEffects,
    toggleParticles,
    setAnimationIntensity,
    setTimeFormat,
    resetSettings,
    enablePerformanceMode,
    enableAccessibilityMode
  }
}