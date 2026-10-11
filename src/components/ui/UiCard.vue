<template>
  <section class="ui-card" :class="{ 'ui-card--borderless': bordered === false }">
    <!-- 직접 꾸민 제목(slot)은 안에 제목 태그가 있을 수 있어 header로, 글자 제목은 h2로 -->
    <header v-if="$slots.title" class="ui-card__head">
      <slot name="title" />
    </header>
    <h2 v-else-if="title" class="ui-card__head">{{ title }}</h2>
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
