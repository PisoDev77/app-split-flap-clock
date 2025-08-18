<template>
  <div class="animated-background" :class="backgroundClass">
    <!-- 그라디언트 배경 레이어 -->
    <div class="gradient-layer" :style="gradientStyle"></div>
    
    <!-- 파티클 효과 레이어 -->
    <div v-if="showParticles" class="particles-layer">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :style="particle.style"
      ></div>
    </div>
    
    <!-- 시간 기반 오버레이 -->
    <div class="time-overlay" :style="timeOverlayStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

/**
 * ## 애니메이션 배경 컴포넌트
 * 
 * **시간대별 배경 효과**와 파티클 애니메이션을 제공합니다.
 * 
 * ### 기능
 * - 시간대별 색상 변화 (새벽, 낮, 저녁, 밤)
 * - 부드러운 그라디언트 애니메이션
 * - 선택적 파티클 효과
 * - 다크/라이트 테마 지원
 * - 성능 최적화된 CSS 애니메이션
 * 
 * @since 1.0.0
 */

interface Particle {
  id: number
  style: {
    left: string
    animationDelay: string
    animationDuration: string
    opacity: number
  }
}

interface Props {
  enabled?: boolean
  showParticles?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  showParticles: true,
  intensity: 'medium'
})

const { isDarkMode } = useTheme()

const currentHour = ref(new Date().getHours())
const particles = ref<Particle[]>([])

let animationFrameId: number | null = null
let timeUpdateInterval: NodeJS.Timeout | null = null

/**
 * ## 시간대별 배경 클래스 계산
 * 
 * **현재 시간**에 따라 적절한 배경 클래스를 반환합니다.
 * 
 * @returns {string} **배경 클래스명**
 */
const backgroundClass = computed(() => {
  if (!props.enabled) return 'background-disabled'
  
  const hour = currentHour.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  
  let timeClass = ''
  if (hour >= 5 && hour < 12) {
    timeClass = 'morning'
  } else if (hour >= 12 && hour < 17) {
    timeClass = 'afternoon'
  } else if (hour >= 17 && hour < 21) {
    timeClass = 'evening'
  } else {
    timeClass = 'night'
  }
  
  return `background-${timeClass} background-${theme} intensity-${props.intensity}`
})

/**
 * ## 동적 그라디언트 스타일 계산
 * 
 * **시간과 테마**에 따른 동적 그라디언트를 생성합니다.
 * 
 * @returns {object} **CSS 스타일 객체**
 */
const gradientStyle = computed(() => {
  if (!props.enabled) return {}
  
  const hour = currentHour.value
  const isDark = isDarkMode.value
  
  // 시간대별 기본 색상 정의
  const timeColors = {
    morning: isDark 
      ? ['#0f172a', '#1e293b', '#334155'] 
      : ['#f0f9ff', '#e0f2fe', '#bae6fd'],
    afternoon: isDark 
      ? ['#1e293b', '#334155', '#475569'] 
      : ['#fefce8', '#fef3c7', '#fed7aa'],
    evening: isDark 
      ? ['#451a03', '#7c2d12', '#ea580c'] 
      : ['#fff7ed', '#fed7aa', '#fdba74'],
    night: isDark 
      ? ['#0c0a09', '#1c1917', '#292524'] 
      : ['#f8fafc', '#f1f5f9', '#e2e8f0']
  }
  
  let colors = timeColors.night
  if (hour >= 5 && hour < 12) colors = timeColors.morning
  else if (hour >= 12 && hour < 17) colors = timeColors.afternoon
  else if (hour >= 17 && hour < 21) colors = timeColors.evening
  
  return {
    background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 20s ease infinite'
  }
})

/**
 * ## 시간 오버레이 스타일 계산
 * 
 * **현재 시간**에 따른 오버레이 투명도를 계산합니다.
 * 
 * @returns {object} **CSS 스타일 객체**
 */
const timeOverlayStyle = computed(() => {
  if (!props.enabled) return { opacity: 0 }
  
  const hour = currentHour.value
  let opacity = 0.1
  
  // 밤 시간대에는 더 어둡게
  if (hour >= 21 || hour < 6) {
    opacity = isDarkMode.value ? 0.3 : 0.15
  }
  
  return {
    opacity,
    background: isDarkMode.value 
      ? 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
  }
})

/**
 * ## 파티클 생성
 * 
 * **무작위 파티클들**을 생성하여 배경 효과를 만듭니다.
 * 
 * @example
 * ```typescript
 * generateParticles()
 * ```
 */
const generateParticles = (): void => {
  if (!props.showParticles) return
  
  const particleCount = {
    low: 15,
    medium: 25,
    high: 40
  }[props.intensity]
  
  particles.value = Array.from({ length: particleCount }, (_, index) => ({
    id: index,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${15 + Math.random() * 10}s`,
      opacity: 0.1 + Math.random() * 0.3
    }
  }))
}

/**
 * ## 시간 업데이트
 * 
 * **현재 시간을 업데이트**하여 배경 효과를 갱신합니다.
 */
const updateTime = (): void => {
  currentHour.value = new Date().getHours()
}

/**
 * ## 애니메이션 루프 시작
 * 
 * **부드러운 배경 애니메이션**을 위한 requestAnimationFrame 루프를 시작합니다.
 */
const startAnimationLoop = (): void => {
  if (!props.enabled) return
  
  const animate = () => {
    // 여기에 추가적인 실시간 애니메이션 로직 추가 가능
    animationFrameId = requestAnimationFrame(animate)
  }
  
  animate()
}

/**
 * ## 애니메이션 루프 중지
 * 
 * **실행 중인 애니메이션 루프**를 중지합니다.
 */
const stopAnimationLoop = (): void => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Props 변경 감지
watch(() => props.enabled, (enabled) => {
  if (enabled) {
    generateParticles()
    startAnimationLoop()
  } else {
    stopAnimationLoop()
  }
})

watch(() => props.showParticles, () => {
  generateParticles()
})

onMounted(() => {
  // 접근성: reduced motion 체크
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (!prefersReducedMotion && props.enabled) {
    generateParticles()
    startAnimationLoop()
  }
  
  // 매분마다 시간 업데이트
  timeUpdateInterval = setInterval(updateTime, 60000)
  
  // reduced motion 설정 변경 감지
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      // reduced motion 활성화됨
      stopAnimationLoop()
      particles.value = []
    } else if (props.enabled) {
      // reduced motion 비활성화됨
      generateParticles()
      startAnimationLoop()
    }
  }
  
  mediaQuery.addEventListener('change', handleMotionPreferenceChange)
  
  // cleanup에서 리스너 제거를 위해 저장
  const cleanup = () => {
    mediaQuery.removeEventListener('change', handleMotionPreferenceChange)
    stopAnimationLoop()
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval)
    }
  }
  
  onUnmounted(cleanup)
})
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.gradient-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  transition: all 2s ease;
}

.particles-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: float linear infinite;
  top: 100%;
}

.time-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 2s ease;
  pointer-events: none;
}

/* 시간대별 배경 스타일 */
.background-morning.background-light .gradient-layer {
  background: linear-gradient(45deg, #f0f9ff, #e0f2fe, #bae6fd);
}

.background-morning.background-dark .gradient-layer {
  background: linear-gradient(45deg, #0f172a, #1e293b, #334155);
}

.background-afternoon.background-light .gradient-layer {
  background: linear-gradient(45deg, #fefce8, #fef3c7, #fed7aa);
}

.background-afternoon.background-dark .gradient-layer {
  background: linear-gradient(45deg, #1e293b, #334155, #475569);
}

.background-evening.background-light .gradient-layer {
  background: linear-gradient(45deg, #fff7ed, #fed7aa, #fdba74);
}

.background-evening.background-dark .gradient-layer {
  background: linear-gradient(45deg, #451a03, #7c2d12, #ea580c);
}

.background-night.background-light .gradient-layer {
  background: linear-gradient(45deg, #f8fafc, #f1f5f9, #e2e8f0);
}

.background-night.background-dark .gradient-layer {
  background: linear-gradient(45deg, #0c0a09, #1c1917, #292524);
}

/* 강도별 설정 */
.intensity-low .gradient-layer {
  opacity: 0.3;
}

.intensity-medium .gradient-layer {
  opacity: 0.5;
}

.intensity-high .gradient-layer {
  opacity: 0.7;
}

/* 비활성화 상태 */
.background-disabled {
  display: none;
}

/* 애니메이션 정의 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* 다크 테마 파티클 */
.background-dark .particle {
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
}

/* 접근성: 움직임 줄이기 */
@media (prefers-reduced-motion: reduce) {
  .animated-background,
  .gradient-layer,
  .particle,
  .time-overlay {
    animation: none !important;
    transition: none !important;
  }
  
  .particles-layer {
    display: none;
  }
}

/* 성능 최적화 */
.animated-background {
  will-change: transform;
  transform: translateZ(0);
}

.gradient-layer {
  will-change: background-position;
}

.particle {
  will-change: transform;
}</style>