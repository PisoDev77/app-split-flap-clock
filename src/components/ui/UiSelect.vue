<template>
  <div class="ui-select" :class="{ 'ui-select--disabled': disabled }">
    <select
      class="ui-select__native"
      :value="value ?? ''"
      :disabled="disabled"
      v-bind="$attrs"
      @change="onChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
/**
 * ## 선택 상자
 *
 * 브라우저 기본 select를 써서 가볍고, 휴대폰에서는 기기 고유의 선택 화면이 열립니다.
 */
defineOptions({ inheritAttrs: false })

defineProps<{
  value?: string
  options: { value: string, label: string }[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: string]
  change: [value: string]
}>()

const onChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  emit('update:value', value)
  emit('change', value)
}
</script>
