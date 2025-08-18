<template>
  <Transition name="offline-indicator">
    <div 
      v-if="!isOnline" 
      class="offline-indicator"
      role="alert"
      aria-live="polite"
    >
      <div class="offline-content">
        <div class="offline-icon">
          📡
        </div>
        <div class="offline-text">
          <h4>오프라인 모드</h4>
          <p>인터넷 연결이 끊어졌습니다. 기본 기능은 계속 사용할 수 있습니다.</p>
        </div>
        <button 
          class="offline-retry"
          @click="checkConnection"
          :disabled="isChecking"
        >
          {{ isChecking ? '확인 중...' : '재시도' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * ## 오프라인 상태 표시 컴포넌트
 * 
 * **네트워크 연결 상태**를 모니터링하고 오프라인 시 사용자에게 알립니다.
 * 
 * ### 기능
 * - 실시간 네트워크 상태 감지
 * - 오프라인 시 알림 표시
 * - 연결 재시도 기능
 * - 접근성 지원
 * 
 * @since 1.0.0
 */

const isOnline = ref(navigator.onLine)
const isChecking = ref(false)

/**
 * ## 네트워크 연결 상태 확인
 * 
 * **실제 인터넷 연결**을 테스트하여 네트워크 상태를 확인합니다.
 */
const checkConnection = async (): Promise<void> => {
  isChecking.value = true
  
  try {
    // 작은 이미지를 로드하여 실제 연결 테스트
    const response = await fetch('/favicon.svg', {
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    if (response.ok) {
      isOnline.value = true
      console.log('네트워크 연결 복구됨')
    } else {
      isOnline.value = false
    }
  } catch (error) {
    console.log('네트워크 연결 실패:', error)
    isOnline.value = false
  } finally {
    isChecking.value = false
  }
}

/**
 * ## 온라인 상태 변경 핸들러
 */
const handleOnline = (): void => {
  console.log('온라인 상태 변경: 온라인')
  isOnline.value = true
  
  // 실제 연결 확인
  setTimeout(checkConnection, 1000)
}

/**
 * ## 오프라인 상태 변경 핸들러
 */
const handleOffline = (): void => {
  console.log('온라인 상태 변경: 오프라인')
  isOnline.value = false
}

/**
 * ## 주기적 연결 확인
 */
let connectionCheckInterval: NodeJS.Timeout | null = null

const startConnectionCheck = (): void => {
  // 오프라인 상태일 때만 주기적으로 확인
  connectionCheckInterval = setInterval(() => {
    if (!isOnline.value) {
      checkConnection()
    }
  }, 30000) // 30초마다 확인
}

const stopConnectionCheck = (): void => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
    connectionCheckInterval = null
  }
}

onMounted(() => {
  // 초기 연결 상태 확인
  checkConnection()
  
  // 네트워크 이벤트 리스너 등록
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 주기적 연결 확인 시작
  startConnectionCheck()
})

onUnmounted(() => {
  // 이벤트 리스너 제거
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  
  // 주기적 확인 중지
  stopConnectionCheck()
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 12px 16px;
  box-shadow: var(--shadow-large);
  backdrop-filter: blur(8px);
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.offline-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

.offline-text {
  flex: 1;
  min-width: 0;
}

.offline-text h4 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.offline-text p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.9;
  line-height: 1.3;
}

.offline-retry {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.offline-retry:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.offline-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 애니메이션 */
.offline-indicator-enter-active,
.offline-indicator-leave-active {
  transition: all 0.3s ease;
}

.offline-indicator-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.offline-indicator-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .offline-indicator {
    padding: 10px 12px;
  }
  
  .offline-content {
    gap: 8px;
  }
  
  .offline-icon {
    font-size: 1.2rem;
  }
  
  .offline-text h4 {
    font-size: 0.85rem;
  }
  
  .offline-text p {
    font-size: 0.75rem;
  }
  
  .offline-retry {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .offline-content {
    flex-wrap: wrap;
  }
  
  .offline-text {
    order: 1;
    width: 100%;
    margin-bottom: 8px;
  }
  
  .offline-icon {
    order: 2;
  }
  
  .offline-retry {
    order: 3;
    margin-left: auto;
  }
}

/* 다크 테마 지원 */
.dark-theme .offline-indicator {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}
</style>