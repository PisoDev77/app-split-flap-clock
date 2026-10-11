<template>
  <button
    type="button"
    role="switch"
    class="ui-switch"
    :class="{ 'ui-switch--on': checked }"
    :aria-checked="checked"
    :disabled="disabled"
    @click="emit('update:checked', !checked)"
  >
    <span class="ui-switch__thumb" />
  </button>
</template>

<script setup lang="ts">
/**
 * ## 켜기/끄기 스위치
 */
defineProps<{
  checked?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:checked': [checked: boolean]
}>()
</script>
