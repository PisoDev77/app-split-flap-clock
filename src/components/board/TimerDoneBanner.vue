<template>
  <Transition name="timer-done">
    <div v-if="show" class="timer-done" role="alert">
      <span class="timer-done__text">⏰ {{ t.text(name) }}</span>
      <button type="button" class="timer-done__ok" @click="dismiss">{{ t.ok }}</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBoard, timerDone } from '@/composables/useBoard'
import { useLocale } from '@/composables/useLocale'

/**
 * ## 타이머 끝 띠
 *
 * 다른 모드·다른 화면에 있을 때 타이머가 끝나면 위에 띄움 (폰이 무음이면 소리를 못 들어서).
 * 홈에서 타이머 모드를 보고 있으면 판이 "끝"을 보여 주니 띄우지 않음. App.vue에 한 번만 둠.
 */
const route = useRoute()
const { isEn, pick } = useLocale()
const { mode, timers } = useBoard(isEn.value)

const t = pick({
  ko: { text: (name: string) => `${name} 타이머가 끝났어요`, ok: '확인' },
  en: { text: (name: string) => `${name} timer is done`, ok: 'OK' }
})

const onTimerBoard = computed(() => (route.name === 'Home' || route.name === 'HomeEn') && mode.value === 'timer')
const name = computed(() => timers.value.find(x => x.id === timerDone.value)?.name ?? '')
const show = computed(() => !!timerDone.value && !onTimerBoard.value)
const dismiss = () => { timerDone.value = null }

// 타이머 판으로 오면 판이 알려 주니 띠는 닫음
watch(onTimerBoard, on => { if (on) dismiss() }, { immediate: true })
</script>

<style scoped>
.timer-done {
  position: fixed;
  /* ☰·⚙ 줄 아래 (버튼을 가리지 않게) */
  top: calc(max(12px, env(safe-area-inset-top)) + 60px);
  left: 50%;
  z-index: 1900;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: calc(100vw - 32px);
  padding: 6px 6px 6px 16px;
  border-radius: 12px;
  background: var(--color-canvas-default);
  box-shadow: var(--shadow-large);
  color: var(--color-fg-default);
  font-size: 15px;
  font-weight: 600;
  word-break: keep-all;
  transform: translateX(-50%);
}

.timer-done__ok {
  flex: none;
  min-width: 64px;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent-fg);
  color: var(--color-canvas-default);
  font: inherit;
  cursor: pointer;
}

.timer-done-enter-active,
.timer-done-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.timer-done-enter-from,
.timer-done-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
