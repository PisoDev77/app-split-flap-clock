<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Split Flap Clock</h4>
        <p>클래식한 분할 플랩 디스플레이로 시간을 확인하세요</p>
      </div>
      
      <div class="footer-section">
        <h4>페이지</h4>
        <ul class="footer-links">
          <li><router-link to="/about">소개</router-link></li>
          <li><router-link to="/guide">사용법 가이드</router-link></li>
          <li><router-link to="/timezone">세계 시간대</router-link></li>
          <li><router-link to="/faq">자주 묻는 질문</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>설정</h4>
        <ul class="footer-links">
          <li><router-link to="/settings">설정</router-link></li>
          <li><router-link to="/privacy">개인정보처리방침</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>연락처</h4>
        <ul class="footer-links">
          <li><a href="mailto:contact@splitflapclock.com">이메일 문의</a></li>
          <li><a href="mailto:support@splitflapclock.com">기술 지원</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <div class="copyright">
          <p>&copy; {{ currentYear }} Split Flap Clock. Made with ❤️ by Piso Developer</p>
        </div>
        <div class="footer-links-bottom">
          <a href="/sitemap.xml" target="_blank">사이트맵</a>
          <span class="separator">•</span>
          <a href="https://github.com/piso-split-flap" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
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

.footer-section h4 {
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
  
  .footer-section h4 {
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