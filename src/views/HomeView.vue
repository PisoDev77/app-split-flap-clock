<template>
  <div class="home-view">
    <!-- 애니메이션 배경 -->
    <AnimatedBackground 
      :enabled="backgroundEffectsEnabled"
      :effect="backgroundEffect"
      :intensity="animationIntensity"
    />
    
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <h1 class="app-title">Split Flap Clock</h1>
          <div class="header-controls">
            <UiButton 
              type="text" 
              :icon="SettingOutlined"
              class="settings-btn"
              aria-label="설정 페이지 열기"
              @click="$router.push('/settings')"
            />
          </div>
        </div>
      </header>
      
      <div class="content">
        <div class="clock-container" role="main" aria-label="시계 표시 영역">
          <div class="city-display" :style="cityFlapStyle">
            <div class="city-container">
              <SplitFlapDisplay :text="cityName" label="도시" />
              <span class="city-label">{{ cityLabel }}</span>
            </div>
          </div>
          
          <div class="time-display" role="timer" aria-label="현재 시간">
            <div class="time-units">
              <SplitFlapDisplay :text="hours" label="시" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="minutes" label="분" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="seconds" label="초" />
            </div>
          </div>
          
          <div class="date-info">
            <span class="ui-text date-text" role="text" aria-label="현재 날짜">
              {{ currentDate }}
            </span>
          </div>
        </div>
      </div>
      
      <AppFooter class="desktop-only-footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useLocation } from '@/composables/useLocation'
import { useTime } from '@/composables/useTime'
import { useSettings } from '@/composables/useSettings'
import dayjs from '@/utils/dayjs'

/**
 * ## 홈 화면 뷰
 * 
 * **메인 시계 화면**을 표시하는 뷰 컴포넌트입니다.
 * 
 * ### 기능
 * - 현재 시간 실시간 표시
 * - 선택한 도시 또는 기기 시간대 기준 도시명 표시
 * - 설정 페이지 네비게이션
 * - 반응형 레이아웃
 * 
 * @since 1.0.0
 */


const { currentLocation, getCurrentLocation, getCityKoreanName, getTimezoneByCity } = useLocation()
const { currentTime: time, startTimer, stopTimer } = useTime()

// 배경 효과 설정
// 설정 관리 컴포저블 사용
const { settings, loadSettings } = useSettings()

const backgroundEffectsEnabled = computed(() => settings.value.backgroundEffectsEnabled)
const backgroundEffect = computed(() => settings.value.backgroundEffect)
const animationIntensity = computed(() => settings.value.animationIntensity)

// 설정에서 고른 도시 (없으면 이 기기 시간대를 따름)
const savedCity = localStorage.getItem('selectedCity')

const cityName = computed(() => {
  const city = savedCity || currentLocation.value?.city
  return city ? getCityKoreanName(city) : 'LOADING...'
})

const cityLabel = computed(() => savedCity ? '선택한 도시' : '현재 위치')

// IANA 시간대 → 서머타임 자동 반영
const timezone = computed(() => {
  if (savedCity) return getTimezoneByCity(savedCity)
  return currentLocation.value?.timezone
})

// 도시 이름이 길면 칸을 줄여 한 줄에 들어가게 함
const cityFlapStyle = computed(() => {
  const length = Math.max(cityName.value.length, 1)
  return {
    '--flap-w': `min(clamp(1.75rem, calc(11vw - 2px), 4.5rem), calc((100vw - 6rem) / ${length}))`
  }
})

const zonedTime = computed(() => {
  if (!time.value) return null
  return timezone.value ? dayjs(time.value).tz(timezone.value) : dayjs(time.value)
})

// 시간을 시, 분, 초로 분리
const hours = computed(() => zonedTime.value?.format('HH') ?? '00')
const minutes = computed(() => zonedTime.value?.format('mm') ?? '00')
const seconds = computed(() => zonedTime.value?.format('ss') ?? '00')
const currentDate = computed(() => zonedTime.value?.format('YYYY년 M월 D일 dddd') ?? '')

onMounted(async () => {
  loadSettings() // 설정 로드
  await getCurrentLocation()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Hide footer on mobile devices to prevent covering clock */
@media (max-width: 768px) {
  .desktop-only-footer {
    display: none;
  }
}

.layout {
  position: relative;
  z-index: 1; /* 고정된 배경(z-index 0) 위에 내용 표시 */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: transparent;
}

.header {
  background: rgba(var(--color-canvas-default-rgb), 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border-default);
  height: 64px;
  padding: 0 24px;
  box-shadow: var(--shadow-small);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  color: var(--color-fg-default);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn {
  color: var(--color-accent-fg);
  border: none;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: var(--color-canvas-subtle);
  color: var(--color-accent-fg);
  transform: rotate(90deg);
}

/* Ensure settings button is visible and accessible on all screen sizes */
@media (max-width: 480px) {
  .settings-btn {
    font-size: 16px;
    width: 36px;
    height: 36px;
  }
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: transparent;
  position: relative;
  z-index: 1; /* 배경보다 앞에 표시하되 드롭다운보다는 뒤에 */
}

.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  /* 반투명 유리: 뒤의 배경 효과가 은은하게 비침 */
  background: rgba(var(--color-canvas-default-rgb), 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 20px;
  border: 1px solid rgba(var(--color-border-default-rgb), 0.3);
  box-shadow: var(--shadow-large);
}

.city-display {
  animation: fadeInUp 0.6s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 0.6s ease-out;
  -moz-animation: fadeInUp 0.6s ease-out;
}

.city-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.city-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-fg-muted);
  text-align: center;
}

/* 모바일에서 도시 라벨 크기 증가 */
@media (max-width: 768px) {
  .city-label {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .city-label {
    font-size: 0.95rem;
  }
}

.time-display {
  animation: fadeInUp 0.8s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 0.8s ease-out;
  -moz-animation: fadeInUp 0.8s ease-out;
}

.time-units {
  display: flex;
  align-items: center;
  gap: clamp(0.15rem, 1vw, 0.5rem);
  justify-content: center;
  flex-wrap: nowrap; /* 강제로 한 줄 유지 */
  white-space: nowrap; /* 줄바꿈 방지 */
}


.time-separator {
  font-size: clamp(1.25rem, 6vw, 3rem);
  font-weight: bold;
  color: var(--color-fg-default);
  font-family: 'Courier New', monospace;
  margin: 0 clamp(0.05rem, 0.8vw, 0.25rem);
  flex-shrink: 0;
  line-height: 1;
  opacity: 0.7;
  animation: pulse 2s ease-in-out infinite;
  /* 브라우저 호환성 */
  -webkit-animation: pulse 2s ease-in-out infinite;
  -moz-animation: pulse 2s ease-in-out infinite;
}


@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

@-webkit-keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

@-moz-keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

.date-info {
  animation: fadeInUp 1s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 1s ease-out;
  -moz-animation: fadeInUp 1s ease-out;
}

.date-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-fg-muted);
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
    -webkit-transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    -webkit-transform: translateY(0);
  }
}

@-webkit-keyframes fadeInUp {
  from {
    opacity: 0;
    -webkit-transform: translateY(30px);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
  }
}

@-moz-keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .content {
    padding: 16px;
  }
  
  .clock-container {
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .date-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .content {
    padding: 12px;
  }
  
  .clock-container {
    gap: 1rem;
    padding: 1rem;
  }
  
  .date-text {
    font-size: 0.9rem;
  }
}
</style>