<template>
  <div class="ui-collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue'
import { collapseKey } from './collapse'

/**
 * ## 접기 목록
 *
 * activeKey: 펼쳐진 패널들의 key
 */
const props = withDefaults(defineProps<{
  activeKey?: string[]
}>(), {
  activeKey: () => []
})

const emit = defineEmits<{
  'update:activeKey': [keys: string[]]
}>()

provide(collapseKey, {
  activeKeys: toRef(props, 'activeKey'),
  toggle: (key: string, open: boolean) => {
    const keys = props.activeKey.filter(k => k !== key)
    emit('update:activeKey', open ? [...keys, key] : keys)
  }
})
</script>
