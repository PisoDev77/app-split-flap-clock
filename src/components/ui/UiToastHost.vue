<template>
  <div class="ui-toast-host" role="status" aria-live="polite">
    <TransitionGroup name="ui-toast">
      <div v-for="toast in toasts" :key="toast.id" class="ui-toast" :class="`ui-toast--${toast.type}`">
        <span class="ui-toast__icon" aria-hidden="true">{{ ICONS[toast.type] }}</span>
        {{ toast.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { toasts } from '@/composables/useToast'

/**
 * ## 알림 표시 영역
 *
 * App.vue에 한 번만 둡니다.
 */
const ICONS = { success: '✓', error: '!', info: 'i' } as const
</script>
