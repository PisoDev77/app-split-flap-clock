import { ref } from 'vue'

/**
 * ## 짧은 알림 (토스트)
 *
 * 화면 위쪽에 잠깐 떴다가 사라지는 알림입니다.
 *
 * @example
 * ```typescript
 * import { message } from '@/composables/useToast'
 * message.success('저장되었습니다.')
 * ```
 */

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  text: string
}

const DURATION_MS = 3000

export const toasts = ref<Toast[]>([])

let nextId = 0

const show = (type: Toast['type'], text: string) => {
  const id = nextId++
  toasts.value.push({ id, type, text })
  setTimeout(() => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }, DURATION_MS)
}

export const message = {
  success: (text: string) => show('success', text),
  error: (text: string) => show('error', text),
  info: (text: string) => show('info', text)
}
