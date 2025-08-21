<template>
  <div class="timezone-view">
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
          <h1 class="page-title">세계 시간대</h1>
          <div class="header-spacer"></div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="timezone-container" role="main">
          <a-card class="intro-card">
            <h2>🌍 세계 시간대 정보</h2>
            <p>
              전 세계의 시간대 시스템과 Split Flap Clock에서 지원하는 주요 도시들의 
              시간 정보를 확인해보세요. GMT, UTC의 개념부터 시차 계산법까지 
              시간대에 대한 모든 것을 알아보겠습니다.
            </p>
          </a-card>

          <a-card class="info-card" title="⏰ 시간대 기본 개념">
            <h3>GMT (Greenwich Mean Time)</h3>
            <p>
              <strong>그리니치 평균시</strong>는 영국 런던의 그리니치 천문대를 기준으로 한 시간입니다. 
              전 세계 시간대의 기준점 역할을 하며, 모든 다른 시간대는 GMT와의 차이로 표현됩니다.
            </p>

            <h3>UTC (Coordinated Universal Time)</h3>
            <p>
              <strong>협정 세계시</strong>는 국제적으로 사용되는 시간 표준으로, GMT와 거의 동일하지만 
              더 정확한 원자시계를 기준으로 합니다. 현재는 UTC가 공식적인 세계 표준시로 사용됩니다.
            </p>

            <h3>시간대 표기법</h3>
            <ul>
              <li><strong>GMT+9</strong> 또는 <strong>UTC+9</strong>: GMT보다 9시간 빠름 (한국)</li>
              <li><strong>GMT+0</strong> 또는 <strong>UTC+0</strong>: GMT와 동일 (영국)</li>
              <li><strong>GMT-5</strong> 또는 <strong>UTC-5</strong>: GMT보다 5시간 느림 (뉴욕)</li>
            </ul>
          </a-card>

          <a-card class="info-card" title="🏙️ 주요 도시별 시간대">
            <div class="timezone-grid">
              <div class="timezone-region">
                <h3>아시아</h3>
                <div class="city-list">
                  <div class="city-item">
                    <span class="city-name">서울</span>
                    <span class="timezone-offset">GMT+9</span>
                    <span class="current-time">{{ getCityTime('Seoul') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">도쿄</span>
                    <span class="timezone-offset">GMT+9</span>
                    <span class="current-time">{{ getCityTime('Tokyo') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">베이징</span>
                    <span class="timezone-offset">GMT+8</span>
                    <span class="current-time">{{ getCityTime('Beijing') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">상하이</span>
                    <span class="timezone-offset">GMT+8</span>
                    <span class="current-time">{{ getCityTime('Shanghai') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">홍콩</span>
                    <span class="timezone-offset">GMT+8</span>
                    <span class="current-time">{{ getCityTime('Hong Kong') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">싱가포르</span>
                    <span class="timezone-offset">GMT+8</span>
                    <span class="current-time">{{ getCityTime('Singapore') }}</span>
                  </div>
                </div>
              </div>

              <div class="timezone-region">
                <h3>유럽</h3>
                <div class="city-list">
                  <div class="city-item">
                    <span class="city-name">런던</span>
                    <span class="timezone-offset">GMT+0</span>
                    <span class="current-time">{{ getCityTime('London') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">파리</span>
                    <span class="timezone-offset">GMT+1</span>
                    <span class="current-time">{{ getCityTime('Paris') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">베를린</span>
                    <span class="timezone-offset">GMT+1</span>
                    <span class="current-time">{{ getCityTime('Berlin') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">로마</span>
                    <span class="timezone-offset">GMT+1</span>
                    <span class="current-time">{{ getCityTime('Rome') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">마드리드</span>
                    <span class="timezone-offset">GMT+1</span>
                    <span class="current-time">{{ getCityTime('Madrid') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">모스크바</span>
                    <span class="timezone-offset">GMT+3</span>
                    <span class="current-time">{{ getCityTime('Moscow') }}</span>
                  </div>
                </div>
              </div>

              <div class="timezone-region">
                <h3>북미</h3>
                <div class="city-list">
                  <div class="city-item">
                    <span class="city-name">뉴욕</span>
                    <span class="timezone-offset">GMT-5</span>
                    <span class="current-time">{{ getCityTime('New York') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">로스앤젤레스</span>
                    <span class="timezone-offset">GMT-8</span>
                    <span class="current-time">{{ getCityTime('Los Angeles') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">시카고</span>
                    <span class="timezone-offset">GMT-6</span>
                    <span class="current-time">{{ getCityTime('Chicago') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">토론토</span>
                    <span class="timezone-offset">GMT-5</span>
                    <span class="current-time">{{ getCityTime('Toronto') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">밴쿠버</span>
                    <span class="timezone-offset">GMT-8</span>
                    <span class="current-time">{{ getCityTime('Vancouver') }}</span>
                  </div>
                </div>
              </div>

              <div class="timezone-region">
                <h3>오세아니아</h3>
                <div class="city-list">
                  <div class="city-item">
                    <span class="city-name">시드니</span>
                    <span class="timezone-offset">GMT+10</span>
                    <span class="current-time">{{ getCityTime('Sydney') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">멜버른</span>
                    <span class="timezone-offset">GMT+10</span>
                    <span class="current-time">{{ getCityTime('Melbourne') }}</span>
                  </div>
                  <div class="city-item">
                    <span class="city-name">오클랜드</span>
                    <span class="timezone-offset">GMT+12</span>
                    <span class="current-time">{{ getCityTime('Auckland') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-card>

          <a-card class="info-card" title="🧮 시차 계산하기">
            <h3>기본 계산법</h3>
            <p>
              두 도시 간의 시차를 계산하는 방법은 각 도시의 GMT 오프셋 차이를 구하는 것입니다.
            </p>
            
            <div class="calculation-example">
              <h4>예시: 서울과 뉴욕의 시차</h4>
              <ul>
                <li>서울: GMT+9</li>
                <li>뉴욕: GMT-5</li>
                <li>시차 = 9 - (-5) = 14시간</li>
                <li>결과: 서울이 뉴욕보다 14시간 빠름</li>
              </ul>
            </div>

            <div class="calculation-example">
              <h4>예시: 도쿄와 런던의 시차</h4>
              <ul>
                <li>도쿄: GMT+9</li>
                <li>런던: GMT+0</li>
                <li>시차 = 9 - 0 = 9시간</li>
                <li>결과: 도쿄가 런던보다 9시간 빠름</li>
              </ul>
            </div>

            <h3>일광절약시간제 (Daylight Saving Time)</h3>
            <p>
              일부 국가에서는 여름철에 시계를 1시간 앞당기는 일광절약시간제를 사용합니다. 
              이 경우 실제 시차가 표준 시차와 다를 수 있으니 주의해야 합니다.
            </p>
            <ul>
              <li><strong>적용 지역:</strong> 미국, 캐나다, 유럽 대부분 국가</li>
              <li><strong>적용 기간:</strong> 대략 3월~11월 (국가별로 다름)</li>
              <li><strong>시차 변화:</strong> 표준 시차에서 ±1시간</li>
            </ul>
          </a-card>

          <a-card class="info-card" title="🌐 비즈니스 시간대 활용">
            <h3>국제 회의 시간 정하기</h3>
            <p>여러 국가의 참석자가 있는 회의 시간을 정할 때 고려사항:</p>
            <ul>
              <li><strong>아시아-유럽:</strong> 아시아 오후 (16:00-18:00) = 유럽 오전 (8:00-10:00)</li>
              <li><strong>아시아-미국:</strong> 아시아 오전 (9:00-11:00) = 미국 전날 저녁 (17:00-19:00)</li>
              <li><strong>유럽-미국:</strong> 유럽 오후 (14:00-16:00) = 미국 오전 (8:00-10:00)</li>
            </ul>

            <h3>글로벌 서비스 운영</h3>
            <ul>
              <li><strong>24시간 지원:</strong> 시간대를 3교대로 나누어 운영</li>
              <li><strong>주요 시장:</strong> 아시아(GMT+8~+9), 유럽(GMT+0~+1), 미국(GMT-5~-8)</li>
              <li><strong>데이터 백업:</strong> 사용량이 적은 현지 시간 새벽 시간대 활용</li>
            </ul>

            <h3>여행 시 시차 극복법</h3>
            <ul>
              <li><strong>동쪽 여행:</strong> 출발 전 며칠간 일찍 잠자리에 들기</li>
              <li><strong>서쪽 여행:</strong> 출발 전 며칠간 늦게 잠자리에 들기</li>
              <li><strong>도착 후:</strong> 현지 시간에 맞춰 식사와 수면 시간 조정</li>
              <li><strong>짧은 여행:</strong> 3일 이하면 본국 시간 유지가 더 효율적</li>
            </ul>
          </a-card>

          <a-card class="info-card" title="💡 Split Flap Clock 활용 팁">
            <h3>다중 시간대 관리</h3>
            <ul>
              <li><strong>북마크 활용:</strong> 자주 확인하는 도시들을 즐겨찾기에 추가</li>
              <li><strong>빠른 전환:</strong> 설정에서 도시를 빠르게 변경하여 시간 확인</li>
              <li><strong>시각적 확인:</strong> 분할 플랩 디스플레이로 직관적인 시간 파악</li>
            </ul>

            <h3>비즈니스 활용</h3>
            <ul>
              <li><strong>회의 준비:</strong> 상대방 시간대로 미리 설정하여 시간 확인</li>
              <li><strong>마감 관리:</strong> 프로젝트 마감이 있는 지역의 시간으로 설정</li>
              <li><strong>시장 분석:</strong> 해외 주식시장 개장/폐장 시간 추적</li>
            </ul>

            <h3>개인 활용</h3>
            <ul>
              <li><strong>가족/친구:</strong> 해외 거주 가족의 시간대로 설정</li>
              <li><strong>여행 계획:</strong> 목적지 시간대 미리 확인</li>
              <li><strong>온라인 이벤트:</strong> 해외 라이브 스트리밍/게임 시간 확인</li>
            </ul>
          </a-card>
        </div>
      </a-layout-content>
      
      <AppFooter />
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import { Layout as ALayout, Button as AButton, Card as ACard } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import AppFooter from '@/components/AppFooter.vue'
import dayjs from '@/utils/dayjs'

const currentTime = ref(dayjs())
let timer: number

const timezoneOffsets: Record<string, number> = {
  'Seoul': 9,
  'Tokyo': 9,
  'Beijing': 8,
  'Shanghai': 8,
  'Hong Kong': 8,
  'Singapore': 8,
  'London': 0,
  'Paris': 1,
  'Berlin': 1,
  'Rome': 1,
  'Madrid': 1,
  'Moscow': 3,
  'New York': -5,
  'Los Angeles': -8,
  'Chicago': -6,
  'Toronto': -5,
  'Vancouver': -8,
  'Sydney': 10,
  'Melbourne': 10,
  'Auckland': 12
}

const getCityTime = (city: string): string => {
  const offset = timezoneOffsets[city]
  if (offset === undefined) return '--:--'
  
  const cityTime = currentTime.value.utcOffset(offset)
  return cityTime.format('HH:mm')
}

onMounted(() => {
  currentTime.value = dayjs()
  timer = setInterval(() => {
    currentTime.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.timezone-view {
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

.timezone-container {
  max-width: 1000px;
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

.info-card h3 {
  color: var(--color-accent-fg);
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem 0;
  border-bottom: 2px solid var(--color-border-muted);
  padding-bottom: 0.5rem;
}

.info-card h3:first-child {
  margin-top: 0;
}

.info-card h4 {
  color: var(--color-fg-default);
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
}

.info-card p {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin: 1rem 0;
}

.info-card ul {
  margin: 0.5rem 0 1rem 0;
  padding-left: 1.5rem;
}

.info-card li {
  color: var(--color-fg-muted);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.info-card strong {
  color: var(--color-accent-fg);
  font-weight: 600;
}

.timezone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.timezone-region h3 {
  color: var(--color-accent-fg);
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border-muted);
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.city-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-canvas-subtle);
  border-radius: 8px;
  border: 1px solid var(--color-border-muted);
  transition: all 0.2s ease;
}

.city-item:hover {
  background: var(--color-canvas-default);
  box-shadow: var(--shadow-small);
}

.city-name {
  color: var(--color-fg-default);
  font-weight: 500;
}

.timezone-offset {
  color: var(--color-fg-muted);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.current-time {
  color: var(--color-accent-fg);
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 1.1rem;
}

.calculation-example {
  background: var(--color-canvas-subtle);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border-muted);
  margin: 1rem 0;
}

.calculation-example h4 {
  color: var(--color-fg-default);
  margin: 0 0 1rem 0;
}

.calculation-example ul {
  margin: 0;
  padding-left: 1.5rem;
}

.calculation-example li {
  color: var(--color-fg-muted);
  line-height: 1.5;
  margin-bottom: 0.25rem;
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
  
  .timezone-container {
    gap: 16px;
  }
  
  .timezone-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .city-item {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.5rem;
  }
  
  .city-name {
    grid-column: 1;
    grid-row: 1;
  }
  
  .timezone-offset {
    grid-column: 2;
    grid-row: 1;
  }
  
  .current-time {
    grid-column: 1 / -1;
    grid-row: 2;
    text-align: center;
    font-size: 1.2rem;
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
  
  .calculation-example {
    padding: 1rem;
  }
}
</style>