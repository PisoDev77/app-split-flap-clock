<template>
  <span class="ui-tag" :class="`ui-tag--${color}`"><slot /></span>
</template>

<script setup lang="ts">
/**
 * ## 태그
 */
withDefaults(defineProps<{
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'red' | 'default'
}>(), {
  color: 'default'
})
</script>
