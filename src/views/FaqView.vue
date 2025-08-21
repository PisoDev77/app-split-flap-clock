<template>
  <div class="faq-view">
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
          <h1 class="page-title">자주 묻는 질문</h1>
          <div class="header-spacer"></div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="faq-container" role="main">
          <a-card class="intro-card">
            <h2>❓ 자주 묻는 질문 (FAQ)</h2>
            <p>
              Split Flap Clock 사용 중 궁금한 점들을 모아놨습니다. 
              원하는 답변을 찾지 못하셨다면 개발자에게 직접 문의해주세요.
            </p>
            <div class="search-box">
              <a-input 
                v-model:value="searchQuery"
                placeholder="궁금한 내용을 검색해보세요..."
                :prefix="h(SearchOutlined)"
                size="large"
                class="search-input"
                aria-label="FAQ 검색"
              />
            </div>
          </a-card>

          <a-collapse v-model:activeKey="activeKeys" ghost size="large">
            <template v-for="(faq, index) in filteredFaqs" :key="index">
              <a-collapse-panel :key="index.toString()" :header="faq.question" class="faq-panel">
                <div class="faq-answer" v-html="faq.answer"></div>
              </a-collapse-panel>
            </template>
          </a-collapse>

          <a-card class="contact-card" v-if="filteredFaqs.length === 0 && searchQuery">
            <h3>🔍 찾으시는 답변이 없나요?</h3>
            <p>검색하신 "{{ searchQuery }}"에 대한 답변을 찾을 수 없습니다.</p>
            <p>아래 연락처로 직접 문의해주시면 빠르게 도움을 드리겠습니다.</p>
            <div class="contact-info">
              <p><strong>이메일:</strong> support@splitflapclock.com</p>
              <p><strong>응답 시간:</strong> 평일 24시간 이내</p>
            </div>
          </a-card>

          <a-card class="help-card">
            <h3>💬 추가 도움이 필요하신가요?</h3>
            <p>
              더 자세한 정보는 <a href="/guide">사용법 가이드</a>를 참고하시거나, 
              아래 연락처로 문의해주세요.
            </p>
            <div class="contact-actions">
              <a-button type="primary" size="large" :icon="h(MailOutlined)">
                이메일 문의
              </a-button>
              <a-button size="large" :icon="h(BookOutlined)" @click="$router.push('/guide')">
                사용법 가이드
              </a-button>
            </div>
          </a-card>
        </div>
      </a-layout-content>
      
      <AppFooter />
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { Layout as ALayout, Button as AButton, Card as ACard, Collapse as ACollapse, Input as AInput } from 'ant-design-vue'
import { ArrowLeftOutlined, SearchOutlined, MailOutlined, BookOutlined } from '@ant-design/icons-vue'
import AppFooter from '@/components/AppFooter.vue'

const searchQuery = ref('')
const activeKeys = ref(['0'])

interface FAQ {
  question: string
  answer: string
  keywords: string[]
}

const faqs: FAQ[] = [
  {
    question: "Split Flap Clock이 무엇인가요?",
    answer: `
      <p>Split Flap Clock은 공항이나 기차역에서 볼 수 있는 <strong>분할 플랩 디스플레이</strong>를 디지털로 재현한 시계 앱입니다.</p>
      <p>클래식한 아날로그 감성과 현대적 디지털 기능을 결합하여, 단순히 시간을 확인하는 것을 넘어 향수를 불러일으키는 경험을 제공합니다.</p>
    `,
    keywords: ["앱", "소개", "기능", "분할", "플랩", "디스플레이"]
  },
  {
    question: "무료로 사용할 수 있나요?",
    answer: `
      <p>네, Split Flap Clock은 <strong>완전 무료</strong>로 사용하실 수 있습니다.</p>
      <p>모든 기능을 제한 없이 이용하실 수 있으며, 별도의 회원가입이나 결제가 필요하지 않습니다.</p>
    `,
    keywords: ["무료", "비용", "결제", "회원가입"]
  },
  {
    question: "모바일에서 앱처럼 설치할 수 있나요?",
    answer: `
      <p>네, <strong>PWA(Progressive Web App)</strong> 기술을 통해 앱처럼 설치하여 사용할 수 있습니다.</p>
      <ul>
        <li><strong>Chrome/Edge:</strong> 주소창의 "설치" 버튼을 클릭하세요</li>
        <li><strong>Safari:</strong> 공유 버튼 → "홈 화면에 추가"를 선택하세요</li>
        <li><strong>장점:</strong> 오프라인 사용 가능, 빠른 실행, 앱스토어 없이 설치</li>
      </ul>
    `,
    keywords: ["설치", "PWA", "모바일", "앱", "홈화면", "오프라인"]
  },
  {
    question: "위치 정보가 정확하지 않아요",
    answer: `
      <p>위치 기능이 정확하지 않을 때는 다음을 확인해보세요:</p>
      <ul>
        <li><strong>권한 확인:</strong> 브라우저에서 위치 접근 권한을 허용했는지 확인</li>
        <li><strong>GPS 활성화:</strong> 기기의 GPS/위치 서비스가 켜져 있는지 확인</li>
        <li><strong>환경:</strong> 실내에서는 GPS 신호가 약할 수 있습니다</li>
        <li><strong>수동 설정:</strong> 설정에서 직접 원하는 도시를 선택하세요</li>
      </ul>
    `,
    keywords: ["위치", "GPS", "권한", "정확도", "수동설정"]
  },
  {
    question: "시간이 정확하지 않아요",
    answer: `
      <p>시간이 정확하지 않다면 다음을 확인해보세요:</p>
      <ul>
        <li><strong>도시 설정:</strong> 설정에서 올바른 도시가 선택되었는지 확인</li>
        <li><strong>시스템 시간:</strong> 기기의 시스템 시간이 정확한지 확인</li>
        <li><strong>시간대:</strong> 원하는 시간대가 맞는지 확인</li>
        <li><strong>새로고침:</strong> 페이지를 새로고침하여 시간을 다시 동기화</li>
      </ul>
    `,
    keywords: ["시간", "정확도", "동기화", "시간대", "새로고침"]
  },
  {
    question: "애니메이션이 끊어지거나 느려요",
    answer: `
      <p>애니메이션 성능 문제가 있을 때는 다음 방법을 시도해보세요:</p>
      <ul>
        <li><strong>강도 조절:</strong> 설정에서 애니메이션 강도를 "낮음"으로 변경</li>
        <li><strong>효과 끄기:</strong> 배경 효과나 파티클 효과를 비활성화</li>
        <li><strong>성능 모드:</strong> 설정에서 "성능 모드"를 활성화</li>
        <li><strong>메모리 정리:</strong> 다른 앱이나 브라우저 탭을 종료</li>
        <li><strong>브라우저 업데이트:</strong> 최신 버전의 브라우저 사용</li>
      </ul>
    `,
    keywords: ["애니메이션", "성능", "느림", "끊김", "성능모드", "최적화"]
  },
  {
    question: "설정이 저장되지 않아요",
    answer: `
      <p>설정 저장 문제는 다음과 같은 원인일 수 있습니다:</p>
      <ul>
        <li><strong>시크릿 모드:</strong> 프라이빗/시크릿 브라우징에서는 설정이 저장되지 않습니다</li>
        <li><strong>로컬 스토리지:</strong> 브라우저의 로컬 스토리지 기능이 비활성화되어 있을 수 있습니다</li>
        <li><strong>저장 공간:</strong> 기기의 저장 공간이 부족할 수 있습니다</li>
        <li><strong>브라우저 설정:</strong> 쿠키/데이터 저장을 차단하는 설정이 있는지 확인</li>
      </ul>
    `,
    keywords: ["설정", "저장", "로컬스토리지", "시크릿모드", "쿠키"]
  },
  {
    question: "다크 모드가 자동으로 바뀌지 않아요",
    answer: `
      <p>테마 자동 변경이 안 될 때는 다음을 확인해보세요:</p>
      <ul>
        <li><strong>테마 설정:</strong> 설정에서 "시스템 설정 따름"이 선택되어 있는지 확인</li>
        <li><strong>시스템 설정:</strong> 기기의 다크/라이트 모드 설정을 확인</li>
        <li><strong>브라우저 지원:</strong> 일부 오래된 브라우저는 시스템 테마 감지를 지원하지 않습니다</li>
        <li><strong>수동 설정:</strong> 자동 변경이 안 되면 수동으로 원하는 테마를 선택하세요</li>
      </ul>
    `,
    keywords: ["다크모드", "테마", "자동변경", "시스템설정", "라이트모드"]
  },
  {
    question: "어떤 도시들을 지원하나요?",
    answer: `
      <p>Split Flap Clock은 전 세계 주요 도시들을 지원합니다:</p>
      <ul>
        <li><strong>아시아:</strong> 서울, 도쿄, 베이징, 상하이, 홍콩, 싱가포르, 방콕, 자카르타</li>
        <li><strong>유럽:</strong> 런던, 파리, 베를린, 로마, 마드리드, 암스테르담, 취리히</li>
        <li><strong>북미:</strong> 뉴욕, 로스앤젤레스, 시카고, 토론토, 밴쿠버</li>
        <li><strong>오세아니아:</strong> 시드니, 멜버른, 오클랜드</li>
        <li><strong>기타:</strong> 두바이, 카이로, 요하네스버그, 상파울루</li>
      </ul>
      <p>더 자세한 정보는 <a href="/timezone">세계 시간대 페이지</a>를 참고하세요.</p>
    `,
    keywords: ["도시", "지원", "서울", "도쿄", "뉴욕", "런던", "파리", "시간대"]
  },
  {
    question: "인터넷 없이도 사용할 수 있나요?",
    answer: `
      <p>네, PWA로 설치한 후에는 <strong>오프라인에서도 기본 기능</strong>을 사용할 수 있습니다:</p>
      <ul>
        <li><strong>시간 표시:</strong> 기기의 시스템 시간을 사용하여 표시</li>
        <li><strong>설정 유지:</strong> 이전에 저장한 설정들이 그대로 유지</li>
        <li><strong>제한사항:</strong> 위치 기반 자동 설정은 인터넷 연결이 필요</li>
        <li><strong>권장사항:</strong> 처음 설치 시에는 인터넷 연결 상태에서 설정을 완료하세요</li>
      </ul>
    `,
    keywords: ["오프라인", "인터넷", "연결", "PWA", "시스템시간"]
  },
  {
    question: "개인정보는 안전한가요?",
    answer: `
      <p>Split Flap Clock은 사용자의 개인정보 보호를 최우선으로 합니다:</p>
      <ul>
        <li><strong>로컬 저장:</strong> 모든 설정은 사용자 기기에만 저장됩니다</li>
        <li><strong>서버 전송 없음:</strong> 개인정보를 외부 서버로 전송하지 않습니다</li>
        <li><strong>위치 정보:</strong> 위치는 즉시 처리 후 삭제되며, 저장되지 않습니다</li>
        <li><strong>투명성:</strong> 자세한 내용은 <a href="/privacy">개인정보처리방침</a>을 참고하세요</li>
      </ul>
    `,
    keywords: ["개인정보", "보안", "프라이버시", "안전", "위치정보", "로컬저장"]
  },
  {
    question: "배터리 소모가 많나요?",
    answer: `
      <p>배터리 소모를 최소화할 수 있는 방법들이 있습니다:</p>
      <ul>
        <li><strong>성능 모드:</strong> 설정에서 "성능 모드"를 활성화하면 모든 애니메이션이 비활성화됩니다</li>
        <li><strong>애니메이션 조절:</strong> 배경 효과나 파티클 효과를 끄고, 강도를 "낮음"으로 설정</li>
        <li><strong>PWA 사용:</strong> 앱으로 설치하여 사용하면 브라우저보다 효율적입니다</li>
        <li><strong>화면 밝기:</strong> 다크 모드 사용 시 배터리 절약 효과가 있습니다</li>
      </ul>
    `,
    keywords: ["배터리", "소모", "절약", "성능모드", "애니메이션", "다크모드"]
  },
  {
    question: "기능 요청이나 버그 신고는 어떻게 하나요?",
    answer: `
      <p>사용자 피드백은 언제나 환영입니다:</p>
      <ul>
        <li><strong>이메일:</strong> support@splitflapclock.com으로 연락주세요</li>
        <li><strong>응답시간:</strong> 평일 기준 24시간 이내에 답변드립니다</li>
        <li><strong>포함 정보:</strong> 사용 기기, 브라우저, 발생 상황을 자세히 알려주세요</li>
        <li><strong>스크린샷:</strong> 문제 상황의 스크린샷이 있으면 더욱 도움이 됩니다</li>
      </ul>
    `,
    keywords: ["기능요청", "버그", "신고", "피드백", "문의", "이메일"]
  },
  {
    question: "여러 시간대를 동시에 볼 수 있나요?",
    answer: `
      <p>현재 버전에서는 한 번에 하나의 시간대만 표시됩니다:</p>
      <ul>
        <li><strong>빠른 전환:</strong> 설정에서 도시를 빠르게 변경하여 다른 시간대 확인 가능</li>
        <li><strong>시간대 정보:</strong> <a href="/timezone">세계 시간대 페이지</a>에서 여러 도시의 시간을 동시에 확인 가능</li>
        <li><strong>향후 계획:</strong> 다중 시간대 동시 표시 기능을 향후 버전에서 검토 중입니다</li>
        <li><strong>즐겨찾기:</strong> 자주 사용하는 도시들을 브라우저 즐겨찾기에 추가하여 빠르게 접근</li>
      </ul>
    `,
    keywords: ["다중시간대", "여러시간", "동시", "전환", "즐겨찾기"]
  },
  {
    question: "왜 분할 플랩 디스플레이인가요?",
    answer: `
      <p>분할 플랩 디스플레이를 선택한 특별한 이유가 있습니다:</p>
      <ul>
        <li><strong>향수:</strong> 공항이나 기차역의 클래식한 감성을 재현</li>
        <li><strong>물리적 감각:</strong> 디지털 환경에서도 아날로그적 움직임의 따뜻함</li>
        <li><strong>집중력:</strong> 분할된 숫자 표시로 시간에 더욱 집중하게 됨</li>
        <li><strong>미학:</strong> 단순한 LED 시계와 차별화된 독특한 시각적 매력</li>
        <li><strong>기술적 도전:</strong> CSS 애니메이션으로 물리적 움직임을 정교하게 구현</li>
      </ul>
    `,
    keywords: ["분할플랩", "디자인", "향수", "클래식", "아날로그", "미학"]
  }
]

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) {
    return faqs
  }
  
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query) ||
    faq.keywords.some(keyword => keyword.toLowerCase().includes(query))
  )
})
</script>

<style scoped>
.faq-view {
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

.faq-container {
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
  margin: 0 0 1.5rem 0;
}

.search-box {
  margin-top: 1rem;
}

.search-input {
  border-radius: 8px;
}

.faq-panel {
  margin-bottom: 8px;
  background: var(--color-canvas-default);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  overflow: hidden;
}

.faq-answer {
  color: var(--color-fg-muted);
  line-height: 1.6;
}

.faq-answer p {
  margin: 1rem 0;
}

.faq-answer ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.faq-answer li {
  margin-bottom: 0.5rem;
}

.faq-answer strong {
  color: var(--color-accent-fg);
  font-weight: 600;
}

.faq-answer a {
  color: var(--color-accent-fg);
  text-decoration: underline;
}

.contact-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
  background: linear-gradient(135deg, var(--color-canvas-default) 0%, var(--color-canvas-subtle) 100%);
}

.contact-card h3 {
  color: var(--color-fg-default);
  margin: 0 0 1rem 0;
}

.contact-card p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 0.5rem 0;
}

.contact-info {
  background: var(--color-canvas-subtle);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border-muted);
  margin-top: 1rem;
}

.contact-info p {
  margin: 0.25rem 0;
  color: var(--color-fg-default);
}

.contact-info strong {
  color: var(--color-accent-fg);
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
  margin: 0 0 1.5rem 0;
}

.help-card a {
  color: var(--color-accent-fg);
  text-decoration: underline;
}

.contact-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  
  .faq-container {
    gap: 16px;
  }
  
  .contact-actions {
    flex-direction: column;
  }
  
  .contact-actions .ant-btn {
    width: 100%;
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
}
</style>