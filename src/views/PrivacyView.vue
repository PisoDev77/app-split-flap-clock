<template>
  <div class="privacy-container">
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
          <li>위치 기반 시간대 자동 설정</li>
          <li>사용자 맞춤형 설정 저장</li>
          <li>서비스 개선 및 최적화</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>2. 개인정보의 수집 및 이용</h2>
        <h3>2.1 수집하는 개인정보 항목</h3>
        <ul>
          <li><strong>위치 정보:</strong> 현재 시간대 자동 감지를 위한 대략적인 위치 정보</li>
          <li><strong>사용자 설정:</strong> 선택한 도시, 테마 설정, 언어 설정</li>
          <li><strong>기기 정보:</strong> 브라우저 종류, 운영체제, 화면 해상도 (서비스 최적화용)</li>
        </ul>

        <h3>2.2 개인정보 수집 방법</h3>
        <ul>
          <li>사용자의 직접적인 제공 (설정 변경 시)</li>
          <li>브라우저의 위치 서비스 API (사용자 동의 시에만)</li>
          <li>로컬 스토리지를 통한 설정 저장</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>3. 개인정보의 보유 및 이용기간</h2>
        <ul>
          <li><strong>위치 정보:</strong> 즉시 처리 후 삭제 (서버에 저장하지 않음)</li>
          <li><strong>사용자 설정:</strong> 사용자가 삭제하거나 브라우저 데이터를 삭제할 때까지</li>
          <li><strong>기기 정보:</strong> 세션 종료 시 자동 삭제</li>
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
          <li>브라우저 설정에서 위치 정보 접근 거부</li>
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
        <p>Split Flap Clock은 다음과 같은 목적으로 로컬 스토리지를 사용합니다:</p>
        <ul>
          <li>사용자 설정 저장 (테마, 선택된 도시)</li>
          <li>PWA 기능을 위한 캐시 데이터</li>
          <li>앱 성능 최적화</li>
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
          <p><strong>이메일:</strong> privacy@splitflapclock.com</p>
          <p><strong>처리방침 시행일:</strong> {{ lastUpdated }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * ## 개인정보처리방침 페이지
 * 
 * **Google Play Store 출시를 위한 필수 페이지**
 * 
 * Split Flap Clock의 개인정보 처리 방침을 상세히 설명합니다.
 */

const lastUpdated = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--border-color, #e8e8e8);
}

.privacy-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color, #1890ff);
}

.last-updated {
  color: var(--text-color-secondary, #666);
  font-size: 0.9rem;
}

.privacy-content {
  text-align: left;
}

.privacy-section {
  margin-bottom: 2.5rem;
}

.privacy-section h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--primary-color, #1890ff);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
}

.privacy-section h3 {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.8rem 0;
  color: var(--text-color, #333);
}

.privacy-section p {
  margin-bottom: 1rem;
  color: var(--text-color, #333);
}

.privacy-section ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.privacy-section li {
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
}

.privacy-section strong {
  color: var(--primary-color, #1890ff);
}

.contact-info {
  background: var(--background-color-light, #f8f9fa);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.contact-info p {
  margin-bottom: 0.5rem;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .privacy-container {
    color: #e8e8e8;
  }
  
  .privacy-header h1 {
    color: #4096ff;
  }
  
  .privacy-section h2 {
    color: #4096ff;
  }
  
  .privacy-section h3,
  .privacy-section p,
  .privacy-section li {
    color: #e8e8e8;
  }
  
  .privacy-section strong {
    color: #4096ff;
  }
  
  .contact-info {
    background: #1f1f1f;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
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