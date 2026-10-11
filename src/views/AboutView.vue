<template>
  <div class="about-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton 
            type="text" 
            :icon="ArrowLeftOutlined"
            class="back-btn"
            aria-label="이전 페이지로 돌아가기"
            @click="goBack"
          >
            뒤로
          </UiButton>
          <h1 class="page-title">소개</h1>
          <div class="header-spacer" />
        </div>
      </header>
      
      <div class="content">
        <div class="about-container" role="main">
          <UiCard class="hero-card">
            <div class="hero-content">
              <div class="app-icon">
                <img src="/icons/icon-192x192.png" alt="Split Flap Clock">
              </div>
              <h2 class="app-name">Split Flap Clock</h2>
              <p class="app-description">
                클래식한 분할 플랩 디스플레이로 시간을 표시하는 아름다운 시계 앱
              </p>
            </div>
          </UiCard>

          <UiCard class="info-card" title="🎯 앱의 목적">
            <p>
              Split Flap Clock은 공항이나 기차역에서 볼 수 있는 클래식한 분할 플랩 디스플레이를 
              디지털로 재현한 시계 앱입니다. 단순히 시간을 확인하는 것을 넘어서, 
              향수를 불러일으키는 아날로그적 감성과 현대적 기능을 결합했습니다.
            </p>
          </UiCard>

          <UiCard class="info-card" title="✨ 주요 기능">
            <div class="ui-stack feature-list">
              <div class="feature-item">
                <h3>🌍 전 세계 시간대 지원</h3>
                <p>세계 주요 도시의 시간을 실시간으로 확인할 수 있습니다.</p>
              </div>
              <div class="feature-item">
                <h3>📍 기기 시간대 자동 설정</h3>
                <p>위치 권한 없이 기기의 시간대를 읽어 현재 도시의 시간을 보여줍니다. 서머타임도 자동으로 반영됩니다.</p>
              </div>
              <div class="feature-item">
                <h3>🎨 다양한 테마</h3>
                <p>라이트, 다크, 시스템 설정에 따른 테마를 지원합니다.</p>
              </div>
              <div class="feature-item">
                <h3>🎭 애니메이션 효과</h3>
                <p>시간대별 동적 배경과 파티클 효과로 생동감 있는 화면을 제공합니다.</p>
              </div>
              <div class="feature-item">
                <h3>📱 반응형 디자인</h3>
                <p>모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 경험을 제공합니다.</p>
              </div>
              <div class="feature-item">
                <h3>⚡ PWA 지원</h3>
                <p>앱처럼 설치하여 오프라인에서도 사용할 수 있습니다.</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="info-card" title="🛠️ 기술 스택">
            <div class="tech-stack">
              <UiTag color="blue">Vue 3</UiTag>
              <UiTag color="green">TypeScript</UiTag>
              <UiTag color="purple">Day.js</UiTag>
              <UiTag color="orange">Vite</UiTag>
              <UiTag color="red">PWA</UiTag>
              <UiTag color="cyan">CSS3 Animations</UiTag>
            </div>
          </UiCard>

          <UiCard class="info-card" title="🎨 디자인 철학">
            <p>
              Split Flap Clock은 <strong>미니멀리즘</strong>과 <strong>기능성</strong>을 추구합니다. 
              복잡한 기능보다는 시간 확인이라는 본질적 목적에 충실하면서도, 
              사용자에게 즐거운 경험을 제공하는 것을 목표로 합니다.
            </p>
            <br>
            <p>
              클래식한 분할 플랩 디스플레이의 물리적 움직임을 CSS 애니메이션으로 섬세하게 구현하여, 
              디지털 환경에서도 아날로그적 따뜻함을 느낄 수 있도록 했습니다.
            </p>
          </UiCard>

          <UiCard class="info-card" title="🌟 특별한 가치">
            <div class="ui-stack ui-stack--middle">
              <div class="value-item">
                <h3>⏰ 시간에 대한 새로운 인식</h3>
                <p>단순한 숫자가 아닌, 물리적 움직임이 있는 시간 표시로 시간의 흐름을 더욱 생생하게 느낄 수 있습니다.</p>
              </div>
              <div class="value-item">
                <h3>🎯 집중력 향상</h3>
                <p>산만한 요소 없이 깔끔한 인터페이스로 시간에만 집중할 수 있어 업무나 학습에 도움이 됩니다.</p>
              </div>
              <div class="value-item">
                <h3>🌈 감성적 경험</h3>
                <p>향수를 불러일으키는 레트로 디자인으로 일상에 작은 즐거움을 더합니다.</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="info-card" title="📞 개발자 정보">
            <div class="developer-info">
              <p><strong>개발자:</strong> Piso Developer</p>
              <p><strong>문의:</strong> <a href="https://github.com/PisoDev77/app-split-flap-clock/issues" target="_blank" rel="noopener">GitHub Issues</a></p>
              <p><strong>버전:</strong> 1.5</p>
              <p><strong>최종 업데이트:</strong> {{ lastUpdated }}</p>
            </div>
          </UiCard>
        </div>
      </div>
      
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiTag from '@/components/ui/UiTag.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'

const goBack = useGoBack()

// 실제로 앱을 고친 날짜 (예전에는 볼 때마다 오늘 날짜가 표시됨)
const lastUpdated = '2026년 10월 12일'
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-canvas-default);
}

.header {
  background: var(--color-canvas-default);
  border-bottom: 1px solid var(--color-border-default);
  height: 64px;
  padding: 0 24px;
  box-shadow: var(--shadow-small);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  color: var(--color-accent-fg);
  border: none;
  margin-right: 16px;
}

.back-btn:hover {
  background: var(--color-canvas-subtle);
}

.page-title {
  color: var(--color-fg-default);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.header-spacer {
  width: 80px;
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  border-radius: 16px;
  box-shadow: var(--shadow-large);
  border: 1px solid var(--color-border-default);
  background: linear-gradient(135deg, var(--color-canvas-default) 0%, var(--color-canvas-subtle) 100%);
}

.hero-content {
  text-align: center;
  padding: 2rem;
}

.app-icon img {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-medium);
}

.app-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-fg-default);
  margin: 0 0 1rem 0;
}

.app-description {
  font-size: 1.1rem;
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 0;
}

.info-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
  animation: slideInUp 0.6s ease-out;
}

.info-card:nth-child(even) {
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.feature-list {
  width: 100%;
}

.feature-item {
  padding: 1rem;
  border-radius: 8px;
  background: var(--color-canvas-subtle);
  border: 1px solid var(--color-border-muted);
}

.feature-item h3 {
  color: var(--color-fg-default);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.feature-item p {
  color: var(--color-fg-muted);
  margin: 0;
  line-height: 1.5;
}

.value-item h4 {
  color: var(--color-fg-default);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.value-item p {
  color: var(--color-fg-muted);
  margin: 0;
  line-height: 1.5;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.developer-info p {
  margin: 0.5rem 0;
  color: var(--color-fg-default);
}

.developer-info a {
  color: var(--color-accent-fg);
  text-decoration: underline;
}

.developer-info strong {
  color: var(--color-accent-fg);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .content {
    padding: 16px;
  }
  
  .about-container {
    gap: 16px;
  }
  
  .hero-content {
    padding: 1.5rem;
  }
  
  .app-name {
    font-size: 1.5rem;
  }
  
  .app-description {
    font-size: 1rem;
  }
  
  .app-icon img {
    width: 64px;
    height: 64px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .content {
    padding: 12px;
  }
  
  .hero-content {
    padding: 1rem;
  }
  
  .header-spacer {
    width: 60px;
  }
}
</style>