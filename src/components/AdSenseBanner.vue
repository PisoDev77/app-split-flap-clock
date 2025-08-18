<template>
  <div 
    v-if="shouldShowAd" 
    class="adsense-banner"
    :class="{ 'mobile': isMobile }"
  >
    <div class="ad-container">
      <!-- Google AdSense 광고 슬롯 -->
      <ins 
        class="adsbygoogle"
        :style="adStyle"
        :data-ad-client="adClient"
        :data-ad-slot="adSlot"
        :data-ad-format="adFormat"
        :data-full-width-responsive="fullWidthResponsive"
      ></ins>
    </div>
    
    <!-- 개발 환경에서만 표시되는 더미 광고 -->
    <div v-if="isDevelopment" class="dummy-ad">
      <div class="dummy-ad-content">
        <h4>광고 영역 (개발 모드)</h4>
        <p>{{ adSlotInfo }}</p>
        <small>프로덕션에서는 실제 AdSense 광고가 표시됩니다</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * ## Google AdSense 배너 컴포넌트
 * 
 * **반응형 AdSense 광고**를 표시하며 개발/프로덕션 환경을 구분합니다.
 * 
 * ### 기능
 * - 반응형 광고 표시
 * - 모바일/데스크톱 크기 조정
 * - 개발 환경에서 더미 광고 표시
 * - 광고 차단기 감지
 * 
 * @since 1.0.0
 */

interface Props {
  adSlot: string
  adFormat?: string
  adClient?: string
  fullWidthResponsive?: boolean
  position?: 'bottom' | 'top' | 'inline'
  mobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  adFormat: 'auto',
  adClient: 'ca-pub-9032352332550166',
  fullWidthResponsive: true,
  position: 'bottom',
  mobile: false
})

const isAdBlocked = ref(false)
const adLoaded = ref(false)
const isMobile = ref(false)

// 환경 감지
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
})

const shouldShowAd = computed(() => {
  return !isAdBlocked.value && (isDevelopment.value || adLoaded.value)
})

const adStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'block'
  }
  
  if (isMobile.value) {
    style.width = '320px'
    style.height = '100px'
  } else {
    style.width = '728px'
    style.height = '90px'
  }
  
  return style
})

const adSlotInfo = computed(() => {
  return `${props.position} 광고 (${isMobile.value ? '모바일' : '데스크톱'})`
})

/**
 * ## 모바일 환경 감지
 * 
 * **화면 크기와 사용자 에이전트**를 기반으로 모바일 환경을 감지합니다.
 */
const detectMobile = (): void => {
  isMobile.value = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * ## 광고 차단기 감지
 * 
 * **광고 차단기가 활성화되어 있는지** 확인합니다.
 */
const detectAdBlocker = (): void => {
  const testAd = document.createElement('div')
  testAd.innerHTML = '&nbsp;'
  testAd.className = 'adsbox'
  testAd.style.position = 'absolute'
  testAd.style.left = '-999px'
  testAd.style.width = '1px'
  testAd.style.height = '1px'
  
  document.body.appendChild(testAd)
  
  setTimeout(() => {
    const isBlocked = testAd.offsetHeight === 0
    isAdBlocked.value = isBlocked
    document.body.removeChild(testAd)
    
    if (isBlocked) {
      console.info('광고 차단기가 감지되었습니다.')
    }
  }, 100)
}

/**
 * ## AdSense 광고 로드
 * 
 * **프로덕션 환경에서만** 실제 AdSense 광고를 로드합니다.
 */
const loadAdSense = (): void => {
  if (isDevelopment.value) {
    adLoaded.value = true
    return
  }
  
  try {
    // AdSense 스크립트가 로드되었는지 확인
    if (typeof window.adsbygoogle !== 'undefined') {
      // 광고 푸시
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      adLoaded.value = true
    } else {
      console.warn('AdSense 스크립트가 로드되지 않았습니다.')
    }
  } catch (error) {
    console.error('AdSense 로드 오류:', error)
  }
}

/**
 * ## 화면 크기 변경 핸들러
 */
const handleResize = (): void => {
  detectMobile()
}

onMounted(() => {
  detectMobile()
  detectAdBlocker()
  
  // 화면 크기 변경 감지
  window.addEventListener('resize', handleResize)
  
  // AdSense 로드 (약간의 지연 후)
  setTimeout(loadAdSense, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 전역 타입 선언
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
</script>

<style scoped>
.adsense-banner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: rgba(var(--color-canvas-default-rgb), 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--color-border-muted);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: var(--shadow-medium);
}

.adsense-banner.mobile {
  padding: 8px;
}

.ad-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
}

.adsbygoogle {
  border-radius: 8px;
  overflow: hidden;
}

/* 더미 광고 스타일 (개발 환경) */
.dummy-ad {
  width: 100%;
  max-width: 728px;
  min-height: 90px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px dashed var(--color-border-muted);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.dummy-ad-content {
  text-align: center;
  color: var(--color-fg-muted);
}

.dummy-ad-content h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-fg-default);
}

.dummy-ad-content p {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
}

.dummy-ad-content small {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .adsense-banner {
    padding: 8px;
  }
  
  .dummy-ad {
    max-width: 320px;
    min-height: 100px;
    padding: 12px;
  }
  
  .dummy-ad-content h4 {
    font-size: 0.875rem;
  }
  
  .dummy-ad-content p {
    font-size: 0.75rem;
  }
  
  .dummy-ad-content small {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .adsense-banner {
    padding: 6px;
  }
  
  .dummy-ad {
    max-width: 280px;
    min-height: 80px;
    padding: 8px;
  }
}

/* 다크 테마 지원 */
.dark-theme .dummy-ad {
  background: linear-gradient(135deg, #21262d, #30363d);
  border-color: var(--color-border-muted);
}

/* 애니메이션 */
.adsense-banner {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 광고 차단기 감지 시 숨김 */
.adsense-banner[data-ad-blocked="true"] {
  display: none;
}
</style>