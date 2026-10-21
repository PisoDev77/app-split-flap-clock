<template>
  <div ref="root" class="picker">
    <button
      ref="trigger"
      type="button"
      class="picker-trigger"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="label"
      @click="toggle"
    >
      <slot />
      <DownOutlined class="picker-caret" :class="{ 'is-open': open }" aria-hidden="true" />
    </button>

    <Transition name="picker-pop">
      <div v-if="open" ref="pop" class="picker-pop" :style="{ marginLeft: `${shift}px` }" role="listbox" :aria-label="label" @keydown.esc.stop="close(true)">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          role="option"
          class="picker-row"
          :aria-selected="item.id === currentId"
          @click="choose(item.id)"
        >
          <span class="picker-check"><CheckOutlined v-if="item.id === currentId" aria-hidden="true" /></span>
          <span class="picker-label">{{ item.label }}</span>
          <span v-if="item.meta" class="picker-meta">{{ item.meta }}</span>
        </button>
        <div class="picker-sep" />
        <button type="button" class="picker-row picker-row--quiet" @click="act('add')">
          <span class="picker-check"><PlusOutlined aria-hidden="true" /></span>
          <span class="picker-label">{{ addLabel }}</span>
        </button>
        <button v-if="editLabel && currentId" type="button" class="picker-row picker-row--quiet" @click="act('edit')">
          <span class="picker-check"><EditOutlined aria-hidden="true" /></span>
          <span class="picker-label">{{ editLabel }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { DownOutlined, CheckOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons-vue'

/**
 * ## 판 위 이름 ▾ 목록
 *
 * 이름을 누르면 판 위에 겹쳐 뜨는 목록. 고르면 닫힘. 바깥 누르기·Esc로 닫힘.
 */
defineProps<{
  items: { id: string, label: string, meta?: string }[]
  currentId?: string
  label: string
  addLabel: string
  editLabel?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  add: []
  edit: []
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const pop = ref<HTMLElement | null>(null)

// 버튼이 화면 가운데에 있지 않으면(예: '내 D-day'는 왼쪽) 목록이 화면 밖으로 나갔음 → 좌우 16px 안으로 밀기
const GUTTER = 16
const shift = ref(0)
const keepInView = () => {
  shift.value = 0
  const rect = pop.value?.getBoundingClientRect()
  if (!rect) return
  if (rect.left < GUTTER) shift.value = GUTTER - rect.left
  else if (rect.right > window.innerWidth - GUTTER) shift.value = window.innerWidth - GUTTER - rect.right
}

const onOutside = (event: PointerEvent) => {
  if (!root.value?.contains(event.target as Node)) close(false)
}

watch(open, async isOpen => {
  if (isOpen) {
    document.addEventListener('pointerdown', onOutside)
    await nextTick()
    keepInView()
    root.value?.querySelector<HTMLElement>('.picker-row[aria-selected="true"], .picker-row')?.focus()
  } else {
    document.removeEventListener('pointerdown', onOutside)
  }
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutside))

const toggle = () => { open.value = !open.value }

const close = (refocus: boolean) => {
  open.value = false
  if (refocus) trigger.value?.focus()
}

const choose = (id: string) => {
  close(true)
  emit('select', id)
}

const act = (kind: 'add' | 'edit') => {
  close(false)
  if (kind === 'add') emit('add')
  else emit('edit')
}
</script>

<style scoped>
.picker {
  position: relative;
  display: flex;
  justify-content: center;
}

.picker-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.picker-trigger:hover {
  background: rgba(var(--color-canvas-default-rgb), 0.5);
}

.picker-trigger:focus-visible {
  outline: 2px solid var(--color-accent-fg);
  outline-offset: 2px;
}

.picker-caret {
  font-size: 14px;
  color: var(--color-fg-muted);
  transition: transform 0.2s;
}

.picker-caret.is-open {
  transform: rotate(180deg);
}

.picker-pop {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  z-index: 30;
  width: min(300px, calc(100vw - 32px));
  max-height: 60vh;
  overflow-y: auto;
  transform: translateX(-50%);
  padding: 6px;
  border-radius: 14px;
  background: var(--color-canvas-default);
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-large);
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 8px 10px;
  border: none;
  border-radius: 10px;
  background: none;
  color: var(--color-fg-default);
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.picker-row:hover,
.picker-row:focus-visible {
  background: var(--color-canvas-subtle);
  outline: none;
}

.picker-row--quiet {
  color: var(--color-fg-muted);
}

.picker-check {
  display: inline-flex;
  width: 16px;
  color: var(--color-accent-fg);
}

.picker-row--quiet .picker-check {
  color: var(--color-fg-muted);
}

.picker-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-meta {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--color-fg-muted);
}

.picker-sep {
  height: 1px;
  margin: 4px 8px;
  background: var(--color-border-default);
}

.picker-pop-enter-active,
.picker-pop-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}

.picker-pop-enter-from,
.picker-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

@media (prefers-reduced-motion: reduce) {
  .picker-pop-enter-active,
  .picker-pop-leave-active,
  .picker-caret {
    transition: none;
  }
}
</style>
