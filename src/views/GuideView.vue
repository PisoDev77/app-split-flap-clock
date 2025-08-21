<template>
  <div class="guide-view">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-content">
          <a-button 
            type="text" 
            :icon="h(ArrowLeftOutlined)"
            @click="$router.back()"
            class="back-btn"
            aria-label="이전 페이지로 돌아가기"
          >
            뒤로
          </a-button>
          <h1 class="page-title">사용법 가이드</h1>
          <div class="header-spacer"></div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="guide-container" role="main">
          <a-card class="intro-card">
            <h2>📖 Split Flap Clock 사용법</h2>
            <p>
              Split Flap Clock의 모든 기능을 효과적으로 활용하는 방법을 단계별로 안내합니다. 
              각 기능의 상세한 사용법과 팁을 확인해보세요.
            </p>
          </a-card>

          <a-collapse v-model:activeKey="activeKeys" ghost>
            <a-collapse-panel key="1" header="🏠 메인 화면 사용법">
              <div class="guide-section">
                <h3>시간 표시 영역</h3>
                <ul>
                  <li><strong>분할 플랩 디스플레이:</strong> 시, 분, 초가 각각 분할된 플랩 형태로 표시됩니다</li>
                  <li><strong>실시간 업데이트:</strong> 매초마다 자동으로 시간이 업데이트됩니다</li>
                  <li><strong>애니메이션 효과:</strong> 숫자가 바뀔 때 부드러운 플랩 애니메이션이 적용됩니다</li>
                </ul>

                <h3>도시 정보</h3>
                <ul>
                  <li><strong>현재 도시 표시:</strong> 선택된 도시명이 한국어로 표시됩니다</li>
                  <li><strong>자동 감지:</strong> 위치 허용 시 현재 위치의 도시가 자동으로 설정됩니다</li>
                  <li><strong>수동 변경:</strong> 설정에서 원하는 도시로 변경 가능합니다</li>
                </ul>

                <h3>날짜 정보</h3>
                <ul>
                  <li><strong>전체 날짜:</strong> 연도, 월, 일, 요일이 한국어로 표시됩니다</li>
                  <li><strong>시간대 반영:</strong> 선택된 도시의 시간대에 맞는 날짜가 표시됩니다</li>
                </ul>

                <h3>설정 버튼</h3>
                <ul>
                  <li><strong>위치:</strong> 화면 우상단의 톱니바퀴 아이콘</li>
                  <li><strong>기능:</strong> 클릭하면 설정 페이지로 이동합니다</li>
                </ul>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="2" header="⚙️ 설정 페이지 활용법">
              <div class="guide-section">
                <h3>1. 시간 및 위치 설정</h3>
                <h4>도시 선택</h4>
                <ul>
                  <li><strong>드롭다운 메뉴:</strong> 지원되는 전 세계 주요 도시 목록에서 선택</li>
                  <li><strong>검색 기능:</strong> 도시명을 입력하여 빠르게 찾을 수 있습니다</li>
                  <li><strong>시간대 표시:</strong> 각 도시의 GMT/UTC 오프셋이 함께 표시됩니다</li>
                </ul>

                <h4>현재 위치로 설정</h4>
                <ul>
                  <li><strong>GPS 사용:</strong> "현재 위치로 설정" 버튼 클릭</li>
                  <li><strong>권한 허용:</strong> 브라우저에서 위치 접근 권한을 허용해야 합니다</li>
                  <li><strong>자동 설정:</strong> 현재 위치에 가장 가까운 도시로 자동 설정됩니다</li>
                </ul>

                <h3>2. 화면 설정</h3>
                <h4>테마 모드</h4>
                <ul>
                  <li><strong>시스템 설정 따름:</strong> 기기의 다크/라이트 모드 설정을 자동으로 따릅니다</li>
                  <li><strong>라이트 모드:</strong> 밝은 배경의 테마를 강제로 적용합니다</li>
                  <li><strong>다크 모드:</strong> 어두운 배경의 테마를 강제로 적용합니다</li>
                </ul>

                <h4>테마 미리보기</h4>
                <ul>
                  <li><strong>실시간 미리보기:</strong> 설정 변경 시 즉시 미리보기에서 확인 가능</li>
                  <li><strong>배경 효과:</strong> 현재 설정된 애니메이션 효과도 함께 미리볼 수 있습니다</li>
                </ul>

                <h3>3. 애니메이션 설정</h3>
                <h4>배경 효과</h4>
                <ul>
                  <li><strong>활성화/비활성화:</strong> 시간대별 동적 배경 그라데이션 효과 제어</li>
                  <li><strong>성능 영향:</strong> 비활성화 시 배터리 절약 효과</li>
                </ul>

                <h4>파티클 효과</h4>
                <ul>
                  <li><strong>의존성:</strong> 배경 효과가 활성화되어야 사용 가능</li>
                  <li><strong>시각적 효과:</strong> 떠다니는 작은 입자들이 배경에 표시됩니다</li>
                </ul>

                <h4>애니메이션 강도</h4>
                <ul>
                  <li><strong>낮음:</strong> 최소한의 효과로 배터리 절약 (추천: 모바일)</li>
                  <li><strong>보통:</strong> 적당한 수준의 효과 (추천: 일반 사용)</li>
                  <li><strong>높음:</strong> 화려한 효과 (추천: 고성능 기기)</li>
                </ul>

                <h4>성능 모드</h4>
                <ul>
                  <li><strong>일괄 비활성화:</strong> 모든 애니메이션 효과를 한 번에 끕니다</li>
                  <li><strong>저성능 기기:</strong> 오래된 기기나 배터리 절약이 필요할 때 사용</li>
                </ul>

                <h3>4. 설정 저장</h3>
                <ul>
                  <li><strong>저장 버튼:</strong> 페이지 하단의 "설정 저장" 버튼 클릭</li>
                  <li><strong>자동 적용:</strong> 저장과 동시에 모든 설정이 즉시 적용됩니다</li>
                  <li><strong>자동 이동:</strong> 저장 후 1초 뒤 자동으로 홈 화면으로 돌아갑니다</li>
                </ul>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="3" header="🌍 위치 및 시간대 이해하기">
              <div class="guide-section">
                <h3>지원 도시 목록</h3>
                <p>Split Flap Clock은 다음 지역의 주요 도시들을 지원합니다:</p>
                <ul>
                  <li><strong>아시아:</strong> 서울, 도쿄, 베이징, 상하이, 홍콩, 싱가포르, 방콕, 자카르타</li>
                  <li><strong>유럽:</strong> 런던, 파리, 베를린, 로마, 마드리드, 암스테르담, 취리히</li>
                  <li><strong>북미:</strong> 뉴욕, 로스앤젤레스, 시카고, 토론토, 밴쿠버</li>
                  <li><strong>오세아니아:</strong> 시드니, 멜버른, 오클랜드</li>
                  <li><strong>기타:</strong> 두바이, 카이로, 요하네스버그, 상파울루</li>
                </ul>

                <h3>시간대 표기법</h3>
                <ul>
                  <li><strong>GMT+9:</strong> 한국 표준시 (서울 기준)</li>
                  <li><strong>GMT+0:</strong> 그리니치 표준시 (런던 기준)</li>
                  <li><strong>GMT-5:</strong> 동부 표준시 (뉴욕 기준)</li>
                  <li><strong>GMT-8:</strong> 태평양 표준시 (로스앤젤레스 기준)</li>
                </ul>

                <h3>위치 기능 사용 시 주의사항</h3>
                <ul>
                  <li><strong>권한 허용:</strong> 브라우저에서 위치 접근 권한을 허용해야 합니다</li>
                  <li><strong>정확성:</strong> GPS 신호에 따라 정확도가 달라질 수 있습니다</li>
                  <li><strong>개인정보:</strong> 위치 정보는 서버에 저장되지 않고 즉시 처리됩니다</li>
                </ul>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="4" header="📱 모바일 사용 팁">
              <div class="guide-section">
                <h3>PWA 설치</h3>
                <ul>
                  <li><strong>Chrome/Edge:</strong> 주소창의 "설치" 버튼 클릭</li>
                  <li><strong>Safari:</strong> 공유 버튼 → "홈 화면에 추가" 선택</li>
                  <li><strong>장점:</strong> 앱처럼 사용 가능, 빠른 실행, 오프라인 지원</li>
                </ul>

                <h3>화면 방향</h3>
                <ul>
                  <li><strong>세로 모드:</strong> 모든 정보가 세로로 배치되어 한눈에 확인 가능</li>
                  <li><strong>가로 모드:</strong> 더 큰 시계 화면으로 시간 확인에 최적화</li>
                </ul>

                <h3>성능 최적화</h3>
                <ul>
                  <li><strong>배터리 절약:</strong> 애니메이션 설정에서 "성능 모드" 활성화</li>
                  <li><strong>데이터 절약:</strong> PWA 설치 후 오프라인에서도 사용 가능</li>
                  <li><strong>빠른 실행:</strong> 홈 화면에 추가하면 앱처럼 빠르게 실행</li>
                </ul>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="5" header="🎨 시각적 커스터마이징">
              <div class="guide-section">
                <h3>테마 선택 가이드</h3>
                <ul>
                  <li><strong>라이트 모드:</strong> 밝은 환경에서 사용할 때 추천</li>
                  <li><strong>다크 모드:</strong> 어두운 환경이나 야간 사용 시 추천</li>
                  <li><strong>시스템 설정:</strong> 기기 설정에 따라 자동 변경 (추천)</li>
                </ul>

                <h3>애니메이션 효과 조합</h3>
                <ul>
                  <li><strong>최대 효과:</strong> 배경 효과 + 파티클 + 높음 강도</li>
                  <li><strong>균형 효과:</strong> 배경 효과 + 파티클 + 보통 강도 (추천)</li>
                  <li><strong>최소 효과:</strong> 배경 효과만 + 낮음 강도</li>
                  <li><strong>효과 없음:</strong> 모든 효과 비활성화 (성능 모드)</li>
                </ul>

                <h3>시간대별 배경 색상</h3>
                <ul>
                  <li><strong>새벽/밤:</strong> 어두운 청색 계열</li>
                  <li><strong>아침:</strong> 따뜻한 주황색 계열</li>
                  <li><strong>낮:</strong> 밝은 하늘색 계열</li>
                  <li><strong>저녁:</strong> 붉은 노을색 계열</li>
                </ul>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="6" header="🔧 문제 해결">
              <div class="guide-section">
                <h3>일반적인 문제</h3>
                
                <h4>시간이 정확하지 않을 때</h4>
                <ul>
                  <li>설정에서 올바른 도시가 선택되었는지 확인</li>
                  <li>기기의 시스템 시간이 정확한지 확인</li>
                  <li>페이지를 새로고침하여 시간 동기화</li>
                </ul>

                <h4>위치 기능이 작동하지 않을 때</h4>
                <ul>
                  <li>브라우저 설정에서 위치 권한 허용 확인</li>
                  <li>GPS 기능이 활성화되어 있는지 확인</li>
                  <li>실내에서는 GPS 신호가 약할 수 있음</li>
                </ul>

                <h4>애니메이션이 끊어질 때</h4>
                <ul>
                  <li>애니메이션 강도를 "낮음"으로 변경</li>
                  <li>다른 앱을 종료하여 메모리 확보</li>
                  <li>"성능 모드" 활성화 고려</li>
                </ul>

                <h4>설정이 저장되지 않을 때</h4>
                <ul>
                  <li>브라우저의 로컬 스토리지 기능 확인</li>
                  <li>시크릿/프라이빗 모드에서는 설정이 저장되지 않음</li>
                  <li>브라우저 캐시 삭제 후 재시도</li>
                </ul>

                <h3>성능 최적화 팁</h3>
                <ul>
                  <li><strong>저사양 기기:</strong> 성능 모드 사용</li>
                  <li><strong>배터리 절약:</strong> 애니메이션 효과 최소화</li>
                  <li><strong>메모리 절약:</strong> 다른 탭 닫기</li>
                  <li><strong>빠른 로딩:</strong> PWA로 설치하여 사용</li>
                </ul>
              </div>
            </a-collapse-panel>
          </a-collapse>

          <a-card class="help-card">
            <h3>💡 더 많은 도움이 필요하신가요?</h3>
            <p>
              추가적인 문의사항이나 기술적 문제가 있으시면 
              <a href="/faq">FAQ 페이지</a>를 참고하시거나 
              개발자에게 직접 문의해주세요.
            </p>
            <div class="contact-info">
              <p><strong>이메일:</strong> support@splitflapclock.com</p>
              <p><strong>응답 시간:</strong> 평일 24시간 이내</p>
            </div>
          </a-card>
        </div>
      </a-layout-content>
      
      <AppFooter />
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { Layout as ALayout, Button as AButton, Card as ACard, Collapse as ACollapse } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import AppFooter from '@/components/AppFooter.vue'

const activeKeys = ref(['1'])
</script>

<style scoped>
.guide-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  height: 100%;
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
  overflow-y: auto;
}

.guide-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.intro-card h2 {
  color: var(--color-fg-default);
  margin: 0 0 1rem 0;
}

.intro-card p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 0;
}

.guide-section h3 {
  color: var(--color-accent-fg);
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem 0;
  border-bottom: 2px solid var(--color-border-muted);
  padding-bottom: 0.5rem;
}

.guide-section h3:first-child {
  margin-top: 0;
}

.guide-section h4 {
  color: var(--color-fg-default);
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
}

.guide-section ul {
  margin: 0.5rem 0 1rem 0;
  padding-left: 1.5rem;
}

.guide-section li {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.guide-section strong {
  color: var(--color-accent-fg);
  font-weight: 600;
}

.guide-section p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 1rem 0;
}

.help-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
  background: linear-gradient(135deg, var(--color-canvas-default) 0%, var(--color-canvas-subtle) 100%);
}

.help-card h3 {
  color: var(--color-fg-default);
  margin: 0 0 1rem 0;
}

.help-card p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.help-card a {
  color: var(--color-accent-fg);
  text-decoration: underline;
}

.contact-info {
  background: var(--color-canvas-subtle);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border-muted);
}

.contact-info p {
  margin: 0.25rem 0;
  color: var(--color-fg-default);
}

.contact-info strong {
  color: var(--color-accent-fg);
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
  
  .guide-container {
    gap: 16px;
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
  
  .header-spacer {
    width: 60px;
  }
  
  .guide-section h3 {
    font-size: 1.1rem;
  }
  
  .guide-section h4 {
    font-size: 1rem;
  }
}
</style>