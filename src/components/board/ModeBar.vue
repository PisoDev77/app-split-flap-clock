<template>
  <div class="mode-bar" role="tablist" :aria-label="t.label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="mode-btn"
      :class="{ 'is-on': option.value === modelValue }"
      :aria-selected="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      <component :is="option.icon" aria-hidden="true" />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClockCircleOutlined, CalendarOutlined, HourglassOutlined, MessageOutlined } from '@ant-design/icons-vue'
import type { BoardMode } from '@/composables/useBoard'
import { useLocale } from '@/composables/useLocale'

/**
 * ## 판에 띄울 것 고르기 (시계 · D-day · 타이머 · 문구)
 */
defineProps<{ modelValue: BoardMode }>()
const emit = defineEmits<{ 'update:modelValue': [mode: BoardMode] }>()

const { pick } = useLocale()
const t = pick({
  ko: { label: '판에 띄울 것', clock: '시계', dday: 'D-day', timer: '타이머', message: '문구' },
  en: { label: 'Show on the board', clock: 'Clock', dday: 'D-day', timer: 'Timer', message: 'Message' }
})

const options = computed(() => [
  { value: 'clock' as const, label: t.value.clock, icon: ClockCircleOutlined },
  { value: 'dday' as const, label: t.value.dday, icon: CalendarOutlined },
  { value: 'timer' as const, label: t.value.timer, icon: HourglassOutlined },
  { value: 'message' as const, label: t.value.message, icon: MessageOutlined }
])
</script>

<style scoped>
.mode-bar {
  display: flex;
  gap: 2px;
  width: min(420px, 100%);
  padding: 4px;
  border-radius: 999px;
  background: rgba(var(--color-canvas-default-rgb), 0.6);
  border: 1px solid rgba(var(--color-border-default-rgb), 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.mode-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 6px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-fg-muted);
  font: inherit;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.mode-btn:hover {
  color: var(--color-fg-default);
}

.mode-btn:focus-visible {
  outline: 2px solid var(--color-accent-fg);
  outline-offset: 1px;
}

.mode-btn.is-on {
  background: var(--color-fg-default);
  color: var(--color-canvas-default);
}

@media (max-width: 380px) {
  .mode-btn { font-size: 13px; gap: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .mode-btn { transition: none; }
}
</style>
