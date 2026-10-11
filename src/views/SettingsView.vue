<template>
  <div class="settings-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton 
            type="text" 
            :icon="ArrowLeftOutlined"
            class="back-btn"
            aria-label="이전 페이지로 돌아가기"
            @click="$router.back()"
          >
            뒤로
          </UiButton>
          <h1 class="page-title">설정</h1>
          <div class="header-spacer" />
        </div>
      </header>
      
      <div class="content">
        <div class="settings-container" role="main">
          <UiCard class="settings-card" title="시간 및 도시 설정">
            <div class="ui-stack settings-form">
              <!-- 도시 선택 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  도시 선택
                </h4>
                <UiSelect
                  v-model:value="selectedCity"
                  placeholder="도시를 선택하세요"
                  class="setting-input"
                  :options="cityOptions"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  시간을 표시할 도시를 선택합니다.
                </span>
              </div>

              <!-- 시간대 표시 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  현재 시간대
                </h4>
                <span class="ui-text timezone-display">
                  UTC{{ currentOffset }} ({{ currentCityDisplay }})
                </span>
                <span class="ui-text ui-text--secondary setting-description">
                  선택된 도시의 지금 시간대입니다. 서머타임이 자동으로 반영됩니다.
                </span>
              </div>

              <!-- 기기 시간대 자동 설정 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  기기 시간대 자동 설정
                </h4>
                <UiButton 
                  type="primary" 
                  :loading="isLocationLoading"
                  :icon="EnvironmentOutlined"
                  @click="handleAutoLocation"
                >
                  이 기기 시간대 따르기
                </UiButton>
                <span class="ui-text ui-text--secondary setting-description">
                  위치 권한 없이, 이 기기에 설정된 시간대의 시간을 보여줍니다.
                </span>
              </div>
            </div>
          </UiCard>

          <UiCard class="settings-card" title="화면 설정">
            <div class="ui-stack settings-form">
              <!-- 테마 설정 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  테마 모드
                </h4>
                <UiSelect
                  v-model:value="selectedTheme"
                  class="setting-input"
                  :options="themeOptions"
                  @change="handleThemeChange"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  앱의 색상 테마를 선택합니다.
                </span>
              </div>

              <!-- 테마 미리보기 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  미리보기
                </h4>
                <div class="theme-preview">
                  <div class="preview-container">
                    <AnimatedBackground 
                      :enabled="backgroundEffectsEnabled"
                      :effect="backgroundEffect"
                      :intensity="animationIntensity"
                      contained
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
            </div>
          </UiCard>

          <UiCard class="settings-card" title="애니메이션 설정">
            <div class="ui-stack settings-form">
              <!-- 배경 효과 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <h4 class="ui-title setting-label">
                      배경 효과
                    </h4>
                    <span class="ui-text ui-text--secondary setting-description">
                      시간대별 동적 배경 효과를 활성화합니다.
                    </span>
                  </div>
                  <UiSwitch
                    v-model:checked="backgroundEffectsEnabled"
                  />
                </div>
              </div>

              <!-- 배경 효과 종류 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  효과 종류
                </h4>
                <UiSelect
                  v-model:value="backgroundEffect"
                  class="setting-input"
                  :options="BACKGROUND_EFFECT_OPTIONS"
                  :disabled="!backgroundEffectsEnabled"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  배경에 보일 움직임을 고릅니다. 위 미리보기에서 바로 확인할 수 있어요.
                </span>
              </div>

              <!-- 애니메이션 강도 -->
              <div class="setting-item">
                <h4 class="ui-title setting-label">
                  애니메이션 강도
                </h4>
                <UiSelect
                  v-model:value="animationIntensity"
                  class="setting-input"
                  :options="intensityOptions"
                  :disabled="!backgroundEffectsEnabled"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  애니메이션의 강도를 조절합니다. 높을수록 더 화려합니다.
                </span>
              </div>

              <!-- 성능 모드 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <h4 class="ui-title setting-label">
                      성능 모드
                    </h4>
                    <span class="ui-text ui-text--secondary setting-description">
                      저성능 기기를 위해 모든 효과를 비활성화합니다.
                    </span>
                  </div>
                  <UiButton 
                    size="small"
                    @click="handlePerformanceModeClick"
                  >
                    성능 모드 활성화
                  </UiButton>
                </div>
              </div>
            </div>
          </UiCard>

          <!-- 설정 저장 버튼 -->
          <div class="save-section">
            <UiButton 
              type="primary" 
              size="large"
              :loading="isSaving"
              block
              @click="saveSettings"
            >
              설정 저장
            </UiButton>
          </div>
        </div>
      </div>
      
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiSwitch from '@/components/ui/UiSwitch.vue'
import { message } from '@/composables/useToast'
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined 
} from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useLocation } from '@/composables/useLocation'
import { useTheme } from '@/composables/useTheme'
import { useSettings, BACKGROUND_EFFECT_OPTIONS } from '@/composables/useSettings'
import dayjs from '@/utils/dayjs'

/**
 * ## 설정 화면 뷰
 * 
 * **앱의 각종 설정**을 관리하는 화면입니다.
 * 
 * ### 기능
 * - 도시 및 시간대 선택
 * - 테마 모드 설정
 * - 기기 시간대 자동 설정 (위치 권한 없음)
 * - 설정 저장 및 적용
 * 
 * @since 1.0.0
 */

const { currentLocation, getSupportedCities, getCurrentLocation, getTimezoneByCity, getUtcOffset, getCityDisplayName, getCityKoreanName } = useLocation()

const router = useRouter()

// 도시 선택의 '자동' 값: 저장된 도시 없이 기기 시간대를 따름
const AUTO_CITY = '__auto__'
const { setThemeMode } = useTheme()
const { 
  settings, 
  loadSettings, 
  setAnimationIntensity: setAnimationLevel,
  enablePerformanceMode: activatePerformanceMode 
} = useSettings()

// undefined여야 선택 칸에 안내 문구(placeholder)가 보임
const selectedCity = ref<string | undefined>(undefined)
const selectedTheme = ref<'light' | 'dark' | 'system'>('system')
const isLocationLoading = ref(false)
const isSaving = ref(false)

// 애니메이션 설정 - useSettings를 통해 관리
const backgroundEffectsEnabled = computed({
  get: () => settings.value.backgroundEffectsEnabled,
  set: (value) => settings.value.backgroundEffectsEnabled = value
})
const backgroundEffect = computed({
  get: () => settings.value.backgroundEffect,
  set: (value) => settings.value.backgroundEffect = value
})
const animationIntensity = computed({
  get: () => settings.value.animationIntensity,
  set: (value) => setAnimationLevel(value)
})

const previewText = computed(() => currentCityDisplay.value)

const previewTime = computed(() => dayjs().tz(currentTimezone.value).format('HH:mm'))

const cityOptions = computed(() => {
  const deviceCity = currentLocation.value?.city
  const autoLabel = deviceCity
    ? `자동 · 이 기기 시간대 (${getCityKoreanName(deviceCity)})`
    : '자동 · 이 기기 시간대'
  return [
    { value: AUTO_CITY, label: autoLabel },
    ...getSupportedCities().map(city => ({
      value: city.name,
      label: `${getCityDisplayName(city.name)} UTC${getUtcOffset(city.timezone)}`
    }))
  ]
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

const isAutoCity = computed(() => !selectedCity.value || selectedCity.value === AUTO_CITY)
const currentCity = computed(() => isAutoCity.value
  ? (currentLocation.value?.city || 'Seoul')
  : selectedCity.value!)
const currentTimezone = computed(() => isAutoCity.value
  ? (currentLocation.value?.timezone || getTimezoneByCity('Seoul'))
  : getTimezoneByCity(currentCity.value))
const currentOffset = computed(() => getUtcOffset(currentTimezone.value))
const currentCityDisplay = computed(() => getCityKoreanName(currentCity.value))

/**
 * ## 기기 시간대 따르기
 * 
 * **기기 시간대**를 따르도록 도시 선택을 "자동"으로 바꿉니다 (GPS·위치 권한 불필요).
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
      selectedCity.value = AUTO_CITY
      message.success(`이 기기 시간대(${getCityKoreanName(location.city)})를 따릅니다. 저장을 눌러 적용하세요.`)
    } else {
      message.error('이 기기의 시간대를 확인할 수 없습니다. 도시를 직접 골라 주세요.')
    }
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
    // 도시 저장 ('자동'이면 저장된 도시를 지워 기기 시간대를 따름)
    // selectedTimezone은 예전 버전의 고정 오프셋 값이라 더는 쓰지 않음
    localStorage.removeItem('selectedTimezone')
    if (isAutoCity.value) {
      localStorage.removeItem('selectedCity')
    } else {
      localStorage.setItem('selectedCity', selectedCity.value!)
    }
    
    // 테마 설정 저장 및 적용
    setThemeMode(selectedTheme.value)
    
    // 애니메이션 설정 저장
    localStorage.setItem('backgroundEffectsEnabled', String(backgroundEffectsEnabled.value))
    localStorage.setItem('animationIntensity', animationIntensity.value)
    
    message.success('설정이 저장되었습니다.')
    
    // 잠시 후 홈 화면으로 이동 (history.back은 직접 들어온 경우 앱 밖으로 나갈 수 있음)
    setTimeout(() => {
      router.push('/')
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
  // 저장된 도시가 없으면 '자동'(기기 시간대)
  selectedCity.value = localStorage.getItem('selectedCity') || AUTO_CITY
  
  // 저장된 테마 모드 로드
  const savedTheme = localStorage.getItem('theme-mode') as 'light' | 'dark' | 'system'
  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
}

onMounted(() => {
  loadSettings() // useSettings의 loadSettings 사용
  loadUserSettings()
  getCurrentLocation() // '자동' 항목에 기기 시간대 도시를 표시
})
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
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
  min-height: calc(100vh - 64px);
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
  --flap-w: 1.6rem;
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
    min-height: calc(100vh - 64px);
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