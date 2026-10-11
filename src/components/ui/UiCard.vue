<template>
  <section class="ui-card" :class="{ 'ui-card--borderless': bordered === false }">
    <header v-if="title || $slots.title" class="ui-card__head">
      <slot name="title">{{ title }}</slot>
    </header>
    <div class="ui-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * ## 카드
 */
defineProps<{
  title?: string
  bordered?: boolean
}>()
</script>
