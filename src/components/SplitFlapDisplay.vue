<template>
  <div 
    class="split-flap-display"
    :style="{ '--flip-ms': `${props.flipDuration}ms` }"
    role="img" 
    :aria-label="props.label ? `${props.label} ${props.text}` : props.text"
  >
    <div class="flap-container">
      <div 
        v-for="(char, index) in displayChars" 
        :key="index"
        class="flap-unit"
        :aria-hidden="true"
      >
        <!-- 고정 판: 위는 새 글자, 아래는 넘어가는 동안 옛 글자 -->
        <div class="flap-top">
          <span class="flap-text flap-text-top">{{ char }}</span>
        </div>
        <div class="flap-bottom">
          <span class="flap-text flap-text-bottom">{{ isFlipping[index] ? previousChars[index] : char }}</span>
        </div>
        <!-- 넘어가는 판: 옛 글자 윗판이 아래로 떨어지고, 새 글자 아랫판이 내려와 닿음 -->
        <template v-if="isFlipping[index]">
          <div class="flap-top flap-leaf flap-leaf-top">
            <span class="flap-text flap-text-top">{{ previousChars[index] }}</span>
          </div>
          <div class="flap-bottom flap-leaf flap-leaf-bottom">
            <span class="flap-text flap-text-bottom">{{ char }}</span>
          </div>
        </template>
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
  /** 화면 낭독기용 이름 (예: '시' → "시 23"). aria-label을 직접 넘기면 값이 덮여 숫자가 안 읽힘 */
  label?: string
  flipDuration?: number
  characterSet?: string[]
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  flipDuration: 450,
  label: undefined,
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

// 넘어가는 동안 아랫판·떨어지는 윗판에 보일 옛 글자 (칸마다)
const previousChars = ref<string[]>([])

let flipTimeout: ReturnType<typeof setTimeout> | null = null
const pendingTimers = new Set<ReturnType<typeof setTimeout>>()
const later = (fn: () => void, ms: number) => {
  const id = setTimeout(() => { pendingTimers.delete(id); fn() }, ms)
  pendingTimers.add(id)
}


/**
 * ## 텍스트 업데이트 및 플립 애니메이션
 * 
 * 바뀐 칸만 차례로(50ms 간격) 넘깁니다. 새 글자는 바로 고정 윗판에 들어가고,
 * 옛 글자 윗판이 떨어진 뒤 새 글자 아랫판이 내려와 닿습니다 (실제 분할 플랩처럼).
 * 
 * @param {string} newText - **표시할 새 텍스트**
 */
const updateText = (newText: string) => {
  // 접근성: reduced motion 체크
  const prefersReducedMotion = props.respectReducedMotion && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 글자 수가 바뀌면(도시 이름 등) 넘기지 않고 바로 바꿈
  if (prefersReducedMotion || newText.length !== currentText.value.length) {
    currentText.value = newText
    isFlipping.value = new Array(newText.length).fill(false)
    previousChars.value = newText.split('')
    return
  }

  const oldChars = currentText.value.split('')
  const changedIndices = newText.split('').flatMap((char, index) => char !== oldChars[index] ? [index] : [])

  changedIndices.forEach((index, order) => {
    later(() => {
      previousChars.value[index] = currentText.value[index] ?? ' '
      const chars = currentText.value.split('')
      chars[index] = newText[index]
      currentText.value = chars.join('')
      // 같은 칸이 아직 넘어가는 중이면 한 번 내렸다 올려서 애니메이션을 처음부터
      isFlipping.value[index] = false
      requestAnimationFrame(() => {
        isFlipping.value[index] = true
        later(() => { isFlipping.value[index] = false }, props.flipDuration)
      })
    }, order * 50)
  })
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
  previousChars.value = props.text.split('')
  isFlipping.value = new Array(props.text.length).fill(false)
})

onUnmounted(() => {
  if (flipTimeout) {
    clearTimeout(flipTimeout)
  }
  pendingTimers.forEach(clearTimeout)
})
</script>

<style scoped>
.split-flap-display {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  /* 칸 크기: 부모가 --flap-w를 주면 그 값, 아니면 화면 너비에 맞춰 자동 */
  --flap-size: var(--flap-w, clamp(1.75rem, calc(11vw - 2px), 4.5rem));
}

.flap-container {
  display: flex;
  gap: 1px;
}

.flap-unit {
  position: relative;
  width: var(--flap-size);
  height: calc(var(--flap-size) * 1.44);
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  /* 칸마다 원근: 넘어가는 판이 입체적으로 보이게 */
  perspective: calc(var(--flap-size) * 5);
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
  font-size: calc(var(--flap-size) * 0.62);
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
  height: calc(var(--flap-size) * 1.44); /* Full height to span both flaps */
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


/* 넘어가는 판 */
.flap-leaf {
  z-index: 3;
  will-change: transform;
}

/* 옛 윗판: 중력처럼 점점 빨라지며 아래로 접힘 (앞 절반 시간) */
.flap-leaf-top {
  animation: leaf-fall calc(var(--flip-ms) / 2) cubic-bezier(0.55, 0, 0.9, 0.45) forwards;
}

/* 새 아랫판: 이어서 내려와 살짝 튕기며 멈춤 (뒤 절반 시간) */
.flap-leaf-bottom {
  transform: rotateX(90deg);
  animation: leaf-land calc(var(--flip-ms) / 2) cubic-bezier(0.2, 0.9, 0.35, 1.15) calc(var(--flip-ms) / 2) forwards;
}

@keyframes leaf-fall {
  from { transform: rotateX(0deg); filter: brightness(1); }
  to { transform: rotateX(-90deg); filter: brightness(0.6); }
}

@keyframes leaf-land {
  from { transform: rotateX(90deg); filter: brightness(1.25); }
  to { transform: rotateX(0deg); filter: brightness(1); }
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
  will-change: auto;
}</style>