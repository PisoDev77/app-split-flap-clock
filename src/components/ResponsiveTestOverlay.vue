<template>
  <div v-if="showTestMode" class="responsive-test-overlay">
    <div class="test-controls">
      <h3>반응형 테스트 모드</h3>
      <div class="screen-info">
        <span class="screen-size">{{ screenWidth }}×{{ screenHeight }}</span>
        <span class="breakpoint">{{ currentBreakpoint }}</span>
      </div>
      
      <div class="preset-sizes">
        <button 
          v-for="preset in presetSizes" 
          :key="preset.name"
          @click="setViewportSize(preset.width, preset.height)"
          :class="{ active: isCurrentSize(preset.width, preset.height) }"
          class="preset-btn"
        >
          {{ preset.name }}
          <small>{{ preset.width }}×{{ preset.height }}</small>
        </button>
      </div>
      
      <div class="test-features">
        <div class="feature-test">
          <span>시분초 한줄 표시:</span>
          <span :class="getStatusClass(isTimeOnOneLine)">
            {{ isTimeOnOneLine ? '✅ 성공' : '❌ 실패' }}
          </span>
        </div>
        <div class="feature-test">
          <span>스플릿플랩 가독성:</span>
          <span :class="getStatusClass(isFlapReadable)">
            {{ isFlapReadable ? '✅ 좋음' : '⚠️ 주의' }}
          </span>
        </div>
        <div class="feature-test">
          <span>UI 요소 겹침:</span>
          <span :class="getStatusClass(!hasOverlap)">
            {{ !hasOverlap ? '✅ 없음' : '❌ 겹침' }}
          </span>
        </div>
      </div>
      
      <button @click="toggleTestMode" class="close-btn">
        테스트 모드 종료
      </button>
    </div>
  </div>
  
  <!-- 테스트 모드 활성화 버튼 -->
  <button 
    v-else 
    @click="toggleTestMode" 
    class="test-mode-btn"
    title="반응형 테스트 모드"
  >
    📱
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * ## 반응형 테스트 오버레이 컴포넌트
 * 
 * **다양한 화면 크기**에서 앱의 반응형 동작을 테스트합니다.
 * 
 * ### 기능
 * - 실시간 화면 크기 표시
 * - 브레이크포인트 확인
 * - 프리셋 화면 크기 테스트
 * - UI 문제 자동 감지
 * 
 * @since 1.0.0
 */

const showTestMode = ref(false)
const screenWidth = ref(window.innerWidth)
const screenHeight = ref(window.innerHeight)

const presetSizes = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Galaxy S21', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: '작은 화면', width: 320, height: 568 }
]

const currentBreakpoint = computed(() => {
  const width = screenWidth.value
  if (width >= 1200) return 'XL (Desktop)'
  if (width >= 992) return 'LG (Laptop)'
  if (width >= 768) return 'MD (Tablet)'
  if (width >= 480) return 'SM (Mobile L)'
  if (width >= 320) return 'XS (Mobile S)'
  return 'XXS (Very Small)'
})

const isTimeOnOneLine = computed(() => {
  // 시분초 요소들이 한 줄에 있는지 확인
  const timeUnits = document.querySelector('.time-units')
  if (!timeUnits) return false
  
  const children = timeUnits.children
  if (children.length < 5) return false // 시:분:초 (5개 요소)
  
  let maxTop = 0
  let minTop = Infinity
  
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect()
    maxTop = Math.max(maxTop, rect.top)
    minTop = Math.min(minTop, rect.top)
  }
  
  // 높이 차이가 10px 이하면 한 줄로 간주
  return (maxTop - minTop) <= 10
})

const isFlapReadable = computed(() => {
  // 스플릿플랩이 읽기 쉬운 크기인지 확인
  const flapUnit = document.querySelector('.flap-unit')
  if (!flapUnit) return true
  
  const rect = flapUnit.getBoundingClientRect()
  // 최소 28px 이상의 너비가 있어야 읽기 쉬움
  return rect.width >= 28
})

const hasOverlap = computed(() => {
  // UI 요소들이 겹치는지 확인
  const header = document.querySelector('.header')
  const content = document.querySelector('.content')
  const adBanner = document.querySelector('.adsense-banner')
  
  if (!header || !content) return false
  
  const headerRect = header.getBoundingClientRect()
  const contentRect = content.getBoundingClientRect()
  
  // 헤더와 컨텐츠가 겹치는지 확인
  const headerOverlap = headerRect.bottom > contentRect.top
  
  // 광고 배너와 컨텐츠가 겹치는지 확인
  let adOverlap = false
  if (adBanner) {
    const adRect = adBanner.getBoundingClientRect()
    adOverlap = adRect.top < contentRect.bottom
  }
  
  return headerOverlap || adOverlap
})

const toggleTestMode = (): void => {
  showTestMode.value = !showTestMode.value
}

const setViewportSize = (width: number, height: number): void => {
  // 브라우저 창 크기 조정 (개발 환경에서만 가능)
  if (window.outerWidth && window.outerHeight) {
    try {
      window.resizeTo(width, height)
    } catch (error) {
      console.log('창 크기 조정 실패 (보안 제한):', error)
    }
  }
  
  // 뷰포트 메타 태그 임시 조정 (시뮬레이션)
  screenWidth.value = width
  screenHeight.value = height
}

const isCurrentSize = (width: number, height: number): boolean => {
  return Math.abs(screenWidth.value - width) < 50 && 
         Math.abs(screenHeight.value - height) < 50
}

const getStatusClass = (isGood: boolean): string => {
  return isGood ? 'status-good' : 'status-bad'
}

const handleResize = (): void => {
  screenWidth.value = window.innerWidth
  screenHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 개발 환경에서만 표시
  if (process.env.NODE_ENV === 'development') {
    // 5초 후 자동으로 테스트 모드 힌트 표시
    setTimeout(() => {
      if (!showTestMode.value) {
        console.log('💡 반응형 테스트 모드를 사용하려면 화면 우하단의 📱 버튼을 클릭하세요!')
      }
    }, 5000)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.responsive-test-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.test-controls {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.test-controls h3 {
  margin: 0 0 16px 0;
  color: #333;
  text-align: center;
}

.screen-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.screen-size {
  font-family: monospace;
  font-weight: bold;
  color: #2c3e50;
}

.breakpoint {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.preset-sizes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.preset-btn:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.preset-btn.active {
  border-color: #2ecc71;
  background: #d5f4e6;
}

.preset-btn small {
  font-size: 0.7rem;
  color: #7f8c8d;
  margin-top: 2px;
}

.test-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-test {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.feature-test span:first-child {
  color: #555;
}

.status-good {
  color: #27ae60;
  font-weight: 600;
}

.status-bad {
  color: #e74c3c;
  font-weight: 600;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #2980b9;
}

.test-mode-btn {
  position: fixed;
  bottom: 140px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  z-index: 1001;
  transition: all 0.3s ease;
}

.test-mode-btn:hover {
  background: #2980b9;
  transform: scale(1.1);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .test-controls {
    padding: 16px;
  }
  
  .preset-sizes {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-mode-btn {
    bottom: 110px;
    right: 15px;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

/* 다크 테마 지원 */
.dark-theme .test-controls {
  background: #2c3e50;
  color: #ecf0f1;
}

.dark-theme .screen-info {
  background: #34495e;
}

.dark-theme .preset-btn {
  background: #34495e;
  border-color: #4a5f7a;
  color: #ecf0f1;
}

.dark-theme .preset-btn:hover {
  background: #4a5f7a;
}

.dark-theme .test-features {
  background: #34495e;
}
</style>