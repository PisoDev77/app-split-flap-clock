<template>
  <div class="city-time-view">
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
          <h1 class="page-title">{{ city.ko }} 현재 시간</h1>
          <div class="header-spacer" />
        </div>
      </header>

      <div class="content">
        <div class="city-container" role="main">
          <UiCard class="clock-card">
            <p class="clock-place">{{ city.ko }} · {{ city.country }}</p>
            <div class="time-units" role="timer" :aria-label="`${city.ko} 현재 시간`">
              <SplitFlapDisplay :text="hours" label="시" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="minutes" label="분" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="seconds" label="초" />
            </div>
            <p class="clock-date">{{ dateText }}</p>
            <div class="clock-tags">
              <UiTag>{{ offset }}</UiTag>
              <UiTag v-if="dstNow" color="orange">서머타임 중</UiTag>
              <UiTag v-if="city.slug !== 'seoul'" color="blue">{{ gap }}</UiTag>
            </div>
            <UiButton type="primary" size="large" :icon="FieldTimeOutlined" class="home-btn" @click="openOnHome">
              {{ city.slug === 'seoul' ? '플립시계로 크게 보기' : `홈 시계를 ${city.ko} 시간으로` }}
            </UiButton>
          </UiCard>

          <UiCard v-if="city.slug !== 'seoul'" class="info-card" :title="`서울 시간을 ${city.ko} 시간으로`">
            <table class="convert-table">
              <caption class="sr-only">서울 시각을 {{ city.ko }} 시각으로 바꾼 표 (오늘 기준)</caption>
              <thead>
                <tr><th scope="col">서울</th><th scope="col">{{ city.ko }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row.seoul">
                  <td>{{ row.seoul }}</td>
                  <td>{{ row.local }} <span v-if="row.day" class="day-note">({{ row.day }})</span></td>
                </tr>
              </tbody>
            </table>
            <p class="note">오늘 날짜 기준이에요. 서머타임이 바뀌는 날 전후로는 시차가 1시간 달라질 수 있어요.</p>
          </UiCard>

          <UiCard class="info-card" :title="`${city.ko} 시간 알아두기`">
            <ul>
              <li>시간대: <strong>{{ city.timezone }}</strong> (지금 {{ offset }})</li>
              <li v-if="dst">
                서머타임이 있어요. 평소 {{ dst.standard }}, 서머타임 때 {{ dst.summer }}이고
                지금은 서머타임 {{ dstNow ? '기간이에요' : '기간이 아니에요' }}.
              </li>
              <li v-else>서머타임이 없어 1년 내내 {{ offset }}예요.</li>
              <li>{{ city.tip }}</li>
            </ul>
          </UiCard>

          <UiCard class="info-card" title="다른 도시 현재 시간">
            <ul class="city-links">
              <li v-for="other in otherCities" :key="other.slug">
                <router-link :to="`/time/${other.slug}`">{{ other.ko }}</router-link>
              </li>
            </ul>
            <p class="note"><router-link to="/timezone">세계 시간대 한눈에 보기 →</router-link></p>
          </UiCard>
        </div>
      </div>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined, FieldTimeOutlined } from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiTag from '@/components/ui/UiTag.vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useTime } from '@/composables/useTime'
import dayjs from '@/utils/dayjs'
import {
  CITIES, findCity, currentOffset, gapFromSeoul, dstOffsets, conversionRows, type City
} from '@/utils/cityTime'

/**
 * ## 도시별 현재 시간 (/time/:slug)
 *
 * "뉴욕 현재 시간", "런던 시차" 같은 검색으로 들어오는 페이지.
 * 플립시계 + 서울 시차 + 서머타임 + 서울 시간 변환표.
 * 없는 도시는 라우터가 404로 보내므로 여기서는 항상 도시가 있음
 */

const route = useRoute()
const router = useRouter()
const goBack = useGoBack()
const { currentTime, startTimer, stopTimer } = useTime()

const city = computed(() => findCity(String(route.params.slug)) as City)

const zoned = computed(() => dayjs(currentTime.value).tz(city.value.timezone))
const hours = computed(() => zoned.value.format('HH'))
const minutes = computed(() => zoned.value.format('mm'))
const seconds = computed(() => zoned.value.format('ss'))
const dateText = computed(() => zoned.value.format('YYYY년 M월 D일 dddd'))

// 시계와 같은 시각으로 계산 → 서머타임이 바뀌는 순간에도 표시가 맞음
const offset = computed(() => currentOffset(city.value.timezone, dayjs(currentTime.value)))
const gap = computed(() => gapFromSeoul(city.value.timezone, dayjs(currentTime.value)))
const dst = computed(() => dstOffsets(city.value.timezone))
const dstNow = computed(() => !!dst.value && offset.value === dst.value.summer)
const rows = computed(() => conversionRows(city.value.timezone))

const otherCities = computed(() => CITIES.filter(c => c.slug !== city.value.slug))

// 홈 시계를 이 도시로 (설정의 도시 선택과 같은 저장값)
const openOnHome = () => {
  if (city.value.slug === 'seoul') {
    localStorage.removeItem('selectedCity')
  } else {
    localStorage.setItem('selectedCity', city.value.en)
  }
  router.push('/')
}

onMounted(startTimer)
onUnmounted(stopTimer)
</script>

<style scoped>
.city-time-view {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-spacer {
  width: 80px;
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
}

.city-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.clock-card,
.info-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.clock-card {
  text-align: center;
}

.clock-place {
  margin: 0 0 16px;
  color: var(--color-fg-muted);
  font-size: 1rem;
}

.time-units {
  --flap-w: min(clamp(1.75rem, calc(11vw - 2px), 4rem), 22vh);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.time-separator {
  color: var(--color-fg-muted);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 2px;
}

.clock-date {
  margin: 16px 0 12px;
  color: var(--color-fg-muted);
}

.clock-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.home-btn {
  max-width: 100%;
}

.convert-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.convert-table th,
.convert-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-muted);
  text-align: left;
  color: var(--color-fg-default);
}

.convert-table th {
  color: var(--color-fg-muted);
  font-weight: 600;
}

.day-note {
  color: var(--color-fg-muted);
  font-size: 0.9em;
}

.info-card ul {
  margin: 0;
  padding-left: 1.25rem;
}

.info-card li {
  color: var(--color-fg-default);
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.info-card strong {
  color: var(--color-accent-fg);
  font-weight: 600;
}

.note {
  margin: 12px 0 0;
  color: var(--color-fg-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.note a,
.city-links a {
  color: var(--color-accent-fg);
}

.info-card .city-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 4px 12px;
  padding: 0;
  list-style: none;
}

.city-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  text-decoration: none;
}

.city-links a:hover {
  text-decoration: underline;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .header-spacer {
    display: none;
  }

  .content {
    padding: 16px;
  }
}
</style>
