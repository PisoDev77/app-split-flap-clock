<template>
  <div class="city-time-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton
            type="text"
            :icon="ArrowLeftOutlined"
            class="back-btn"
            :aria-label="t.backLabel"
            @click="goBack"
          >
            {{ t.back }}
          </UiButton>
          <h1 class="page-title">{{ t.heading(name) }}</h1>
          <div class="header-spacer" />
        </div>
      </header>

      <div class="content">
        <div class="city-container" role="main">
          <UiCard class="clock-card">
            <p class="clock-place">{{ name }} · {{ isEn ? city.countryEn : city.country }}</p>
            <div class="time-units" role="timer" :aria-label="t.heading(name)">
              <SplitFlapDisplay :text="hours" :label="t.h" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="minutes" :label="t.m" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="seconds" :label="t.s" />
            </div>
            <p class="clock-date">{{ dateText }}</p>
            <div class="clock-tags">
              <UiTag>{{ offset }}</UiTag>
              <UiTag v-if="dstNow" color="orange">{{ t.dstNow }}</UiTag>
              <UiTag v-if="showCompare" color="blue">{{ gap }}</UiTag>
            </div>
            <UiButton type="primary" size="large" :icon="FieldTimeOutlined" class="home-btn" @click="openOnHome">
              {{ !isEn && city.slug === 'seoul' ? '플립시계로 크게 보기' : t.openHome(name) }}
            </UiButton>
          </UiCard>

          <UiCard v-if="showCompare" class="info-card" :title="t.convertTitle(name)">
            <table class="convert-table">
              <caption class="sr-only">{{ t.convertCaption(name) }}</caption>
              <thead>
                <tr><th scope="col">{{ t.base }}</th><th scope="col">{{ name }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row.base">
                  <td>{{ row.base }}</td>
                  <td>{{ row.local }} <span v-if="row.day" class="day-note">({{ row.day }})</span></td>
                </tr>
              </tbody>
            </table>
            <p class="note">{{ t.convertNote }}</p>
          </UiCard>

          <UiCard class="info-card" :title="t.factsTitle(name)">
            <ul>
              <li>{{ t.zone }}: <strong>{{ city.timezone }}</strong> ({{ t.nowOffset(offset) }})</li>
              <li v-if="dst">{{ t.hasDst(dst.standard, dst.summer, dstNow) }}</li>
              <li v-else>{{ t.noDst(offset) }}</li>
              <li>{{ isEn ? city.tipEn : city.tip }}</li>
            </ul>
          </UiCard>

          <UiCard class="info-card" :title="t.othersTitle">
            <ul class="city-links">
              <li v-for="other in otherCities" :key="other.slug">
                <router-link :to="lp(`/time/${other.slug}`)">{{ isEn ? other.en : other.ko }}</router-link>
              </li>
            </ul>
            <p class="note"><router-link :to="isEn ? '/en/world-clock' : '/timezone'">{{ t.allCities }}</router-link></p>
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
import { useLocale } from '@/composables/useLocale'
import dayjs from '@/utils/dayjs'
import {
  CITIES, SEOUL_TZ, findCity, currentOffset, gapText, dstOffsets, conversionRows, deviceTimezone, type City
} from '@/utils/cityTime'

/**
 * ## 도시별 현재 시간 (/time/:slug, /en/time/:slug)
 *
 * "뉴욕 현재 시간", "new york time now" 같은 검색으로 들어오는 페이지.
 * 플립시계 + 시차 + 서머타임 + 시간 변환표.
 * - 한국어: 서울과 비교 / 영어: 보는 사람 기기 시간대와 비교
 * 없는 도시는 라우터가 404로 보내므로 여기서는 항상 도시가 있음
 */

const route = useRoute()
const router = useRouter()
const goBack = useGoBack()
const { currentTime, startTimer, stopTimer } = useTime()
const { isEn, lp, pick } = useLocale()

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', h: '시', m: '분', s: '초',
    heading: (n: string) => `${n} 현재 시간`, dstNow: '서머타임 중',
    openHome: (n: string) => `홈 시계를 ${n} 시간으로`,
    convertTitle: (n: string) => `서울 시간을 ${n} 시간으로`,
    convertCaption: (n: string) => `서울 시각을 ${n} 시각으로 바꾼 표 (오늘 기준)`,
    base: '서울', convertNote: '오늘 날짜 기준이에요. 서머타임이 바뀌는 날 전후로는 시차가 1시간 달라질 수 있어요.',
    factsTitle: (n: string) => `${n} 시간 알아두기`, zone: '시간대', nowOffset: (o: string) => `지금 ${o}`,
    hasDst: (std: string, sum: string, now: boolean) =>
      `서머타임이 있어요. 평소 ${std}, 서머타임 때 ${sum}이고 지금은 서머타임 ${now ? '기간이에요' : '기간이 아니에요'}.`,
    noDst: (o: string) => `서머타임이 없어 1년 내내 ${o}예요.`,
    othersTitle: '다른 도시 현재 시간', allCities: '세계 시간대 한눈에 보기 →', dateFormat: 'YYYY년 M월 D일 dddd'
  },
  en: {
    back: 'Back', backLabel: 'Go back', h: 'Hour', m: 'Minute', s: 'Second',
    heading: (n: string) => `${n} time now`, dstNow: 'Daylight saving time',
    openHome: (n: string) => `Show ${n} on the flip clock`,
    convertTitle: (n: string) => `Your time to ${n} time`,
    convertCaption: (n: string) => `Your local time converted to ${n} time (today)`,
    base: 'Your time', convertNote: 'Based on today. Around daylight saving changes the difference can shift by an hour.',
    factsTitle: (n: string) => `About ${n} time`, zone: 'Time zone', nowOffset: (o: string) => `now ${o}`,
    hasDst: (std: string, sum: string, now: boolean) =>
      `Uses daylight saving time: ${std} standard, ${sum} in summer. Daylight saving time is ${now ? 'in effect now' : 'not in effect now'}.`,
    noDst: (o: string) => `No daylight saving time; ${o} all year.`,
    othersTitle: 'Time in other cities', allCities: 'See the world clock →', dateFormat: 'dddd, MMMM D, YYYY'
  }
})

const city = computed(() => findCity(String(route.params.slug)) as City)
const name = computed(() => isEn.value ? city.value.en : city.value.ko)

// 비교 기준: 한국어는 서울, 영어는 이 기기 시간대
const baseTimezone = computed(() => isEn.value ? deviceTimezone() : SEOUL_TZ)

const zoned = computed(() => dayjs(currentTime.value).tz(city.value.timezone))
const hours = computed(() => zoned.value.format('HH'))
const minutes = computed(() => zoned.value.format('mm'))
const seconds = computed(() => zoned.value.format('ss'))
const dateText = computed(() => zoned.value.locale(isEn.value ? 'en' : 'ko').format(t.value.dateFormat))

// 시계와 같은 시각으로 계산 → 서머타임이 바뀌는 순간에도 표시가 맞음
const offset = computed(() => currentOffset(city.value.timezone, dayjs(currentTime.value)))
const baseOffset = computed(() => currentOffset(baseTimezone.value, dayjs(currentTime.value)))
const showCompare = computed(() => offset.value !== baseOffset.value)
const gap = computed(() => gapText(city.value.timezone, baseTimezone.value, isEn.value ? 'en' : 'ko', dayjs(currentTime.value)))
const dst = computed(() => dstOffsets(city.value.timezone))
const dstNow = computed(() => !!dst.value && offset.value === dst.value.summer)
const rows = computed(() => conversionRows(city.value.timezone, baseTimezone.value, isEn.value ? 'en' : 'ko'))

const otherCities = computed(() => CITIES.filter(c => c.slug !== city.value.slug))

// 홈 시계를 이 도시로 (설정의 도시 선택과 같은 저장값)
const openOnHome = () => {
  if (!isEn.value && city.value.slug === 'seoul') {
    localStorage.removeItem('selectedCity')
  } else {
    localStorage.setItem('selectedCity', city.value.en)
  }
  router.push(lp('/'))
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
