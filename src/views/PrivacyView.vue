<template>
  <div class="privacy-view">
    <header class="header">
      <div class="header-content">
        <UiButton
          type="text"
          :icon="ArrowLeftOutlined"
          class="back-btn"
          :aria-label="isEn ? 'Go back' : '이전 페이지로 돌아가기'"
          @click="goBack"
        >
          {{ isEn ? 'Back' : '뒤로' }}
        </UiButton>
      </div>
    </header>

    <div class="privacy-container" role="main">
      <template v-if="!isEn">
        <div class="privacy-header">
          <h1>개인정보처리방침</h1>
          <p class="last-updated">최종 수정일: {{ lastUpdated }}</p>
        </div>

        <div class="privacy-content">
          <section class="privacy-section">
            <h2>1. 개인정보의 처리 목적</h2>
            <p>Split Flap Clock("회사" 또는 "서비스")은 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ul>
              <li>서비스 제공 및 기능 구현</li>
              <li>기기 시간대 기준 시간 표시</li>
              <li>사용자 맞춤형 설정 저장</li>
              <li>서비스 개선 및 최적화</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>2. 개인정보의 수집 및 이용</h2>
            <h3>2.1 수집하는 개인정보 항목</h3>
            <ul>
              <li><strong>위치 정보:</strong> 수집하지 않습니다. GPS나 위치 권한을 사용하지 않으며, 기기에 설정된 시간대만 기기 안에서 읽습니다.</li>
              <li><strong>사용자 설정:</strong> 선택한 도시, 테마, 배경 효과 설정 (이 기기 안에만 저장)</li>
              <li><strong>기기 정보:</strong> 수집하지 않습니다. 화면 크기는 화면을 맞게 그리는 데만 기기 안에서 쓰고 어디에도 보내지 않습니다.</li>
            </ul>

            <h3>2.2 개인정보 수집 방법</h3>
            <ul>
              <li>사용자의 직접적인 제공 (설정 변경 시)</li>
              <li>로컬 스토리지를 통한 설정 저장</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>3. 개인정보의 보유 및 이용기간</h2>
            <ul>
              <li><strong>사용자 설정:</strong> 사용자가 삭제하거나 브라우저 데이터를 삭제할 때까지</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>4. 개인정보의 제3자 제공</h2>
            <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:</p>
            <ul>
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>5. 개인정보 처리의 위탁</h2>
            <p>현재 Split Flap Clock은 개인정보 처리를 외부에 위탁하지 않습니다. 모든 데이터는 사용자의 기기에서 로컬로 처리됩니다.</p>
          </section>

          <section class="privacy-section">
            <h2>6. 이용자의 권리와 의무</h2>
            <h3>6.1 이용자의 권리</h3>
            <ul>
              <li>개인정보 수집에 대한 동의 철회 권리</li>
              <li>개인정보 처리 정지 요구 권리</li>
              <li>저장된 설정 데이터 삭제 권리</li>
            </ul>

            <h3>6.2 권리 행사 방법</h3>
            <ul>
              <li>앱 설정에서 데이터 삭제</li>
              <li>브라우저의 로컬 스토리지 삭제</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>7. 개인정보의 안전성 확보 조치</h2>
            <ul>
              <li><strong>기술적 조치:</strong> HTTPS 암호화 통신</li>
              <li><strong>관리적 조치:</strong> 개인정보 최소 수집 원칙 준수</li>
              <li><strong>물리적 조치:</strong> 로컬 저장소 활용으로 서버 전송 최소화</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>8. 쿠키 및 로컬 스토리지</h2>
            <p>Split Flap Clock은 쿠키를 쓰지 않으며, 다음 목적으로만 이 기기의 로컬 스토리지를 사용합니다. 이 데이터는 서버로 보내지 않습니다:</p>
            <ul>
              <li>사용자 설정 저장 (테마, 선택된 도시, 배경 효과)</li>
              <li>오프라인 사용을 위한 앱 파일 캐시</li>
            </ul>
            <p>사용자는 브라우저 설정을 통해 언제든지 이러한 데이터를 삭제할 수 있습니다.</p>
          </section>

          <section class="privacy-section">
            <h2>9. 어린이 개인정보 보호</h2>
            <p>Split Flap Clock은 만 14세 미만 어린이로부터 개인정보를 의도적으로 수집하지 않습니다. 만약 만 14세 미만 어린이의 개인정보가 수집된 것을 발견하면, 즉시 삭제 조치를 취합니다.</p>
          </section>

          <section class="privacy-section">
            <h2>10. 개인정보처리방침의 변경</h2>
            <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
          </section>

          <section class="privacy-section">
            <h2>11. 문의처</h2>
            <p>개인정보 처리에 관한 문의사항이 있으시면 아래의 연락처로 문의해 주시기 바랍니다:</p>
            <div class="contact-info">
              <p><strong>앱 이름:</strong> Split Flap Clock</p>
              <p><strong>개발자:</strong> Piso Developer</p>
              <p><strong>문의:</strong> <a href="https://github.com/PisoDev77/app-split-flap-clock/issues" target="_blank" rel="noopener">GitHub Issues</a> (GitHub 계정 필요, 글은 공개되니 개인정보는 적지 마세요)</p>
              <p><strong>처리방침 시행일:</strong> {{ lastUpdated }}</p>
            </div>
          </section>
        </div>
      </template>

      <template v-else>
        <div class="privacy-header">
          <h1>Privacy Policy</h1>
          <p class="last-updated">Last updated: {{ lastUpdatedEn }}</p>
        </div>

        <div class="privacy-content">
          <section class="privacy-section">
            <h2>1. Summary</h2>
            <p>Split Flap Clock ("the app") does not collect, store on a server, or share any personal data. Everything runs on your device.</p>
          </section>

          <section class="privacy-section">
            <h2>2. What the app uses</h2>
            <ul>
              <li><strong>Location:</strong> not collected. The app never asks for location permission; it only reads the time zone set on your device, on your device.</li>
              <li><strong>Your settings:</strong> city, theme, background effect and timer state are saved in your browser's local storage on this device only.</li>
              <li><strong>Device information:</strong> not collected. Screen size is used only on your device to lay out the clock.</li>
            </ul>
          </section>

          <section class="privacy-section">
            <h2>3. Cookies, analytics and ads</h2>
            <p>The app uses no cookies, no analytics or tracking tools and no ads. App files are cached on your device so the clock works offline.</p>
          </section>

          <section class="privacy-section">
            <h2>4. Sharing with third parties</h2>
            <p>No personal data is shared with anyone. The only outside request is for the SUIT web font from a public CDN (cdn.jsdelivr.net), which receives the standard information any web request includes.</p>
          </section>

          <section class="privacy-section">
            <h2>5. Your choices</h2>
            <p>You can delete all saved settings at any time by clearing this site's data in your browser or app settings.</p>
          </section>

          <section class="privacy-section">
            <h2>6. Children</h2>
            <p>The app does not knowingly collect personal data from anyone, including children.</p>
          </section>

          <section class="privacy-section">
            <h2>7. Changes and contact</h2>
            <p>If this policy changes, the date above will be updated. Questions are welcome on <a href="https://github.com/PisoDev77/app-split-flap-clock/issues" target="_blank" rel="noopener">GitHub Issues</a> (a GitHub account is needed and posts are public, so please do not include personal information).</p>
            <p>The Korean version of this policy is the original; if they differ, the Korean version applies.</p>
          </section>
        </div>
      </template>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useLocale } from '@/composables/useLocale'

/**
 * ## 개인정보처리방침 페이지
 * 
 * **Google Play Store 출시를 위한 필수 페이지**
 * 
 * Split Flap Clock의 개인정보 처리 방침을 상세히 설명합니다.
 */

// 정책을 바꾸면 이 날짜도 함께 바꿉니다 (예전에는 볼 때마다 오늘 날짜로 표시됨)
const lastUpdated = '2026년 10월 11일'
const lastUpdatedEn = 'October 12, 2026'

const { isEn } = useLocale()

const goBack = useGoBack()
</script>

<style scoped>
.privacy-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
}

.header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-canvas-default);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  color: var(--color-accent-fg);
}

.privacy-container {
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.8;
}

.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--color-border-default);
}

.privacy-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-accent-fg);
}

.last-updated {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.privacy-section {
  margin-bottom: 2.5rem;
}

.privacy-section h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-default);
  color: var(--color-accent-fg);
}

.privacy-section h3 {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.8rem;
}

.privacy-section p {
  margin-bottom: 1rem;
}

.privacy-section ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.privacy-section li {
  margin-bottom: 0.5rem;
}

.privacy-section strong {
  color: var(--color-accent-fg);
}

.contact-info {
  margin-top: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--color-canvas-subtle);
}

.contact-info p {
  margin-bottom: 0.5rem;
}

.privacy-section a {
  color: var(--color-accent-fg);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }

  .privacy-container {
    padding: 1rem;
  }

  .privacy-header h1 {
    font-size: 2rem;
  }

  .privacy-section h2 {
    font-size: 1.2rem;
  }
}
</style>
