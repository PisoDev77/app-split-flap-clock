<template>
  <details class="ui-collapse__panel" :open="isOpen" @toggle="onToggle">
    <summary class="ui-collapse__header">{{ header }}</summary>
    <div class="ui-collapse__body">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { collapseKey } from './collapse'

/**
 * ## 접기 목록의 한 칸
 *
 * 브라우저 기본 details/summary라 키보드·스크린 리더를 그대로 지원합니다.
 */
const props = defineProps<{
  panelKey: string
  header: string
}>()

const collapse = inject(collapseKey, null)
const isOpen = computed(() => collapse?.activeKeys.value.includes(props.panelKey) ?? false)

const onToggle = (event: Event) => {
  const open = (event.target as HTMLDetailsElement).open
  if (open !== isOpen.value) collapse?.toggle(props.panelKey, open)
}
</script>
