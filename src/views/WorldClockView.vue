<template>
  <div class="world-clock-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton type="text" :icon="ArrowLeftOutlined" class="back-btn" aria-label="Go back" @click="goBack">
            Back
          </UiButton>
          <h1 class="page-title">World Clock</h1>
          <div class="header-spacer" />
        </div>
      </header>

      <div class="content">
        <div class="world-container" role="main">
          <UiCard class="intro-card">
            <p>
              Current local time in 20 major cities. Times follow each city's IANA time zone, so daylight
              saving time is applied automatically. Differences are shown against <strong>your time</strong>
              ({{ yourOffset }}). Tap a city for its own flip clock and a time converter.
            </p>
          </UiCard>

          <UiCard v-for="group in groups" :key="group.region" class="region-card" :title="group.region">
            <ul class="city-list">
              <li v-for="city in group.cities" :key="city.slug" class="city-row">
                <router-link :to="`/en/time/${city.slug}`" class="city-name">{{ city.en }}</router-link>
                <span class="city-offset">{{ offsetOf(city.timezone) }}</span>
                <span class="city-time">{{ timeOf(city.timezone) }}</span>
                <span class="city-gap">{{ gapOf(city.timezone) }}</span>
              </li>
            </ul>
          </UiCard>
        </div>
      </div>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useTime } from '@/composables/useTime'
import dayjs from '@/utils/dayjs'
import { CITIES, currentOffset, gapText, deviceTimezone } from '@/utils/cityTime'

/**
 * ## World Clock (/en/world-clock)
 *
 * 영어판 세계 시계 목록. 한국어판 /timezone(시간대 설명 위주)과 짝.
 * 차이는 보는 사람 기기 시간대 기준
 */

const REGION_EN: Record<string, string> = {
  '아시아': 'Asia',
  '유럽': 'Europe',
  '아메리카': 'Americas',
  '오세아니아': 'Oceania'
}

const goBack = useGoBack()
const { currentTime, startTimer, stopTimer } = useTime()
const yourTimezone = deviceTimezone()

const now = computed(() => dayjs(currentTime.value))
const yourOffset = computed(() => currentOffset(yourTimezone, now.value))

const groups = computed(() => Object.entries(REGION_EN).map(([ko, region]) => ({
  region,
  cities: CITIES.filter(city => city.region === ko)
})))

const offsetOf = (timezone: string) => currentOffset(timezone, now.value)
const timeOf = (timezone: string) => now.value.tz(timezone).locale('en').format('ddd h:mm A')
// '3 hours ahead of your time' → '3 hours ahead' (머리말에 'your time' 설명이 있어서 짧게)
const gapOf = (timezone: string) => {
  const text = gapText(timezone, yourTimezone, 'en', now.value)
  return text === 'Same as your time' ? 'Same time' : text.replace(/ (of )?your time$/, '')
}

onMounted(startTimer)
onUnmounted(stopTimer)
</script>

<style scoped>
.world-clock-view,
.layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout {
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
  max-width: 800px; /* 본문 카드 폭과 맞춤 */
  margin: 0 auto;
}

.back-btn {
  color: var(--color-accent-fg);
  border: none;
  margin-right: 16px;
}

.page-title {
  flex: 1;
  margin: 0;
  color: var(--color-fg-default);
  font-size: 1.5rem;
  font-weight: 600;
}

.header-spacer {
  width: 80px;
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
}

.world-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-card,
.region-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.intro-card p {
  margin: 0;
  color: var(--color-fg-muted);
  line-height: 1.7;
}

.city-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.city-row {
  display: grid;
  grid-template-columns: minmax(110px, 1.2fr) 80px minmax(110px, 1fr) minmax(90px, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 48px;
  border-bottom: 1px solid var(--color-border-muted);
  font-variant-numeric: tabular-nums;
}

.city-row:last-child {
  border-bottom: none;
}

.city-name {
  color: var(--color-accent-fg);
  font-weight: 600;
  text-decoration: none;
}

.city-name:hover {
  text-decoration: underline;
}

.city-offset,
.city-gap {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.city-time {
  color: var(--color-fg-default);
  font-weight: 600;
}

@media (max-width: 600px) {
  .header {
    padding: 0 16px;
  }

  .header-spacer {
    display: none;
  }

  .content {
    padding: 16px;
  }

  /* 폰: 도시·시각 한 줄, 오프셋·차이 아래 줄 */
  .city-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'name time'
      'offset gap';
    row-gap: 2px;
    padding: 8px 0;
  }

  .city-name { grid-area: name; }
  .city-time { grid-area: time; text-align: right; }
  .city-offset { grid-area: offset; }
  .city-gap { grid-area: gap; text-align: right; }
}
</style>
