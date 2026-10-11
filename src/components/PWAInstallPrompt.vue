<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <a-card class="install-card" :bordered="false">
      <template #title>
        <div class="install-header">
          <div class="app-icon">📱</div>
          <div class="install-title">
            <h3>앱 설치</h3>
            <p>홈 화면에 Split Flap Clock을 추가하세요</p>
          </div>
        </div>
      </template>
      
      <div class="install-content">
        <ul class="install-benefits">
          <li>홈 화면에서 바로 접근</li>
          <li>오프라인에서도 사용 가능</li>
          <li>빠른 로딩 속도</li>
          <li>네이티브 앱과 동일한 경험</li>
        </ul>
        
        <div class="install-actions">
          <a-button 
            type="primary" 
            size="large"
            :loading="isInstalling"
            @click="handleInstall"
          >
            설치하기
          </a-button>
          <a-button 
            type="text" 
            @click="dismissPrompt"
          >
            나중에
          </a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Card as ACard, Button as AButton, message } from 'ant-design-vue'
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
      message.success('앱이 성공적으로 설치되었습니다!')
      showInstallPrompt.value = false
      localStorage.removeItem(DISMISS_STORAGE_KEY)
    } else {
      message.info('설치가 취소되었습니다.')
    }
  } catch (error) {
    console.error('PWA 설치 오류:', error)
    message.error('설치 중 오류가 발생했습니다.')
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
  message.info('7일 후에 다시 알려드리겠습니다.')
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
  bottom: 120px; /* 광고 배너 위에 표시 */
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

.install-actions .ant-btn-primary {
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

@media (max-width: 480px) {
  .pwa-install-prompt {
    bottom: 90px;
  }
  
  .install-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .install-actions .ant-btn {
    width: 100%;
  }
}</style>