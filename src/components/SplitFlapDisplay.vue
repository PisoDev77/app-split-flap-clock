<template>
  <div 
    class="split-flap-display"
    role="img" 
    :aria-label="`분할 플랩 디스플레이: ${props.text}`"
  >
    <div class="flap-container">
      <div 
        v-for="(char, index) in displayChars" 
        :key="index"
        class="flap-unit"
        :class="{ 'flipping': isFlipping[index] }"
        :aria-hidden="true"
      >
        <div class="flap-top">
          <span class="flap-text flap-text-top">{{ char }}</span>
        </div>
        <div class="flap-bottom">
          <span class="flap-text flap-text-bottom">{{ char }}</span>
        </div>
      </div>
    </div>
    
    <!-- 스크린 리더를 위한 숨겨진 텍스트 -->
    <span class="sr-only">{{ props.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * ## 분할 플랩 디스플레이 컴포넌트
 * 
 * **전통적인 분할 플랩 보드**와 같은 애니메이션으로 텍스트를 표시합니다.
 * 
 * ### 기능
 * - 문자별 플립 애니메이션
 * - 자동 크기 조정
 * - 커스텀 문자 집합 지원
 * 
 * @since 1.0.0
 */

interface Props {
  text: string
  flipDuration?: number
  characterSet?: string[]
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  flipDuration: 600,
  respectReducedMotion: true,
  characterSet: () => [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ' '
  ]
})

const currentText = ref('')
const isFlipping = ref<boolean[]>([])
const displayChars = computed(() => currentText.value.split(''))

// 이전 텍스트를 저장해서 플립 애니메이션에 사용
const previousText = ref('')

let flipTimeout: NodeJS.Timeout | null = null


/**
 * ## 텍스트 업데이트 및 플립 애니메이션
 * 
 * **새로운 텍스트**로 변경될 때 각 문자에 대해 플립 애니메이션을 실행합니다.
 * 
 * @param {string} newText - **표시할 새 텍스트**
 * 
 * @example
 * ```typescript
 * updateText('SEOUL 15:30:45')
 * ```
 */
const updateText = (newText: string) => {
  // 접근성: reduced motion 체크
  const prefersReducedMotion = props.respectReducedMotion && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    // 애니메이션 없이 즉시 텍스트 변경
    previousText.value = currentText.value
    currentText.value = newText
    isFlipping.value = new Array(newText.length).fill(false)
    return
  }

  // 이전 텍스트 저장
  previousText.value = currentText.value

  const paddedNewText = newText.padEnd(Math.max(currentText.value.length, newText.length))
  const paddedCurrentText = currentText.value.padEnd(paddedNewText.length)
  
  // 변경이 필요한 인덱스들을 미리 계산
  const changedIndices: number[] = []
  paddedCurrentText.split('').forEach((char, index) => {
    if (char !== paddedNewText[index]) {
      changedIndices.push(index)
    }
  })
  
  // 스태거 효과를 위한 지연 시간 계산
  changedIndices.forEach((index, changeIndex) => {
    const staggerDelay = changeIndex * 50 // 50ms씩 지연
    
    setTimeout(() => {
      isFlipping.value[index] = true
      
      // 애니메이션 완료 후 플립 상태 해제 및 텍스트 변경
      setTimeout(() => {
        // 새로운 텍스트로 변경
        const newChars = currentText.value.split('')
        newChars[index] = paddedNewText[index] || ' '
        currentText.value = newChars.join('').trimEnd()
        
        // 플립 상태 해제
        isFlipping.value[index] = false
      }, props.flipDuration)
    }, staggerDelay)
  })
  
  // 길이가 변경된 경우 처리
  if (paddedNewText.length !== currentText.value.length) {
    const totalStaggerTime = changedIndices.length * 50 + props.flipDuration
    setTimeout(() => {
      currentText.value = newText
      isFlipping.value = new Array(newText.length).fill(false)
    }, totalStaggerTime)
  }
}

watch(
  () => props.text,
  (newText, oldText) => {
    // 실제로 변경된 경우에만 애니메이션 실행
    if (newText === oldText) return
    
    if (flipTimeout) {
      clearTimeout(flipTimeout)
    }
    
    // 초 단위 변경의 경우 즉시 애니메이션 실행
    const isSecondsChange = newText.slice(0, -2) === oldText?.slice(0, -2)
    const delay = isSecondsChange ? 50 : 100
    
    flipTimeout = setTimeout(() => updateText(newText), delay)
  },
  { immediate: true }
)

onMounted(() => {
  currentText.value = props.text
  previousText.value = props.text
  isFlipping.value = new Array(props.text.length).fill(false)
})

onUnmounted(() => {
  if (flipTimeout) {
    clearTimeout(flipTimeout)
  }
})
</script>

<style scoped>
.split-flap-display {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  user-select: none;
}

.flap-container {
  display: flex;
  gap: 1px;
  perspective: 1000px;
}

.flap-unit {
  position: relative;
  width: 4.5rem;
  height: 6.5rem;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transform-style: preserve-3d;
  /* Firefox 호환성 */
  -moz-transform-style: preserve-3d;
  /* Safari 호환성 */
  -webkit-transform-style: preserve-3d;
}

.flap-top,
.flap-bottom {
  position: absolute;
  width: 100%;
  height: 50%;
  background: linear-gradient(135deg, #34495e, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform-origin: bottom;
  /* 브라우저 호환성 */
  -webkit-transform-origin: bottom;
  -moz-transform-origin: bottom;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
}

.flap-top {
  top: 0;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #3a4d63 0%, #2c3e50 100%);
  z-index: 2;
}

.flap-bottom {
  top: 50%;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(0deg, #2c3e50 0%, #34495e 100%);
  transform-origin: top;
  /* 브라우저 호환성 */
  -webkit-transform-origin: top;
  -moz-transform-origin: top;
  z-index: 1;
}

.flap-text {
  font-family: 'Courier New', monospace;
  font-size: 2.8rem;
  font-weight: bold;
  color: #ecf0f1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
  line-height: 1;
  position: absolute;
  left: 50%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 6.5rem; /* Full height to span both flaps */
}

.flap-top .flap-text-top {
  /* Position text so that it spans both flaps, but only top half is visible */
  top: 0;
  transform: translateX(-50%);
  /* Safari 호환성을 위한 fallback */
  -webkit-clip-path: inset(0 0 50% 0);
  clip-path: inset(0 0 50% 0);
  /* 구형 브라우저 대응 */
  overflow: hidden;
}

.flap-bottom .flap-text-bottom {
  /* Position text so that it spans both flaps, but only bottom half is visible */
  top: -100%; /* Move up so bottom half aligns with bottom flap */
  transform: translateX(-50%);
  /* Safari 호환성을 위한 fallback */
  -webkit-clip-path: inset(50% 0 0 0);
  clip-path: inset(50% 0 0 0);
  /* 구형 브라우저 대응 */
  overflow: hidden;
}


.flap-unit.flipping .flap-top {
  animation: flipTop 0.6s ease-in-out;
  /* 브라우저 호환성 */
  -webkit-animation: flipTop 0.6s ease-in-out;
  -moz-animation: flipTop 0.6s ease-in-out;
}

.flap-unit.flipping .flap-bottom {
  animation: flipBottom 0.6s ease-in-out;
  /* 브라우저 호환성 */
  -webkit-animation: flipBottom 0.6s ease-in-out;
  -moz-animation: flipBottom 0.6s ease-in-out;
}

@keyframes flipTop {
  0% {
    transform: rotateX(0deg);
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
  50% {
    transform: rotateX(-90deg);
    -webkit-transform: rotateX(-90deg);
    z-index: 1;
  }
  51% {
    transform: rotateX(-90deg);
    -webkit-transform: rotateX(-90deg);
    z-index: 1;
  }
  100% {
    transform: rotateX(0deg);
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
}

@-webkit-keyframes flipTop {
  0% {
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
  50% {
    -webkit-transform: rotateX(-90deg);
    z-index: 1;
  }
  51% {
    -webkit-transform: rotateX(-90deg);
    z-index: 1;
  }
  100% {
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
}

@keyframes flipBottom {
  0% {
    transform: rotateX(90deg);
    -webkit-transform: rotateX(90deg);
    z-index: 1;
  }
  49% {
    transform: rotateX(90deg);
    -webkit-transform: rotateX(90deg);
    z-index: 1;
  }
  50% {
    transform: rotateX(0deg);
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
  100% {
    transform: rotateX(0deg);
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
}

@-webkit-keyframes flipBottom {
  0% {
    -webkit-transform: rotateX(90deg);
    z-index: 1;
  }
  49% {
    -webkit-transform: rotateX(90deg);
    z-index: 1;
  }
  50% {
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
  100% {
    -webkit-transform: rotateX(0deg);
    z-index: 2;
  }
}

/* 다크 테마 지원 */
.dark-theme .flap-unit {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark-theme .flap-top {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

.dark-theme .flap-bottom {
  background: linear-gradient(0deg, #1a1a1a 0%, #2d2d2d 100%);
}

.dark-theme .flap-text {
  color: #f0f6fc;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .flap-unit {
    width: 2.8rem;
    height: 4rem;
  }
  
  .flap-text {
    font-size: 1.8rem;
    height: 4rem; /* Full height for smaller flaps */
  }
}

@media (max-width: 480px) {
  .flap-unit {
    width: 1.4rem;
    height: 2.2rem;
  }
  
  .flap-text {
    font-size: 0.95rem;
    height: 2.2rem;
  }
  
  .flap-container {
    gap: 0.5px;
  }
}

/* 매우 작은 화면 최적화 */
@media (max-width: 320px) {
  .flap-unit {
    width: 1.2rem;
    height: 1.8rem;
  }
  
  .flap-text {
    font-size: 0.75rem;
    height: 1.8rem;
  }
  
  .flap-container {
    gap: 0.25px;
  }
}

/* 극소형 화면 최적화 (280px 이하) */
@media (max-width: 280px) {
  .flap-unit {
    width: 1rem;
    height: 1.5rem;
  }
  
  .flap-text {
    font-size: 0.65rem;
    height: 1.5rem;
  }
  
  .flap-container {
    gap: 0.1px;
  }
}

/* 초극소형 화면 최적화 (240px 이하) */
@media (max-width: 240px) {
  .flap-unit {
    width: 0.85rem;
    height: 1.3rem;
  }
  
  .flap-text {
    font-size: 0.55rem;
    height: 1.3rem;
  }
  
  .flap-container {
    gap: 0.05px;
  }
}

/* 접근성: 스크린 리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 성능 최적화 */
.split-flap-display {
  will-change: auto;
}

.flap-unit {
  will-change: transform;
}</style>