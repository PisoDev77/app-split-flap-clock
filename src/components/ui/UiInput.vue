<template>
  <label class="ui-input" :class="`ui-input--${size}`">
    <component :is="prefix" v-if="prefix" class="ui-input__prefix" />
    <input
      class="ui-input__native"
      type="text"
      :value="value"
      :placeholder="placeholder"
      v-bind="$attrs"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    >
  </label>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

/**
 * ## 글 입력칸
 */
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  value?: string
  placeholder?: string
  prefix?: Component
  size?: 'middle' | 'large'
}>(), {
  value: '',
  placeholder: undefined,
  prefix: undefined,
  size: 'middle'
})

const emit = defineEmits<{
  'update:value': [value: string]
}>()
</script>
