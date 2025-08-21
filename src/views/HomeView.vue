<template>
  <div class="home-view">
    <!-- 애니메이션 배경 -->
    <AnimatedBackground 
      :enabled="backgroundEffectsEnabled"
      :show-particles="showParticles"
      :intensity="animationIntensity"
    />
    
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-content">
          <h1 class="app-title">Split Flap Clock</h1>
          <div class="header-controls">
            <a-dropdown :trigger="['click']" placement="bottomRight">
              <a-button 
                type="text" 
                :icon="h(MenuOutlined)"
                class="menu-btn"
                aria-label="네비게이션 메뉴 열기"
              >
                메뉴
              </a-button>
              <template #overlay>
                <a-menu role="menu" aria-label="네비게이션 메뉴">
                  <a-menu-item key="about" @click="$router.push('/about')" role="menuitem">
                    <template #icon><InfoCircleOutlined aria-hidden="true" /></template>
                    소개
                  </a-menu-item>
                  <a-menu-item key="guide" @click="$router.push('/guide')" role="menuitem">
                    <template #icon><BookOutlined aria-hidden="true" /></template>
                    사용법 가이드
                  </a-menu-item>
                  <a-menu-item key="timezone" @click="$router.push('/timezone')" role="menuitem">
                    <template #icon><GlobalOutlined aria-hidden="true" /></template>
                    세계 시간대
                  </a-menu-item>
                  <a-menu-item key="faq" @click="$router.push('/faq')" role="menuitem">
                    <template #icon><QuestionCircleOutlined aria-hidden="true" /></template>
                    자주 묻는 질문
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="settings" @click="$router.push('/settings')" role="menuitem">
                    <template #icon><SettingOutlined aria-hidden="true" /></template>
                    설정
                  </a-menu-item>
                  <a-menu-item key="privacy" @click="$router.push('/privacy')" role="menuitem">
                    <template #icon><SafetyCertificateOutlined aria-hidden="true" /></template>
                    개인정보처리방침
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="clock-container" role="main" aria-label="시계 표시 영역">
          <div class="city-display">
            <div class="city-container">
              <SplitFlapDisplay :text="cityName" aria-label="현재 도시" />
              <span class="city-label">현재 위치</span>
            </div>
          </div>
          
          <div class="time-display" role="timer" aria-live="polite" aria-label="현재 시간">
            <div class="time-units">
              <SplitFlapDisplay :text="hours" aria-label="시간" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="minutes" aria-label="분" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="seconds" aria-label="초" />
            </div>
          </div>
          
          <div class="date-info">
            <a-typography-text class="date-text" role="text" aria-label="현재 날짜">
              {{ currentDate }}
            </a-typography-text>
          </div>
        </div>
      </a-layout-content>
      
      <AppFooter />
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, h } from 'vue'
import { Layout as ALayout, Button as AButton, Dropdown as ADropdown, Menu as AMenu } from 'ant-design-vue'
import { 
  SettingOutlined, 
  MenuOutlined, 
  InfoCircleOutlined, 
  BookOutlined, 
  GlobalOutlined, 
  QuestionCircleOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons-vue'
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
 * - 사용자 위치 기반 도시명 표시
 * - 설정 페이지 네비게이션
 * - 반응형 레이아웃
 * 
 * @since 1.0.0
 */


const { currentLocation, getCurrentLocation, getCityKoreanName } = useLocation()
const { currentTime: time, startTimer, stopTimer } = useTime()

// 배경 효과 설정
// 설정 관리 컴포저블 사용
const { settings, loadSettings, effectsEnabled } = useSettings()

const backgroundEffectsEnabled = computed(() => settings.value.backgroundEffectsEnabled)
const showParticles = computed(() => settings.value.showParticles)
const animationIntensity = computed(() => settings.value.animationIntensity)

const cityName = computed(() => {
  const city = localStorage.getItem('selectedCity')
  const displayCity = city || currentLocation.value?.city || 'LOADING...'
  return displayCity === 'LOADING...' ? displayCity : getCityKoreanName(displayCity)
})


// 시간을 시, 분, 초로 분리
const hours = computed(() => {
  if (!time.value) return '00'
  
  const timezone = localStorage.getItem('selectedTimezone')
  if (timezone) {
    return dayjs(time.value).utcOffset(timezone).format('HH')
  }
  
  return dayjs(time.value).format('HH')
})

const minutes = computed(() => {
  if (!time.value) return '00'
  
  const timezone = localStorage.getItem('selectedTimezone')
  if (timezone) {
    return dayjs(time.value).utcOffset(timezone).format('mm')
  }
  
  return dayjs(time.value).format('mm')
})

const seconds = computed(() => {
  if (!time.value) return '00'
  
  const timezone = localStorage.getItem('selectedTimezone')
  if (timezone) {
    return dayjs(time.value).utcOffset(timezone).format('ss')
  }
  
  return dayjs(time.value).format('ss')
})

const currentDate = computed(() => {
  if (!time.value) return ''
  
  const timezone = localStorage.getItem('selectedTimezone')
  const date = timezone 
    ? dayjs(time.value).utcOffset(timezone)
    : dayjs(time.value)
    
  return date.format('YYYY년 M월 D일 dddd')
})

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
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  height: 100%;
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

.menu-btn {
  color: var(--color-accent-fg);
  border: none;
}

.menu-btn:hover {
  background: var(--color-canvas-subtle);
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: transparent;
  position: relative;
  z-index: 10; /* 배경보다 앞에 표시 */
}

.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background: rgba(var(--color-canvas-default-rgb), 0.85);
  backdrop-filter: blur(12px);
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
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: nowrap; /* 강제로 한 줄 유지 */
  white-space: nowrap; /* 줄바꿈 방지 */
}


.time-separator {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-fg-default);
  font-family: 'Courier New', monospace;
  margin: 0 0.25rem;
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
  
  .time-units {
    gap: 0.5rem;
  }
  
  .time-separator {
    font-size: 3rem;
    margin: 0 0.25rem;
  }
  
  .time-label {
    font-size: 0.75rem;
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
  
  .time-units {
    gap: 0.25rem;
    justify-content: center;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    padding: 0 8px;
  }
  
  .time-separator {
    font-size: 1.4rem;
    margin: 0 0.1rem;
    flex-shrink: 0;
    line-height: 1;
  }
  
  .time-unit {
    flex-shrink: 0;
    min-width: 0;
  }
  
  
  .date-text {
    font-size: 0.9rem;
  }
}

/* iPhone SE 및 유사 디바이스 (375px 이하) */
@media (max-width: 375px) {
  .time-units {
    gap: 0.2rem;
    max-width: 100vw;
    padding: 0 12px;
  }
  
  .time-separator {
    font-size: 1.3rem;
    margin: 0 0.08rem;
  }
}

/* 매우 작은 화면 (320px 이하) */
@media (max-width: 320px) {
  .time-units {
    gap: 0.15rem;
    max-width: 100vw;
    padding: 0 8px;
  }
  
  .time-separator {
    font-size: 1.2rem;
    margin: 0 0.05rem;
  }
  
}

/* 극소형 화면 (280px 이하) */
@media (max-width: 280px) {
  .time-units {
    gap: 0.1rem;
    max-width: 100vw;
    padding: 0 6px;
    transform: scale(0.9);
    transform-origin: center;
  }
  
  .time-separator {
    font-size: 1rem;
    margin: 0 0.025rem;
  }
  
}

/* 초극소형 화면 (240px 이하) */
@media (max-width: 240px) {
  .time-units {
    gap: 0.05rem;
    max-width: 100vw;
    padding: 0 8px;
    transform: scale(0.8);
    transform-origin: center;
  }
  
  .time-separator {
    font-size: 0.9rem;
    margin: 0 0.02rem;
  }
  
}</style>