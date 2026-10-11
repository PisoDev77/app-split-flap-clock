<template>
  <div class="not-found" role="main">
    <SplitFlapDisplay text="404" />
    <h1 class="title">페이지를 찾을 수 없어요</h1>
    <p class="description">주소가 바뀌었거나 없는 페이지예요.</p>
    <UiButton type="primary" size="large" :icon="HomeOutlined" @click="$router.replace('/')">
      시계로 돌아가기
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { HomeOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import UiButton from '@/components/ui/UiButton.vue'

/**
 * ## 없는 주소 안내
 *
 * 등록되지 않은 주소로 들어오면 빈 화면 대신 이 페이지를 보여줍니다.
 */
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px;
  text-align: center;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
}

.title {
  margin-top: 8px;
  font-size: 1.5rem;
  font-weight: 600;
}

.description {
  margin-bottom: 8px;
  color: var(--color-fg-muted);
}
</style>
