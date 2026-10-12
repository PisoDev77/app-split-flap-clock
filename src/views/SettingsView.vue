<template>
  <div class="settings-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton 
            type="text" 
            :icon="ArrowLeftOutlined"
            class="back-btn"
            :aria-label="t.backLabel"
            @click="goBack"
          >
            {{ t.back }}
          </UiButton>
          <h1 class="page-title">{{ t.title }}</h1>
          <div class="header-spacer" />
        </div>
      </header>
      
      <div class="content">
        <div class="settings-container" role="main">
          <UiCard class="settings-card" :title="t.cardCity">
            <div class="ui-stack settings-form">
              <!-- 도시 선택 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.city }}
                </h3>
                <UiSelect
                  v-model:value="selectedCity"
                  :aria-label="t.city"
                  :placeholder="t.cityPlaceholder"
                  class="setting-input"
                  :options="cityOptions"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.cityDesc }}
                </span>
              </div>

              <!-- 시간대 표시 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.zone }}
                </h3>
                <span class="ui-text timezone-display">
                  UTC{{ currentOffset }} ({{ currentCityDisplay }})
                </span>
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.zoneDesc }}
                </span>
              </div>

              <!-- 기기 시간대 자동 설정 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.auto }}
                </h3>
                <UiButton 
                  type="primary" 
                  :loading="isLocationLoading"
                  :icon="EnvironmentOutlined"
                  @click="handleAutoLocation"
                >
                  {{ t.autoBtn }}
                </UiButton>
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.autoDesc }}
                </span>
              </div>
            </div>
          </UiCard>

          <UiCard class="settings-card" :title="t.cardDisplay">
            <div class="ui-stack settings-form">
              <!-- 테마 설정 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.theme }}
                </h3>
                <UiSelect
                  v-model:value="selectedTheme"
                  :aria-label="t.theme"
                  class="setting-input"
                  :options="themeOptions"
                  @change="handleThemeChange"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.themeDesc }}
                </span>
              </div>

              <!-- 시간 표시 방식 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.timeFormat }}
                </h3>
                <UiSelect
                  v-model:value="timeFormat"
                  :aria-label="t.timeFormatLabel"
                  class="setting-input"
                  :options="timeFormatOptions"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.timeFormatDesc }}
                </span>
              </div>

              <!-- 화면 켜두기 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <h3 class="ui-title setting-label">
                      {{ t.wake }}
                    </h3>
                    <span class="ui-text ui-text--secondary setting-description">
                      {{ t.wakeDesc }}
                    </span>
                  </div>
                  <UiSwitch
                    v-model:checked="keepScreenOn"
                    :aria-label="t.wake"
                  />
                </div>
              </div>

              <!-- 테마 미리보기 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.preview }}
                </h3>
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
                        <span class="preview-label">{{ t.previewCity }}</span>
                      </div>
                      <div class="preview-time">
                        <SplitFlapDisplay :text="previewTime" />
                        <span class="preview-label">{{ t.previewTime }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard class="settings-card" :title="t.cardAnim">
            <div class="ui-stack settings-form">
              <!-- 배경 효과 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <h3 class="ui-title setting-label">
                      {{ t.effects }}
                    </h3>
                    <span class="ui-text ui-text--secondary setting-description">
                      {{ t.effectsDesc }}
                    </span>
                  </div>
                  <UiSwitch
                    v-model:checked="backgroundEffectsEnabled"
                    :aria-label="t.effectsOn"
                  />
                </div>
              </div>

              <!-- 배경 효과 종류 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.effectKind }}
                </h3>
                <UiSelect
                  v-model:value="backgroundEffect"
                  :aria-label="t.effectKindLabel"
                  class="setting-input"
                  :options="effectOptions"
                  :disabled="!backgroundEffectsEnabled"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.effectKindDesc }}
                </span>
              </div>

              <!-- 애니메이션 강도 -->
              <div class="setting-item">
                <h3 class="ui-title setting-label">
                  {{ t.intensity }}
                </h3>
                <UiSelect
                  v-model:value="animationIntensity"
                  :aria-label="t.intensity"
                  class="setting-input"
                  :options="intensityOptions"
                  :disabled="!backgroundEffectsEnabled"
                />
                <span class="ui-text ui-text--secondary setting-description">
                  {{ t.intensityDesc }}
                </span>
              </div>

              <!-- 성능 모드 -->
              <div class="setting-item">
                <div class="setting-row">
                  <div class="setting-label-group">
                    <h3 class="ui-title setting-label">
                      {{ t.perf }}
                    </h3>
                    <span class="ui-text ui-text--secondary setting-description">
                      {{ t.perfDesc }}
                    </span>
                  </div>
                  <UiButton 
                    size="small"
                    @click="handlePerformanceModeClick"
                  >
                    {{ t.perfBtn }}
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
              {{ t.save }}
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
import { useGoBack } from '@/composables/useGoBack'
import { useLocale } from '@/composables/useLocale'

const goBack = useGoBack()
const { isEn, lp, pick } = useLocale()

const EFFECT_LABELS_EN: Record<string, string> = {
  particles: '✨ Sparkles', stars: '🌌 Stars & shooting stars', snow: '❄️ Snow', rain: '🌧️ Rain',
  bokeh: '🔆 Bokeh (soft lights)', aurora: '🌈 Aurora', none: 'Gradient only'
}

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', title: '설정',
    cardCity: '시간 및 도시 설정', city: '도시 선택', cityPlaceholder: '도시를 선택하세요', cityDesc: '시간을 표시할 도시를 선택합니다.',
    zone: '현재 시간대', zoneDesc: '선택된 도시의 지금 시간대입니다. 서머타임이 자동으로 반영됩니다.',
    auto: '기기 시간대 자동 설정', autoBtn: '이 기기 시간대 따르기', autoDesc: '위치 권한 없이, 이 기기에 설정된 시간대의 시간을 보여줍니다.',
    cardDisplay: '화면 설정', theme: '테마 모드', themeDesc: '앱의 색상 테마를 선택합니다.',
    timeFormat: '시간 표시', timeFormatLabel: '시간 표시 방식', timeFormatDesc: '12시간이면 날짜 옆에 오전·오후가 함께 나옵니다.',
    wake: '화면 켜두기', wakeDesc: '시계 화면에서 화면이 꺼지지 않게 합니다. 탁상시계로 쓸 때 켜 두세요.',
    preview: '미리보기', previewCity: '도시', previewTime: '시간',
    cardAnim: '애니메이션 설정', effects: '배경 효과', effectsDesc: '시간대별 동적 배경 효과를 활성화합니다.', effectsOn: '배경 효과 켜기',
    effectKind: '효과 종류', effectKindLabel: '배경 효과 종류', effectKindDesc: '배경에 보일 움직임을 고릅니다. 위 미리보기에서 바로 확인할 수 있어요.',
    intensity: '애니메이션 강도', intensityDesc: '애니메이션의 강도를 조절합니다. 높을수록 더 화려합니다.',
    perf: '성능 모드', perfDesc: '저성능 기기를 위해 모든 효과를 비활성화합니다.', perfBtn: '성능 모드 활성화', save: '설정 저장',
    autoOption: (city?: string) => city ? `자동 · 이 기기 시간대 (${city})` : '자동 · 이 기기 시간대',
    h24: '24시간 (13:05)', h12: '12시간 (오후 01:05)',
    themeSystem: '시스템 설정 따름', themeLight: '라이트 모드', themeDark: '다크 모드',
    low: '낮음 (배터리 절약)', medium: '보통 (권장)', high: '높음 (화려함)',
    autoOk: (city: string) => `이 기기 시간대(${city})를 따릅니다. 저장을 눌러 적용하세요.`,
    autoFail: '이 기기의 시간대를 확인할 수 없습니다. 도시를 직접 골라 주세요.',
    perfOk: '성능 모드가 활성화되었습니다.', saved: '설정이 저장되었습니다.', saveFail: '설정 저장에 실패했습니다.'
  },
  en: {
    back: 'Back', backLabel: 'Go back', title: 'Settings',
    cardCity: 'Time & city', city: 'City', cityPlaceholder: 'Choose a city', cityDesc: 'The city whose time the clock shows.',
    zone: 'Current time zone', zoneDesc: 'The current time zone of the selected city. Daylight saving time is applied automatically.',
    auto: 'Use device time zone', autoBtn: 'Follow this device', autoDesc: 'Shows the time of the time zone set on this device. No location permission needed.',
    cardDisplay: 'Display', theme: 'Theme', themeDesc: 'Choose the color theme.',
    timeFormat: 'Time format', timeFormatLabel: 'Time format', timeFormatDesc: 'With 12-hour time, AM/PM appears next to the date.',
    wake: 'Keep screen on', wakeDesc: 'Stops the screen from turning off on the clock. Turn it on when you use it as a desk clock.',
    preview: 'Preview', previewCity: 'City', previewTime: 'Time',
    cardAnim: 'Animation', effects: 'Background effects', effectsDesc: 'Turns on moving background effects.', effectsOn: 'Turn on background effects',
    effectKind: 'Effect', effectKindLabel: 'Background effect', effectKindDesc: 'Choose what moves in the background. You can see it in the preview above.',
    intensity: 'Animation intensity', intensityDesc: 'Higher is more vivid.',
    perf: 'Performance mode', perfDesc: 'Turns off all effects for slower devices.', perfBtn: 'Turn on performance mode', save: 'Save settings',
    autoOption: (city?: string) => city ? `Auto · this device's time zone (${city})` : "Auto · this device's time zone",
    h24: '24-hour (13:05)', h12: '12-hour (01:05 PM)',
    themeSystem: 'Follow system', themeLight: 'Light', themeDark: 'Dark',
    low: 'Low (saves battery)', medium: 'Medium (recommended)', high: 'High (vivid)',
    autoOk: (city: string) => `Following this device's time zone (${city}). Tap Save to apply.`,
    autoFail: "Couldn't read this device's time zone. Please choose a city.",
    perfOk: 'Performance mode is on.', saved: 'Settings saved.', saveFail: "Couldn't save settings."
  }
})

// 도시 이름: 한국어판은 '서울', 영어판은 'Seoul'
const cityLabelOf = (city: string) => isEn.value ? city : getCityKoreanName(city)

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
const timeFormat = computed({
  get: () => settings.value.timeFormat,
  set: (value) => { settings.value.timeFormat = value as '12h' | '24h' }
})
const timeFormatOptions = computed(() => [
  { value: '24h', label: t.value.h24 },
  { value: '12h', label: t.value.h12 }
])
const keepScreenOn = computed({
  get: () => settings.value.keepScreenOn,
  set: (value) => { settings.value.keepScreenOn = value }
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
  return [
    { value: AUTO_CITY, label: t.value.autoOption(deviceCity ? cityLabelOf(deviceCity) : undefined) },
    ...getSupportedCities().map(city => ({
      value: city.name,
      label: `${isEn.value ? city.name : getCityDisplayName(city.name)} UTC${getUtcOffset(city.timezone)}`
    }))
  ]
})

const themeOptions = computed(() => [
  { value: 'system', label: t.value.themeSystem },
  { value: 'light', label: t.value.themeLight },
  { value: 'dark', label: t.value.themeDark }
])

const intensityOptions = computed(() => [
  { value: 'low', label: t.value.low },
  { value: 'medium', label: t.value.medium },
  { value: 'high', label: t.value.high }
])

const effectOptions = computed(() => isEn.value
  ? BACKGROUND_EFFECT_OPTIONS.map(option => ({ ...option, label: EFFECT_LABELS_EN[option.value] }))
  : BACKGROUND_EFFECT_OPTIONS)

const isAutoCity = computed(() => !selectedCity.value || selectedCity.value === AUTO_CITY)
const currentCity = computed(() => isAutoCity.value
  ? (currentLocation.value?.city || 'Seoul')
  : selectedCity.value!)
const currentTimezone = computed(() => isAutoCity.value
  ? (currentLocation.value?.timezone || getTimezoneByCity('Seoul'))
  : getTimezoneByCity(currentCity.value))
const currentOffset = computed(() => getUtcOffset(currentTimezone.value))
const currentCityDisplay = computed(() => isEn.value ? currentCity.value.toUpperCase() : getCityKoreanName(currentCity.value))

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
      message.success(t.value.autoOk(cityLabelOf(location.city)))
    } else {
      message.error(t.value.autoFail)
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
  message.success(t.value.perfOk)
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
    
    message.success(t.value.saved)
    
    // 잠시 후 홈 화면으로 이동 (history.back은 직접 들어온 경우 앱 밖으로 나갈 수 있음)
    setTimeout(() => {
      router.push(lp('/'))
    }, 1000)
    
  } catch (error) {
    console.error('설정 저장 실패:', error)
    message.error(t.value.saveFail)
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