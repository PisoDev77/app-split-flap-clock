import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * ## 화면 켜두기 (Screen Wake Lock)
 *
 * 탁상시계처럼 켜 둘 때 화면이 꺼지지 않게 합니다.
 * 브라우저는 앱이 가려지면 잠금을 풀기 때문에, 다시 보일 때 자동으로 다시 요청합니다.
 * 지원하지 않는 브라우저에서는 supported가 false입니다.
 *
 * @param enabled 켜두기를 원하는지 (설정값)
 */
export function useWakeLock(enabled: Ref<boolean>) {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const active = ref(false)
  let sentinel: WakeLockSentinel | null = null

  const acquire = async () => {
    if (!supported || !enabled.value || document.hidden || sentinel) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      active.value = true
      sentinel.addEventListener('release', () => {
        sentinel = null
        active.value = false
      })
    } catch {
      // 배터리 절약 모드 등으로 거절될 수 있음
      active.value = false
    }
  }

  const release = async () => {
    await sentinel?.release().catch(() => undefined)
    sentinel = null
    active.value = false
  }

  const onVisibilityChange = () => {
    if (!document.hidden) acquire()
  }

  watch(enabled, (on) => (on ? acquire() : release()))

  onMounted(() => {
    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    release()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { supported, active }
}
