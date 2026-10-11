<template>
  <Transition name="update-banner">
    <div v-if="showBanner" class="update-banner" role="status" aria-live="polite">
      <span class="update-banner__text">새 버전이 준비됐어요</span>
      <UiButton type="primary" size="small" @click="reload">
        새로고침
      </UiButton>
      <button type="button" class="update-banner__close" aria-label="닫기" @click="showBanner = false">
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'

/**
 * ## 새 버전 적용
 *
 * 서비스 워커는 autoUpdate + skipWaiting이라 새 버전을 받으면 바로 적용됩니다.
 * 다만 열려 있는 화면은 예전 코드라서 한 번 새로고침해야 바뀝니다.
 *
 * - 시계 화면이면: 잃을 게 없으니 바로 새로고침
 * - 다른 화면이면: 작은 안내만 띄우고, 다음에 시계 화면으로 갈 때 새로고침
 * - 새 버전 확인: 1시간마다 + 앱을 다시 볼 때
 *
 * (예전에는 배포마다 "업데이트 하시겠어요?" 창이 뜨고, 이미 적용된 뒤라
 *  "지금 업데이트"를 누르면 오류가 났음)
 */

const CHECK_INTERVAL_MS = 60 * 60 * 1000

const route = useRoute()
const router = useRouter()
const showBanner = ref(false)

let updateReady = false
let checkTimer: ReturnType<typeof setInterval> | undefined
let removeAfterEach: (() => void) | undefined

const reload = () => window.location.reload()

const onControllerChange = () => {
  updateReady = true
  if (route.path === '/') {
    reload()
  } else {
    showBanner.value = true
  }
}

const checkForUpdate = async () => {
  const registration = await navigator.serviceWorker.getRegistration()
  await registration?.update().catch(() => undefined)
}

const onVisibilityChange = () => {
  if (!document.hidden) checkForUpdate()
}

onMounted(() => {
  if (!('serviceWorker' in navigator)) return

  // 처음 설치될 때(controller 없음)는 새로고침할 필요가 없음
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
  }

  removeAfterEach = router.afterEach((to) => {
    if (updateReady && to.path === '/') reload()
  })

  checkTimer = setInterval(checkForUpdate, CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
  removeAfterEach?.()
  clearInterval(checkTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.update-banner {
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 50%;
  z-index: 1002;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: calc(100vw - 32px);
  padding: 8px 8px 8px 16px;
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  background: var(--color-canvas-default);
  box-shadow: var(--shadow-large);
  color: var(--color-fg-default);
  font-size: 14px;
  transform: translateX(-50%);
}

.update-banner__text {
  white-space: nowrap;
}

.update-banner__close {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-fg-muted);
  font-size: 20px;
  cursor: pointer;
}

.update-banner__close:hover {
  background: var(--color-canvas-subtle);
}

.update-banner-enter-active,
.update-banner-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.update-banner-enter-from,
.update-banner-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
