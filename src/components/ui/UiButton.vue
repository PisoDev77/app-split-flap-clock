<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :target="href ? target : undefined"
    :rel="href && target === '_blank' ? 'noopener' : undefined"
    :type="href ? undefined : 'button'"
    :disabled="href ? undefined : (disabled || loading)"
    class="ui-btn"
    :class="[`ui-btn--${type}`, `ui-btn--${size}`, { 'ui-btn--block': block, 'ui-btn--loading': loading }]"
  >
    <span v-if="loading" class="ui-btn__spinner" aria-hidden="true" />
    <component :is="icon" v-else-if="icon" class="ui-btn__icon" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

/**
 * ## 버튼
 *
 * href가 있으면 링크(a), 없으면 버튼으로 그립니다.
 * icon에는 h(Icon)가 아니라 아이콘 컴포넌트 자체를 넘깁니다 (매 렌더 새 VNode를 넘기면 갱신 오류).
 */
withDefaults(defineProps<{
  type?: 'primary' | 'default' | 'text'
  size?: 'small' | 'middle' | 'large'
  icon?: Component
  loading?: boolean
  disabled?: boolean
  block?: boolean
  href?: string
  target?: string
}>(), {
  type: 'default',
  size: 'middle',
  icon: undefined,
  href: undefined,
  target: undefined
})
</script>
