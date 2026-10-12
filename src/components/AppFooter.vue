<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h2>Split Flap Clock</h2>
        <p>{{ t.tagline }}</p>
      </div>

      <div class="footer-section">
        <h2>{{ t.pages }}</h2>
        <ul class="footer-links">
          <li v-for="link in t.pageLinks" :key="link.to"><router-link :to="link.to">{{ link.label }}</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h2>{{ t.settings }}</h2>
        <ul class="footer-links">
          <li><router-link :to="lp('/settings')">{{ t.settings }}</router-link></li>
          <li><router-link :to="lp('/privacy')">{{ t.privacy }}</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h2>{{ t.contact }}</h2>
        <ul class="footer-links">
          <li><a href="https://github.com/PisoDev77/app-split-flap-clock/issues" target="_blank" rel="noopener">{{ t.ask }}</a></li>
          <li><a href="https://github.com/PisoDev77/app-split-flap-clock/issues/new" target="_blank" rel="noopener">{{ t.bug }}</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <div class="copyright">
          <p>&copy; {{ currentYear }} Split Flap Clock. Made with ❤️ by Piso Developer</p>
        </div>
        <div class="footer-links-bottom">
          <router-link :to="languageLink" :lang="isEn ? 'ko' : 'en'">{{ isEn ? '한국어' : 'English' }}</router-link>
          <span class="separator">•</span>
          <a href="/sitemap.xml" target="_blank">{{ t.sitemap }}</a>
          <span class="separator">•</span>
          <a href="https://github.com/PisoDev77/app-split-flap-clock" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale, alternatePath } from '@/composables/useLocale'

const currentYear = computed(() => new Date().getFullYear())
const route = useRoute()
const { isEn, lp, pick } = useLocale()

const t = pick({
  ko: {
    tagline: '클래식한 분할 플랩 디스플레이로 시간을 확인하세요',
    pages: '페이지',
    pageLinks: [
      { to: '/about', label: '소개' },
      { to: '/guide', label: '사용법 가이드' },
      { to: '/timezone', label: '세계 시간대' },
      { to: '/study', label: '공부 시계' },
      { to: '/faq', label: '자주 묻는 질문' }
    ],
    settings: '설정', privacy: '개인정보처리방침', contact: '연락처', ask: '문의하기', bug: '버그 신고', sitemap: '사이트맵'
  },
  en: {
    tagline: 'A classic split-flap clock for your desk',
    pages: 'Pages',
    pageLinks: [
      { to: '/en', label: 'Flip clock' },
      { to: '/en/study', label: 'Study clock' },
      { to: '/en/world-clock', label: 'World clock' },
      { to: '/en/time/seoul', label: 'Korea time now' }
    ],
    settings: 'Settings', privacy: 'Privacy policy', contact: 'Contact', ask: 'Ask a question', bug: 'Report a bug', sitemap: 'Sitemap'
  }
})

// 지금 페이지의 다른 언어판 (없으면 그 언어 홈)
const languageLink = computed(() => alternatePath(route.path) ?? (isEn.value ? '/' : '/en'))
</script>

<style scoped>
.app-footer {
  background: var(--color-canvas-default);
  border-top: 1px solid var(--color-border-default);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section h2 {
  color: var(--color-fg-default);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--color-accent-fg);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.footer-section p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: var(--color-fg-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-accent-fg);
}

.footer-bottom {
  background: var(--color-canvas-subtle);
  border-top: 1px solid var(--color-border-muted);
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright p {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
  margin: 0;
}

.footer-links-bottom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-links-bottom a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  color: var(--color-fg-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links-bottom a:hover {
  color: var(--color-accent-fg);
}

.separator {
  color: var(--color-fg-muted);
  font-size: 0.8rem;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 1rem 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }
  
  .footer-bottom-content {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .footer-section h2 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 1.5rem 0.75rem 1rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-section {
    text-align: center;
  }
  
  .footer-bottom-content {
    padding: 1rem 0.75rem;
  }
}

/* 다크 모드 스타일 조정 */
@media (prefers-color-scheme: dark) {
  .footer-links a:hover,
  .footer-links-bottom a:hover {
    color: #4096ff;
  }
}
</style>