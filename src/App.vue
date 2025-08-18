<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <a-config-provider :theme="themeConfig">
      <div class="app-container">
        <OfflineIndicator />
        <router-view />
        <AdSenseBanner ad-slot="default-banner" />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        <ResponsiveTestOverlay v-if="isDevelopment" />
      </div>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { ConfigProvider as AConfigProvider } from 'ant-design-vue'
import { useTheme } from '@/composables/useTheme'
import AdSenseBanner from '@/components/AdSenseBanner.vue'
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue'
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt.vue'
import OfflineIndicator from '@/components/OfflineIndicator.vue'
import ResponsiveTestOverlay from '@/components/ResponsiveTestOverlay.vue'
import { setupPWAListeners, setupNetworkListeners } from '@/utils/pwa'

/**
 * ## 메인 앱 컴포넌트
 * 
 * **전체 애플리케이션**의 레이아웃과 테마를 관리합니다.
 * 
 * ### 기능
 * - 테마 적용 (라이트/다크 모드)
 * - 광고 배너 표시
 * - PWA 설치 프롬프트
 * - 라우터 뷰 렌더링
 * 
 * @since 1.0.0
 */

const { isDarkMode, themeConfig } = useTheme()

// 개발 환경 체크
const isDevelopment = computed(() => process.env.NODE_ENV === 'development')

onMounted(() => {
  // PWA 관련 이벤트 리스너 설정
  setupPWAListeners()
  
  // 네트워크 상태 모니터링
  setupNetworkListeners((isOnline) => {
    if (isDevelopment.value) {
      console.log(`네트워크 상태: ${isOnline ? '온라인' : '오프라인'}`)
    }
  })
})
</script>

<style>
#app {
  font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  transition: all 0.3s ease;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* CSS 변수 정의 (구형 브라우저 대응) */
:root {
  /* 라이트 테마 기본값 */
  --color-canvas-default-rgb: 255, 255, 255;
  --color-fg-default: #24292f;
  --color-fg-muted: #656d76;
  --color-accent-fg: #0969da;
  --color-border-default: #d0d7de;
  --color-canvas-subtle: #f6f8fa;
  --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-theme {
  background-color: #0d1117;
  color: #f0f6fc;
  /* 다크 테마 CSS 변수 재정의 */
  --color-canvas-default-rgb: 13, 17, 23;
  --color-fg-default: #f0f6fc;
  --color-fg-muted: #8b949e;
  --color-accent-fg: #58a6ff;
  --color-border-default: #30363d;
  --color-canvas-subtle: #21262d;
  --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.light-theme {
  background-color: #ffffff;
  color: #24292f;
  /* 라이트 테마 CSS 변수 (기본값과 동일) */
  --color-canvas-default-rgb: 255, 255, 255;
  --color-fg-default: #24292f;
  --color-fg-muted: #656d76;
  --color-accent-fg: #0969da;
  --color-border-default: #d0d7de;
  --color-canvas-subtle: #f6f8fa;
  --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>