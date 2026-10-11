<template>
  <Transition name="update-prompt">
    <div 
      v-if="showUpdatePrompt" 
      class="pwa-update-prompt"
      role="alert"
      aria-live="polite"
    >
      <UiCard class="update-card" :bordered="false">
        <template #title>
          <div class="update-header">
            <div class="update-icon">🚀</div>
            <div class="update-title">
              <h3>새 버전 사용 가능</h3>
              <p>Split Flap Clock의 새로운 버전이 준비되었습니다</p>
            </div>
          </div>
        </template>
        
        <div class="update-content">
          <ul class="update-features">
            <li>성능 및 안정성 개선</li>
            <li>새로운 기능 및 버그 수정</li>
            <li>더 나은 사용자 경험</li>
          </ul>
          
          <div class="update-actions">
            <UiButton 
              type="primary" 
              size="large"
              :loading="isUpdating"
              @click="updateApp"
            >
              {{ isUpdating ? '업데이트 중...' : '지금 업데이트' }}
            </UiButton>
            <UiButton 
              type="text" 
              @click="dismissUpdate"
            >
              나중에
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import { message } from '@/composables/useToast'

/**
 * ## PWA 업데이트 프롬프트 컴포넌트
 * 
 * **Service Worker 업데이트**가 감지되면 사용자에게 업데이트를 권유합니다.
 * 
 * ### 기능
 * - 자동 업데이트 감지
 * - 사용자 친화적 업데이트 UI
 * - 강제 새로고침 없는 부드러운 업데이트
 * 
 * @since 1.0.0
 */

const showUpdatePrompt = ref(false)
const isUpdating = ref(false)

let swRegistration: ServiceWorkerRegistration | null = null

/**
 * ## PWA 업데이트 실행
 * 
 * **새로운 Service Worker**를 활성화하고 앱을 업데이트합니다.
 */
const updateApp = async (): Promise<void> => {
  if (!swRegistration || !swRegistration.waiting) {
    message.error('업데이트를 적용할 수 없습니다.')
    return
  }

  isUpdating.value = true

  try {
    // 대기 중인 Service Worker에게 메시지 전송
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // Service Worker가 활성화되면 페이지 새로고침
    const handleControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true })

    message.success('업데이트가 적용됩니다...')
    
    // 타임아웃 설정 (5초 후 강제 새로고침)
    setTimeout(() => {
      if (isUpdating.value) {
        window.location.reload()
      }
    }, 5000)

  } catch (error) {
    console.error('업데이트 적용 실패:', error)
    message.error('업데이트 적용 중 오류가 발생했습니다.')
    isUpdating.value = false
  }
}

/**
 * ## 업데이트 무시
 * 
 * **사용자가 "나중에"를 선택**했을 때 프롬프트를 숨깁니다.
 */
const dismissUpdate = (): void => {
  showUpdatePrompt.value = false
  message.info('나중에 설정에서 업데이트할 수 있습니다.')
}

/**
 * ## Service Worker 등록 및 업데이트 감지
 */
const setupServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker를 지원하지 않는 브라우저입니다.')
    return
  }

  try {
    // 기존 등록된 Service Worker 확인
    swRegistration = await navigator.serviceWorker.getRegistration() || null
    
    if (swRegistration) {
      console.log('Service Worker 등록 확인됨')
      
      // 업데이트 확인
      swRegistration.addEventListener('updatefound', () => {
        console.log('새로운 Service Worker 발견됨')
        
        const newWorker = swRegistration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('새로운 Service Worker 설치 완료')
              showUpdatePrompt.value = true
            }
          })
        }
      })
      
      // 대기 중인 Service Worker가 있는지 확인
      if (swRegistration.waiting) {
        console.log('대기 중인 Service Worker 발견됨')
        showUpdatePrompt.value = true
      }
      
      // 주기적 업데이트 확인
      setInterval(() => {
        swRegistration?.update()
      }, 60000) // 1분마다 확인
    }
    
  } catch (error) {
    console.error('Service Worker 설정 실패:', error)
  }
}

/**
 * ## PWA 설치 가능 이벤트 핸들러
 */
const handlePWAUpdateAvailable = (): void => {
  showUpdatePrompt.value = true
}

onMounted(() => {
  // Service Worker 설정
  setupServiceWorker()
  
  // PWA 업데이트 이벤트 리스너
  window.addEventListener('pwa-update-available', handlePWAUpdateAvailable)
  
  // 개발 환경에서 테스트용
  if (process.env.NODE_ENV === 'development') {
    // 10초 후 테스트 프롬프트 표시 (개발 환경에서만)
    // setTimeout(() => {
    //   showUpdatePrompt.value = true
    // }, 10000)
  }
})

onUnmounted(() => {
  window.removeEventListener('pwa-update-available', handlePWAUpdateAvailable)
})
</script>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1002;
  width: 90%;
  max-width: 400px;
  animation: slideInUp 0.4s ease-out;
}

.update-card {
  border-radius: 16px;
  box-shadow: var(--shadow-large);
  border: 1px solid var(--color-border-default);
  overflow: hidden;
}

.update-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
}

.update-icon {
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

.update-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-fg-default);
}

.update-title p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-fg-muted);
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.update-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.update-features li {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-fg-default);
  position: relative;
  padding-left: 20px;
}

.update-features li::before {
  content: '✨';
  position: absolute;
  left: 0;
  font-size: 0.75rem;
}

.update-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.update-actions .ui-btn--primary {
  flex: 1;
}

.update-prompt-enter-active,
.update-prompt-leave-active {
  transition: all 0.3s ease;
}

.update-prompt-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.update-prompt-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .pwa-update-prompt {
    bottom: 100px;
    width: 95%;
  }
  
  .update-header {
    gap: 8px;
  }
  
  .update-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .update-title h3 {
    font-size: 1rem;
  }
  
  .update-title p {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pwa-update-prompt {
    bottom: 90px;
  }
  
  .update-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .update-actions .ui-btn {
    width: 100%;
  }
}
</style>