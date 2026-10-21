<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <UiCard class="install-card" :bordered="false">
      <template #title>
        <div class="install-header">
          <div class="app-icon">📱</div>
          <div class="install-title">
            <h3>{{ t.title }}</h3>
            <p>{{ t.subtitle }}</p>
          </div>
        </div>
      </template>
      
      <div class="install-content">
        <ul class="install-benefits">
          <li v-for="benefit in t.benefits" :key="benefit">{{ benefit }}</li>
        </ul>
        
        <div class="install-actions">
          <UiButton 
            type="primary" 
            size="large"
            :loading="isInstalling"
            @click="handleInstall"
          >
            {{ t.install }}
          </UiButton>
          <UiButton 
            type="text" 
            @click="dismissPrompt"
          >
            {{ t.later }}
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useLocale } from '@/composables/useLocale'
import UiCard from '@/components/ui/UiCard.vue'
import { message } from '@/composables/useToast'
import { showInstallPrompt as showPWAInstallPrompt, canInstallPWA } from '@/utils/pwa'

/**
 * ## PWA 설치 프롬프트 컴포넌트
 * 
 * **PWA 설치 가능할 때** 사용자에게 설치를 권유하는 프롬프트를 표시합니다.
 * 
 * ### 기능
 * - 설치 가능 상태 감지
 * - 사용자 친화적인 설치 UI
 * - 설치 거부 시 일정 기간 숨김
 * 
 * @since 1.0.0
 */

const showInstallPrompt = ref(false)

const { pick } = useLocale()
const t = pick({
  ko: {
    title: '앱 설치', subtitle: '홈 화면에 플립시계를 추가하세요',
    benefits: ['홈 화면에서 바로 접근', '오프라인에서도 사용 가능', '빠른 로딩 속도', '화면 켜두고 탁상시계로'],
    install: '설치하기', later: '나중에', installed: '앱이 성공적으로 설치되었습니다!', canceled: '설치가 취소되었습니다.',
    failed: '설치 중 오류가 발생했습니다.', remind: '7일 후에 다시 알려드리겠습니다.'
  },
  en: {
    title: 'Install the app', subtitle: 'Add Flip Clock to your home screen',
    benefits: ['Open it from your home screen', 'Works offline', 'Loads fast', 'Keep the screen on as a desk clock'],
    install: 'Install', later: 'Not now', installed: 'App installed!', canceled: 'Install canceled.',
    failed: 'Something went wrong while installing.', remind: "We'll remind you in 7 days."
  }
})
const isInstalling = ref(false)

const DISMISS_STORAGE_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7일

/**
 * ## 설치 프롬프트 표시 여부 확인
 * 
 * **PWA 설치 가능 여부**와 사용자의 이전 거부 기록을 확인합니다.
 * 
 * @returns {boolean} **프롬프트 표시 여부**
 */
const shouldShowPrompt = (): boolean => {
  // PWA 설치 불가능한 경우
  if (!canInstallPWA()) {
    return false
  }
  
  // 사용자가 이전에 거부한 경우
  const dismissedTime = localStorage.getItem(DISMISS_STORAGE_KEY)
  if (dismissedTime) {
    const elapsed = Date.now() - parseInt(dismissedTime)
    if (elapsed < DISMISS_DURATION) {
      return false
    }
  }
  
  return true
}

/**
 * ## PWA 설치 처리
 * 
 * **사용자가 설치 버튼을 클릭**했을 때 PWA 설치를 처리합니다.
 * 
 * @example
 * ```typescript
 * await handleInstall()
 * ```
 */
const handleInstall = async (): Promise<void> => {
  isInstalling.value = true
  
  try {
    const installed = await showPWAInstallPrompt()
    
    if (installed) {
      message.success(t.value.installed)
      showInstallPrompt.value = false
      localStorage.removeItem(DISMISS_STORAGE_KEY)
    } else {
      message.info(t.value.canceled)
    }
  } catch (error) {
    console.error('PWA 설치 오류:', error)
    message.error(t.value.failed)
  } finally {
    isInstalling.value = false
  }
}

/**
 * ## 프롬프트 무시 처리
 * 
 * **사용자가 "나중에"를 선택**했을 때 프롬프트를 숨기고 기록을 저장합니다.
 * 
 * @example
 * ```typescript
 * dismissPrompt()
 * ```
 */
const dismissPrompt = (): void => {
  showInstallPrompt.value = false
  localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString())
  message.info(t.value.remind)
}

/**
 * ## PWA 설치 가능 이벤트 핸들러
 * 
 * **PWA 설치가 가능해졌을 때** 프롬프트 표시를 확인합니다.
 */
const handlePWAInstallAvailable = (): void => {
  if (shouldShowPrompt()) {
    // 약간의 지연 후 프롬프트 표시 (사용자 경험 향상)
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  }
}

/**
 * ## PWA 설치 완료 이벤트 핸들러
 * 
 * **PWA 설치가 완료되었을 때** 프롬프트를 숨깁니다.
 */
const handlePWAInstalled = (): void => {
  showInstallPrompt.value = false
  localStorage.removeItem(DISMISS_STORAGE_KEY)
}

onMounted(() => {
  // 초기 상태 확인
  if (shouldShowPrompt()) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 5000) // 앱 로드 후 5초 뒤 표시
  }
  
  // PWA 이벤트 리스너 등록
  window.addEventListener('pwa-install-available', handlePWAInstallAvailable)
  window.addEventListener('pwa-installed', handlePWAInstalled)
})

onUnmounted(() => {
  // 이벤트 리스너 정리
  window.removeEventListener('pwa-install-available', handlePWAInstallAvailable)
  window.removeEventListener('pwa-installed', handlePWAInstalled)
})
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  width: 90%;
  max-width: 400px;
  animation: slideInUp 0.4s ease-out;
}

.install-card {
  border-radius: 16px;
  box-shadow: var(--shadow-large);
  border: 1px solid var(--color-border-default);
  overflow: hidden;
}

.install-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
}

.app-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-canvas-subtle);
  border-radius: 12px;
  border: 2px solid var(--color-border-default);
}

.install-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-fg-default);
}

.install-title p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-fg-muted);
}

.install-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.install-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.install-benefits li {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-fg-default);
  position: relative;
  padding-left: 20px;
}

.install-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success-fg);
  font-weight: bold;
}

.install-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.install-actions .ui-btn--primary {
  flex: 1;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .pwa-install-prompt {
    bottom: 100px;
    width: 95%;
  }
  
  .install-header {
    gap: 8px;
  }
  
  .app-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .install-title h3 {
    font-size: 1rem;
  }
  
  .install-title p {
    font-size: 0.8rem;
  }
}

/* 폰 세로: 혜택 목록을 빼고 작게 — 크게 띄우면 시계·모드 버튼 줄을 덮었음 (2026-10-21 QA)
   버튼은 한 줄에 두기 (세로로 쌓으면 flex: 1 때문에 '설치하기' 높이가 납작해졌음) */
@media (max-width: 480px) {
  .pwa-install-prompt {
    bottom: calc(env(safe-area-inset-bottom) + 16px);
  }

  .install-benefits {
    display: none;
  }

  .install-actions .ui-btn {
    min-height: 44px;
  }
}
/* 가로로 눕힌 폰: 시계를 가리지 않게 혜택 목록을 숨기고 오른쪽 아래에 작게 */
@media (orientation: landscape) and (max-height: 500px) {
  .pwa-install-prompt {
    left: auto;
    right: 12px;
    bottom: 12px;
    width: 320px;
    transform: none;
    animation: none;
  }

  .install-benefits {
    display: none;
  }
}
</style>