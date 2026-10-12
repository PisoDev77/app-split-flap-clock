<template>
  <div class="converter-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton type="text" :icon="ArrowLeftOutlined" class="back-btn" :aria-label="t.backLabel" @click="goBack">
            {{ t.back }}
          </UiButton>
          <h1 class="page-title">{{ t.title }}</h1>
          <div class="header-controls">
            <UiButton type="text" :icon="ShareAltOutlined" class="icon-btn" :aria-label="t.share" :title="t.share" @click="share" />
          </div>
        </div>
      </header>

      <div class="content">
        <div class="converter-container" role="main">
          <UiCard class="form-card">
            <div class="form-grid">
              <label class="field">
                <span class="field-label">{{ t.from }}</span>
                <UiSelect v-model:value="fromSlug" :aria-label="t.from" :options="fromOptions" />
              </label>
              <label class="field">
                <span class="field-label">{{ t.date }}</span>
                <UiInput v-model:value="date" type="date" :aria-label="t.date" required />
              </label>
              <label class="field">
                <span class="field-label">{{ t.time }}</span>
                <UiInput v-model:value="time" type="time" :aria-label="t.time" required />
              </label>
            </div>
            <div class="form-actions">
              <UiButton :icon="FieldTimeOutlined" @click="setNow">{{ t.now }}</UiButton>
              <span class="from-summary">{{ fromSummary }}</span>
            </div>
          </UiCard>

          <UiCard class="result-card" :title="t.results">
            <ul class="result-list">
              <li v-for="row in rows" :key="row.slug" class="result-row">
                <router-link :to="lp(`/time/${row.slug}`)" class="result-city">{{ row.name }}</router-link>
                <span class="result-time">{{ row.time }}</span>
                <span class="result-date">{{ row.date }}<span v-if="row.shift" class="shift"> · {{ row.shift }}</span></span>
                <span class="result-offset">{{ row.offset }}</span>
                <button
                  type="button"
                  class="remove-btn"
                  :aria-label="t.remove(row.name)"
                  @click="toggleTarget(row.slug)"
                >
                  ×
                </button>
              </li>
            </ul>
            <p v-if="!rows.length" class="empty">{{ t.empty }}</p>

            <div class="add-cities">
              <span class="field-label">{{ t.add }}</span>
              <div class="chips">
                <button
                  v-for="city in addable"
                  :key="city.slug"
                  type="button"
                  class="chip"
                  @click="toggleTarget(city.slug)"
                >
                  + {{ isEn ? city.en : city.ko }}
                </button>
              </div>
            </div>
          </UiCard>

          <UiCard v-if="!isEn" class="info-card" title="시차 계산기 이렇게 써요">
            <ul>
              <li>기준 도시와 날짜·시각을 넣으면 아래 도시들의 같은 순간 시각을 바로 보여줘요.</li>
              <li><strong>서머타임</strong>도 날짜에 맞춰 자동 반영돼요. 그래서 3월·11월처럼 서머타임이 바뀌는 때에는 같은 도시라도 시차가 1시간 달라질 수 있어요.</li>
              <li>해외 회의·통화 시간 잡기, 해외 주식 장 시작 시각, 해외 가족에게 연락하기 좋은 시간을 찾을 때 써 보세요.</li>
              <li>도시를 더하거나 빼고 <strong>공유</strong>를 누르면 같은 계산을 링크로 보낼 수 있어요.</li>
              <li>도시를 누르면 그 도시의 플립시계와 서울 시간 변환표가 나와요.</li>
            </ul>
          </UiCard>
          <UiCard v-else class="info-card" title="How to use the time zone converter">
            <ul>
              <li>Pick a city, date and time; the list shows the same moment in every other city.</li>
              <li><strong>Daylight saving time</strong> is applied for the chosen date, so around March and November the difference between two cities can change by an hour.</li>
              <li>Use it to schedule calls and meetings, check when overseas markets open, or find a good time to call family abroad.</li>
              <li>Add or remove cities, then tap <strong>Share</strong> to send the same conversion as a link.</li>
              <li>Tap a city to open its live flip clock.</li>
            </ul>
          </UiCard>
        </div>
      </div>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined, FieldTimeOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiInput from '@/components/ui/UiInput.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useLocale } from '@/composables/useLocale'
import { shareLink } from '@/utils/shareLink'
import { CITIES, SEOUL_TZ, deviceTimezone, findCity, currentOffset } from '@/utils/cityTime'
import dayjs from '@/utils/dayjs'

/**
 * ## 시차 계산기 (/time-converter, /en/time-converter)
 *
 * "시차 계산기", "time zone converter" 검색용.
 * 기준(도시 또는 내 기기 시간대) + 날짜·시각 → 다른 도시들의 같은 순간.
 * 날짜를 넣어 계산하므로 그 날짜의 서머타임이 반영됨.
 * 주소에 상태를 담아 공유: ?from=seoul&d=2026-10-12&t=09:00&to=new-york,london
 */

const MINE = '__mine__'
const DEFAULT_TARGETS = ['seoul', 'tokyo', 'london', 'paris', 'new-york', 'los-angeles', 'sydney']

const route = useRoute()
const router = useRouter()
const goBack = useGoBack()
const { isEn, lp, pick } = useLocale()

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', title: '시차 계산기', share: '이 계산 링크 공유',
    from: '기준', date: '날짜', time: '시각', now: '지금 시각으로', mine: (tz: string) => `내 시간대 (${tz})`,
    results: '같은 순간, 다른 도시', remove: (n: string) => `${n} 빼기`, add: '도시 더하기',
    empty: '아래에서 비교할 도시를 더해 주세요.',
    prev: '전날', next: '다음 날', timeFormat: 'A h:mm', dateFormat: 'M월 D일 (ddd)',
    summary: (when: string, offset: string) => `${when} · ${offset}`, summaryFormat: 'YYYY년 M월 D일 A h:mm',
    shareTitle: '시차 계산기 · 플립시계', shareText: '이 시각이 다른 나라에서는 몇 시인지 확인해 보세요'
  },
  en: {
    back: 'Back', backLabel: 'Go back', title: 'Time Zone Converter', share: 'Share this conversion',
    from: 'From', date: 'Date', time: 'Time', now: 'Use current time', mine: (tz: string) => `My time zone (${tz})`,
    results: 'Same moment in other cities', remove: (n: string) => `Remove ${n}`, add: 'Add a city',
    empty: 'Add cities below to compare.',
    prev: 'previous day', next: 'next day', timeFormat: 'h:mm A', dateFormat: 'ddd, MMM D',
    summary: (when: string, offset: string) => `${when} · ${offset}`, summaryFormat: 'dddd, MMMM D, YYYY h:mm A',
    shareTitle: 'Time Zone Converter · Flip Clock', shareText: 'See what time it is around the world at this moment'
  }
})

const q = (key: string) => {
  const value = route.query[key]
  return (Array.isArray(value) ? value[0] : value) ?? undefined
}

const myTimezone = deviceTimezone()
// 한국어판은 서울, 영어판은 내 기기 시간대가 기본 기준
const fromSlug = ref<string>(findCity(String(q('from'))) ? String(q('from')) : (isEn.value ? MINE : 'seoul'))
const fromTimezone = computed(() => fromSlug.value === MINE ? myTimezone : findCity(fromSlug.value)?.timezone ?? SEOUL_TZ)

const nowIn = (tz: string) => dayjs().tz(tz)
const validDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && dayjs(v).isValid()
const validTime = (v?: string) => !!v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)
const date = ref(validDate(q('d')) ? q('d')! : nowIn(fromTimezone.value).format('YYYY-MM-DD'))
const time = ref(validTime(q('t')) ? q('t')! : nowIn(fromTimezone.value).format('HH:mm'))

const queryTargets = String(q('to') ?? '').split(',').filter(slug => findCity(slug))
const targets = ref<string[]>(queryTargets.length ? queryTargets : DEFAULT_TARGETS)

const setNow = () => {
  const now = nowIn(fromTimezone.value)
  date.value = now.format('YYYY-MM-DD')
  time.value = now.format('HH:mm')
}

const toggleTarget = (slug: string) => {
  targets.value = targets.value.includes(slug)
    ? targets.value.filter(s => s !== slug)
    : [...targets.value, slug]
}

const locale = computed(() => isEn.value ? 'en' : 'ko')

// 입력이 비었으면(브라우저에서 지우는 중) 마지막 정상 값으로 계산
const base = computed(() => {
  const d = validDate(date.value) ? date.value : nowIn(fromTimezone.value).format('YYYY-MM-DD')
  const tm = validTime(time.value) ? time.value : '00:00'
  return dayjs.tz(`${d} ${tm}`, fromTimezone.value)
})

const fromSummary = computed(() => t.value.summary(
  base.value.locale(locale.value).format(t.value.summaryFormat),
  currentOffset(fromTimezone.value, base.value)
))

const rows = computed(() => {
  const baseDate = base.value.format('YYYY-MM-DD')
  return targets.value
    .map(slug => findCity(slug)!)
    .map(city => {
      const local = base.value.tz(city.timezone).locale(locale.value)
      const localDate = local.format('YYYY-MM-DD')
      return {
        slug: city.slug,
        name: isEn.value ? city.en : city.ko,
        time: local.format(t.value.timeFormat),
        date: local.format(t.value.dateFormat),
        shift: localDate < baseDate ? t.value.prev : localDate > baseDate ? t.value.next : '',
        offset: currentOffset(city.timezone, base.value),
        sort: local.utcOffset()
      }
    })
    .sort((a, b) => b.sort - a.sort)
})

const addable = computed(() => CITIES.filter(city => !targets.value.includes(city.slug)))

const fromOptions = computed(() => [
  { value: MINE, label: t.value.mine(myTimezone) },
  ...CITIES.map(city => ({ value: city.slug, label: isEn.value ? city.en : city.ko }))
])

// 상태를 주소에 남김 (공유·새로고침해도 같은 계산)
const queryState = computed(() => ({
  from: fromSlug.value === MINE ? undefined : fromSlug.value,
  d: date.value || undefined,
  t: time.value || undefined,
  to: targets.value.join(',') || undefined
}))
watch(queryState, (query) => { router.replace({ query }) })

const share = () => {
  const params = new URLSearchParams(Object.entries(queryState.value).filter(([, v]) => v) as [string, string][])
  shareLink(`https://piso-split-flap.netlify.app${lp('/time-converter')}?${params}`, t.value.shareTitle, t.value.shareText)
}
</script>

<style scoped>
.converter-view,
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
  max-width: 1200px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  color: var(--color-accent-fg);
  border: none;
  font-size: 18px;
  width: 44px;
  height: 44px;
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
}

.converter-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card,
.result-card,
.info-card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.form-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-label {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.from-summary {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.result-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.result-row {
  display: grid;
  grid-template-columns: minmax(100px, 1.2fr) minmax(90px, 1fr) minmax(130px, 1.4fr) 70px 44px;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  border-bottom: 1px solid var(--color-border-muted);
  font-variant-numeric: tabular-nums;
}

.result-city {
  color: var(--color-accent-fg);
  font-weight: 600;
  text-decoration: none;
}

.result-city:hover {
  text-decoration: underline;
}

.result-time {
  color: var(--color-fg-default);
  font-size: 1.15rem;
  font-weight: 700;
}

.result-date,
.result-offset {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.shift {
  color: var(--color-accent-fg);
}

.remove-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-fg-muted);
  font-size: 20px;
  cursor: pointer;
}

.remove-btn:hover {
  background: var(--color-canvas-subtle);
}

.empty {
  color: var(--color-fg-muted);
}

.add-cities {
  margin-top: 16px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.chip:hover {
  border-color: var(--color-accent-fg);
  color: var(--color-accent-fg);
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

@media (max-width: 640px) {
  .header {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .content {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid .field:first-child {
    grid-column: 1 / -1;
  }

  /* 폰: 도시·시각 / 날짜·오프셋, 빼기 버튼은 오른쪽 */
  .result-row {
    grid-template-columns: 1fr auto 44px;
    grid-template-areas:
      'city time remove'
      'date offset remove';
    row-gap: 0;
    padding: 6px 0;
  }

  .result-city { grid-area: city; }
  .result-time { grid-area: time; text-align: right; }
  .result-date { grid-area: date; }
  .result-offset { grid-area: offset; text-align: right; }
  .remove-btn { grid-area: remove; }
}
</style>
