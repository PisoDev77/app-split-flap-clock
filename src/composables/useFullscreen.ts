import { ref, onMounted, onUnmounted } from 'vue'

/**
 * ## 전체 화면
 *
 * 시계만 크게 보이도록 브라우저 화면 요소를 숨깁니다. (아이폰 Safari는 지원하지 않음)
 */
export function useFullscreen() {
  const supported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen
  const isFullscreen = ref(false)

  const sync = () => { isFullscreen.value = !!document.fullscreenElement }

  const toggle = async () => {
    if (!supported) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      }
    } catch {
      // 사용자 동작 없이 호출되거나 거절된 경우 무시
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', sync))
  onUnmounted(() => document.removeEventListener('fullscreenchange', sync))

  return { supported, isFullscreen, toggle }
}
