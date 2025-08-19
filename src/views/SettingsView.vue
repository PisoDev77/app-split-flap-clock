<template>
  <div class="settings-view">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-content">
          <a-button 
            type="text" 
            :icon="h(ArrowLeftOutlined)"
            @click="$router.back()"
            class="back-btn"
          >
            뒤로
          </a-button>
          <h1 class="page-title">설정</h1>
          <div class="header-spacer"></div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="settings-container">
          <a-card class="settings-card" title="시간 및 위치 설정">
            <a-space direction="vertical" size="large" class="settings-form">
              <!-- 도시 선택 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  도시 선택
                </a-typography-title>
                <a-select
                  v-model:value="selectedCity"
                  placeholder="도시를 선택하세요"
                  class="setting-input"
                  :options="cityOptions"
                  show-search
                  :filter-option="filterCityOption"
                />
                <a-typography-text type="secondary" class="setting-description">
                  시간을 표시할 도시를 선택합니다.
                </a-typography-text>
              </div>

              <!-- 시간대 표시 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  현재 시간대
                </a-typography-title>
                <a-typography-text class="timezone-display">
                  {{ currentTimezone }} ({{ currentCity }})
                </a-typography-text>
                <a-typography-text type="secondary" class="setting-description">
                  선택된 도시의 시간대입니다.
                </a-typography-text>
              </div>

              <!-- 위치 기반 자동 설정 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  위치 기반 자동 설정
                </a-typography-title>
                <a-button 
                  type="primary" 
                  :loading="isLocationLoading"
                  @click="handleAutoLocation"
                  :icon="h(EnvironmentOutlined)"
                >
                  현재 위치로 설정
                </a-button>
                <a-typography-text type="secondary" class="setting-description">
                  GPS를 사용해 현재 위치의 시간을 자동으로 설정합니다.
                </a-typography-text>
              </div>
            </a-space>
          </a-card>

          <a-card class="settings-card" title="화면 설정">
            <a-space direction="vertical" size="large" class="settings-form">
              <!-- 테마 설정 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  테마 모드
                </a-typography-title>
                <a-select
                  v-model:value="selectedTheme"
                  class="setting-input"
                  :options="themeOptions"
                  @change="handleThemeChange"
                />
                <a-typography-text type="secondary" class="setting-description">
                  앱의 색상 테마를 선택합니다.
                </a-typography-text>
              </div>

              <!-- 테마 미리보기 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  미리보기
                </a-typography-title>
                <div class="theme-preview">
                  <div class="preview-container">
                    <AnimatedBackground 
                      :enabled="backgroundEffectsEnabled"
                      :show-particles="showParticlesEnabled"
                      :intensity="animationIntensity"
                      class="preview-background"
                    />
                    <div class="preview-content">
                      <div class="preview-city">
                        <SplitFlapDisplay :text="previewText" />
                        <span class="preview-label">도시</span>
                      </div>
                      <div class="preview-time">
                        <SplitFlapDisplay :text="previewTime" />
                        <span class="preview-label">시간</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-space>
          </a-card>

          <a-card class="settings-card" title="애니메이션 설정">
            <a-space direction="vertical" size="large" class="settings-form">
              <!-- 배경 효과 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <a-typography-title :level="4" class="setting-label">
                      배경 효과
                    </a-typography-title>
                    <a-typography-text type="secondary" class="setting-description">
                      시간대별 동적 배경 효과를 활성화합니다.
                    </a-typography-text>
                  </div>
                  <a-switch
                    v-model:checked="backgroundEffectsEnabled"
                  />
                </div>
              </div>

              <!-- 파티클 효과 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <a-typography-title :level="4" class="setting-label">
                      파티클 효과
                    </a-typography-title>
                    <a-typography-text type="secondary" class="setting-description">
                      배경의 떠다니는 파티클 효과를 표시합니다.
                    </a-typography-text>
                  </div>
                  <a-switch
                    v-model:checked="showParticlesEnabled"
                    :disabled="!backgroundEffectsEnabled"
                  />
                </div>
              </div>

              <!-- 애니메이션 강도 -->
              <div class="setting-item">
                <a-typography-title :level="4" class="setting-label">
                  애니메이션 강도
                </a-typography-title>
                <a-select
                  v-model:value="animationIntensity"
                  class="setting-input"
                  :options="intensityOptions"
                  :disabled="!backgroundEffectsEnabled"
                />
                <a-typography-text type="secondary" class="setting-description">
                  애니메이션의 강도를 조절합니다. 높을수록 더 화려합니다.
                </a-typography-text>
              </div>

              <!-- 성능 모드 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <a-typography-title :level="4" class="setting-label">
                      성능 모드
                    </a-typography-title>
                    <a-typography-text type="secondary" class="setting-description">
                      저성능 기기를 위해 모든 효과를 비활성화합니다.
                    </a-typography-text>
                  </div>
                  <a-button 
                    @click="handlePerformanceModeClick"
                    size="small"
                    type="dashed"
                  >
                    성능 모드 활성화
                  </a-button>
                </div>
              </div>
            </a-space>
          </a-card>

          <!-- 설정 저장 버튼 -->
          <div class="save-section">
            <a-button 
              type="primary" 
              size="large"
              @click="saveSettings"
              :loading="isSaving"
              block
            >
              설정 저장
            </a-button>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { 
  Layout as ALayout, 
  Button as AButton, 
  Card as ACard,
  Space as ASpace,
  Select as ASelect,
  Switch as ASwitch,
  message
} from 'ant-design-vue'
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined 
} from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { useLocation } from '@/composables/useLocation'
import { useTheme } from '@/composables/useTheme'
import { useSettings } from '@/composables/useSettings'
import dayjs from '@/utils/dayjs'

/**
 * ## 설정 화면 뷰
 * 
 * **앱의 각종 설정**을 관리하는 화면입니다.
 * 
 * ### 기능
 * - 도시 및 시간대 선택
 * - 테마 모드 설정
 * - 위치 기반 자동 설정
 * - 설정 저장 및 적용
 * 
 * @since 1.0.0
 */

const { getSupportedCities, getCurrentLocation, getTimezoneByCity } = useLocation()
const { setThemeMode } = useTheme()
const { 
  settings, 
  loadSettings, 
  toggleBackgroundEffects, 
  toggleParticles, 
  setAnimationIntensity: setAnimationLevel,
  enablePerformanceMode: activatePerformanceMode 
} = useSettings()

const selectedCity = ref('')
const selectedTheme = ref<'light' | 'dark' | 'system'>('system')
const isLocationLoading = ref(false)
const isSaving = ref(false)

// 애니메이션 설정 - useSettings를 통해 관리
const backgroundEffectsEnabled = computed({
  get: () => settings.value.backgroundEffectsEnabled,
  set: (value) => settings.value.backgroundEffectsEnabled = value
})
const showParticlesEnabled = computed({
  get: () => settings.value.showParticles,
  set: (value) => settings.value.showParticles = value
})
const animationIntensity = computed({
  get: () => settings.value.animationIntensity,
  set: (value) => setAnimationLevel(value)
})

const previewText = computed(() => {
  return `${selectedCity.value || 'SEOUL'}`
})

const previewTime = computed(() => {
  const now = dayjs()
  return now.format('HH')
})

const cityOptions = computed(() => {
  return getSupportedCities().map(city => ({
    value: city.name,
    label: `${city.name} (${city.timezone})`
  }))
})

const themeOptions = [
  { value: 'system', label: '시스템 설정 따름' },
  { value: 'light', label: '라이트 모드' },
  { value: 'dark', label: '다크 모드' }
]

const intensityOptions = [
  { value: 'low', label: '낮음 (배터리 절약)' },
  { value: 'medium', label: '보통 (권장)' },
  { value: 'high', label: '높음 (화려함)' }
]

const currentCity = computed(() => selectedCity.value || 'Seoul')
const currentTimezone = computed(() => getTimezoneByCity(currentCity.value))

/**
 * ## 도시 검색 필터
 * 
 * **도시 선택 드롭다운**에서 검색 기능을 제공합니다.
 * 
 * @param {string} input - **사용자 입력**
 * @param {any} option - **선택 옵션**
 * @returns {boolean} **필터 결과**
 */
const filterCityOption = (input: string, option: any): boolean => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

/**
 * ## 자동 위치 설정
 * 
 * **GPS를 사용**하여 현재 위치의 도시와 시간대를 자동으로 설정합니다.
 * 
 * @example
 * ```typescript
 * await handleAutoLocation()
 * ```
 */
const handleAutoLocation = async (): Promise<void> => {
  isLocationLoading.value = true
  
  try {
    const location = await getCurrentLocation()
    
    if (location) {
      selectedCity.value = location.city
      message.success(`위치가 ${location.city}로 설정되었습니다.`)
    } else {
      message.error('위치 정보를 가져올 수 없습니다.')
    }
  } catch (error) {
    console.error('위치 조회 실패:', error)
    message.error('위치 정보를 가져오는데 실패했습니다.')
  } finally {
    isLocationLoading.value = false
  }
}


/**
 * ## 테마 변경 처리
 * 
 * **테마 설정을 즉시 변경**하고 적용합니다.
 * 
 * @param {string} theme - **테마 값**
 */
const handleThemeChange = (theme: any): void => {
  const validTheme = theme as 'light' | 'dark' | 'system'
  selectedTheme.value = validTheme
  setThemeMode(validTheme)
}

/**
 * ## 성능 모드 활성화 처리
 * 
 * **성능 모드를 활성화**하고 사용자에게 알림을 표시합니다.
 * 
 * @example
 * ```typescript
 * handlePerformanceModeClick()
 * ```
 */
const handlePerformanceModeClick = (): void => {
  activatePerformanceMode()
  message.success('성능 모드가 활성화되었습니다.')
}

/**
 * ## 설정 저장
 * 
 * **변경된 설정들을 로컬 스토리지**에 저장하고 적용합니다.
 * 
 * @example
 * ```typescript
 * await saveSettings()
 * ```
 */
const saveSettings = async (): Promise<void> => {
  isSaving.value = true
  
  try {
    // 도시 및 시간대 저장
    localStorage.setItem('selectedCity', selectedCity.value)
    localStorage.setItem('selectedTimezone', getTimezoneByCity(selectedCity.value))
    
    // 테마 설정 저장 및 적용
    setThemeMode(selectedTheme.value)
    
    // 애니메이션 설정 저장
    localStorage.setItem('backgroundEffectsEnabled', String(backgroundEffectsEnabled.value))
    localStorage.setItem('showParticles', String(showParticlesEnabled.value))
    localStorage.setItem('animationIntensity', animationIntensity.value)
    
    message.success('설정이 저장되었습니다.')
    
    // 잠시 후 홈 화면으로 이동
    setTimeout(() => {
      window.history.back()
    }, 1000)
    
  } catch (error) {
    console.error('설정 저장 실패:', error)
    message.error('설정 저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

/**
 * ## 설정 로드
 * 
 * **저장된 설정들을 로드**하여 UI에 반영합니다.
 */
const loadUserSettings = (): void => {
  // 저장된 도시 로드
  const savedCity = localStorage.getItem('selectedCity')
  if (savedCity) {
    selectedCity.value = savedCity
  }
  
  // 저장된 테마 모드 로드
  const savedTheme = localStorage.getItem('theme-mode') as 'light' | 'dark' | 'system'
  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
}

onMounted(() => {
  loadSettings() // useSettings의 loadSettings 사용
  loadUserSettings()
})
</script>

<style scoped>
.settings-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  height: 100%;
  background: var(--color-canvas-default);
}

.header {
  background: var(--color-canvas-default);
  border-bottom: 1px solid var(--color-border-default);
  height: 64px;
  padding: 0 24px;
  box-shadow: var(--shadow-small);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  color: var(--color-accent-fg);
  border: none;
  margin-right: 16px;
}

.back-btn:hover {
  background: var(--color-canvas-subtle);
}

.page-title {
  color: var(--color-fg-default);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.header-spacer {
  width: 80px; /* back-btn 영역과 균형 맞추기 */
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
  overflow-y: auto;
  margin-bottom: 110px; /* 광고 배너 공간 확보 */
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.settings-form {
  width: 100%;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.setting-label-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  margin: 0 !important;
  color: var(--color-fg-default);
}

.setting-input {
  width: 100%;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--color-fg-muted);
}

.timezone-display {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent-fg);
  background: var(--color-canvas-subtle);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border-default);
}

.theme-preview {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--color-border-default);
  background: var(--color-canvas-default);
}

.preview-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.preview-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.preview-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 16px;
}

.preview-city,
.preview-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  scale: 0.6;
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-fg-muted);
  font-weight: 500;
}

.save-section {
  margin-top: 8px;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .content {
    padding: 16px;
    margin-bottom: 90px;
  }
  
  .settings-container {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .content {
    padding: 12px;
    margin-bottom: 80px;
  }
  
  .header-spacer {
    width: 60px;
  }
}

/* 카드 애니메이션 */
.settings-card {
  animation: slideInUp 0.4s ease-out;
}

.settings-card:nth-child(2) {
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>