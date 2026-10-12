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
          <!-- 기준: 도시 → 큰 시각(눌러서 입력) → 끌어서 조절 → 날짜 -->
          <UiCard class="form-card">
            <div class="base-head">
              <label class="field base-city">
                <span class="field-label">{{ t.from }}</span>
                <UiSelect v-model:value="fromSlug" :aria-label="t.from" :options="fromOptions" />
              </label>
              <UiButton :icon="FieldTimeOutlined" class="now-btn" @click="setNow">{{ t.now }}</UiButton>
            </div>

            <div class="base-time">
              <input
                v-model="time"
                type="time"
                class="big-time"
                :aria-label="t.time"
                required
              >
              <span class="base-tag" :class="`part-${basePart}`">{{ t.parts[basePart] }}</span>
            </div>

            <div class="slider">
              <input
                v-model.number="minutes"
                type="range"
                min="0"
                max="1425"
                step="15"
                :aria-label="t.slide"
                :aria-valuetext="time"
              >
              <div class="slider-marks" aria-hidden="true">
                <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
              </div>
              <p class="slider-hint">{{ t.slideHint }}</p>
            </div>

            <div class="date-row">
              <button type="button" class="day-btn" :aria-label="t.prevDay" @click="shiftDay(-1)">‹</button>
              <label class="date-pick">
                <span class="date-text">{{ baseDateText }}</span>
                <input v-model="date" type="date" class="date-input" :aria-label="t.date" required>
              </label>
              <button type="button" class="day-btn" :aria-label="t.nextDay" @click="shiftDay(1)">›</button>
            </div>
          </UiCard>

          <UiCard class="result-card" :title="t.results">
            <ul class="result-list">
              <li v-for="row in rows" :key="row.slug" class="result-row" :class="`part-${row.part}`">
                <div class="result-main">
                  <router-link :to="lp(`/time/${row.slug}`)" class="result-city">{{ row.name }}</router-link>
                  <span class="result-sub">
                    <span class="result-part" :class="`part-${row.part}`">{{ t.parts[row.part] }}</span>
                    <span class="result-gap">{{ row.gap }}</span>
                  </span>
                </div>
                <div class="result-when">
                  <span class="result-time">{{ row.time }}</span>
                  <span class="result-date">
                    <span v-if="row.shift" class="shift">{{ row.shift }}</span>
                    {{ row.date }}
                  </span>
                </div>
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
              <li>기준 도시를 고르고 <strong>막대를 끌거나</strong> 큰 시각을 눌러 바꾸면, 아래 도시들의 같은 순간 시각이 바로 바뀌어요.</li>
              <li>도시마다 <strong>업무 중·저녁·밤·아침</strong>이 표시돼서 통화·회의하기 좋은 시간을 한눈에 찾을 수 있어요.</li>
              <li><strong>서머타임</strong>도 날짜에 맞춰 자동 반영돼요. 그래서 3월·11월처럼 서머타임이 바뀌는 때에는 같은 도시라도 시차가 1시간 달라질 수 있어요.</li>
              <li>해외 회의·통화 시간 잡기, 해외 주식 장 시작 시각, 해외 가족에게 연락하기 좋은 시간을 찾을 때 써 보세요.</li>
              <li>도시를 더하거나 빼고 <strong>공유</strong>를 누르면 같은 계산을 링크로 보낼 수 있어요.</li>
              <li>도시를 누르면 그 도시의 플립시계와 서울 시간 변환표가 나와요.</li>
            </ul>
          </UiCard>
          <UiCard v-else class="info-card" title="How to use the time zone converter">
            <ul>
              <li>Pick a city, then <strong>drag the slider</strong> or tap the big time; every other city updates instantly.</li>
              <li>Each city shows <strong>work hours, evening, night or morning</strong>, so finding a good time to call is easy.</li>
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
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useLocale } from '@/composables/useLocale'
import { shareLink } from '@/utils/shareLink'
import { CITIES, SEOUL_TZ, deviceTimezone, findCity } from '@/utils/cityTime'
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

// 그 도시의 그 시각이 하루 중 어느 때인지 (통화·회의 시간 잡기용)
type DayPart = 'work' | 'evening' | 'night' | 'morning'
const dayPart = (hour: number): DayPart => hour >= 9 && hour < 18 ? 'work' : hour >= 18 && hour < 22 ? 'evening' : hour >= 6 && hour < 9 ? 'morning' : 'night'
const DEFAULT_TARGETS = ['seoul', 'tokyo', 'london', 'paris', 'new-york', 'los-angeles', 'sydney']

const route = useRoute()
const router = useRouter()
const goBack = useGoBack()
const { isEn, lp, pick } = useLocale()

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', title: '시차 계산기', share: '이 계산 링크 공유',
    from: '기준 도시', date: '날짜', time: '기준 시각', now: '지금', mine: (tz: string) => `내 시간대 (${tz})`,
    slide: '기준 시각 조절', slideHint: '막대를 끌면 모든 도시 시각이 함께 바뀌어요', prevDay: '하루 전', nextDay: '하루 뒤',
    parts: { work: '업무 중', evening: '저녁', night: '밤', morning: '아침' } as Record<DayPart, string>,
    gap: (h: string) => `기준보다 ${h}`, same: '기준과 같음', ahead: (h: string) => `${h} 빠름`, behind: (h: string) => `${h} 느림`, hours: (n: number) => `${n}시간`,
    results: '같은 순간, 다른 도시', remove: (n: string) => `${n} 빼기`, add: '도시 더하기',
    empty: '아래에서 비교할 도시를 더해 주세요.',
    prev: '전날', next: '다음 날', timeFormat: 'A h:mm', dateFormat: 'M월 D일 (ddd)', baseDateFormat: 'YYYY년 M월 D일 (ddd)',
    shareTitle: '시차 계산기 · 플립시계', shareText: '이 시각이 다른 나라에서는 몇 시인지 확인해 보세요'
  },
  en: {
    back: 'Back', backLabel: 'Go back', title: 'Time Zone Converter', share: 'Share this conversion',
    from: 'From', date: 'Date', time: 'Time', now: 'Now', mine: (tz: string) => `My time zone (${tz})`,
    slide: 'Adjust the time', slideHint: 'Drag the slider and every city follows', prevDay: 'Previous day', nextDay: 'Next day',
    parts: { work: 'Work hours', evening: 'Evening', night: 'Night', morning: 'Morning' } as Record<DayPart, string>,
    gap: (h: string) => h, same: 'Same time', ahead: (h: string) => `${h} ahead`, behind: (h: string) => `${h} behind`, hours: (n: number) => `${n} h`,
    results: 'Same moment in other cities', remove: (n: string) => `Remove ${n}`, add: 'Add a city',
    empty: 'Add cities below to compare.',
    prev: 'Prev day', next: 'Next day', timeFormat: 'h:mm A', dateFormat: 'ddd, MMM D', baseDateFormat: 'ddd, MMM D, YYYY',
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

// 막대: 하루 중 몇 분째 (15분 단위)
const minutes = computed({
  get: () => {
    const [h, m] = (validTime(time.value) ? time.value : '00:00').split(':').map(Number)
    return h * 60 + m
  },
  set: (value: number) => {
    time.value = `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  }
})

const shiftDay = (days: number) => {
  date.value = base.value.add(days, 'day').format('YYYY-MM-DD')
}

const baseDateText = computed(() => base.value.locale(locale.value).format(t.value.baseDateFormat))
const basePart = computed(() => dayPart(base.value.hour()))

const gapLabel = (diffMinutes: number) => {
  if (diffMinutes === 0) return t.value.same
  const hours = Math.abs(diffMinutes) / 60
  const text = t.value.hours(Number.isInteger(hours) ? hours : Number(hours.toFixed(1)))
  return t.value.gap(diffMinutes > 0 ? t.value.ahead(text) : t.value.behind(text))
}

const rows = computed(() => {
  const baseDate = base.value.format('YYYY-MM-DD')
  const baseOffset = base.value.utcOffset()
  return targets.value
    .map(slug => findCity(slug)!)
    // 기준 도시는 위 카드에 이미 있으니 목록에서 뺌
    .filter(city => city.slug !== fromSlug.value)
    .map(city => {
      const local = base.value.tz(city.timezone).locale(locale.value)
      const localDate = local.format('YYYY-MM-DD')
      return {
        slug: city.slug,
        name: isEn.value ? city.en : city.ko,
        time: local.format(t.value.timeFormat),
        date: local.format(t.value.dateFormat),
        shift: localDate < baseDate ? t.value.prev : localDate > baseDate ? t.value.next : '',
        gap: gapLabel(local.utcOffset() - baseOffset),
        part: dayPart(local.hour()),
        sort: local.utcOffset()
      }
    })
    .sort((a, b) => b.sort - a.sort)
})

const addable = computed(() => CITIES.filter(city => !targets.value.includes(city.slug) && city.slug !== fromSlug.value))

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

/* 기준 카드 */
.base-head {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.base-city {
  flex: 1;
}

.field-label {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.now-btn {
  flex-shrink: 0;
}

.base-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

/* 큰 시각: 눌러서 직접 입력 */
.big-time {
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--color-fg-default);
  font: inherit;
  font-size: clamp(2.5rem, 9vw, 3.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  cursor: pointer;
  color-scheme: light dark;
}

/* 브라우저 기본 시계 아이콘이 글씨만큼 커지지 않게 */
.big-time::-webkit-calendar-picker-indicator {
  width: 0.4em;
  height: 0.4em;
  margin-left: 4px;
  opacity: 0.45;
  cursor: pointer;
}

.big-time:hover {
  border-color: var(--color-border-default);
}

.big-time:focus-visible {
  outline: 2px solid var(--color-accent-fg);
  outline-offset: 2px;
}

/* 하루 중 때: 업무 중(초록) · 저녁(주황) · 밤(남색) · 아침(하늘) */
.part-work { --part: #2da44e; }
.part-evening { --part: #d97706; }
.part-night { --part: #6366f1; }
.part-morning { --part: #0ea5e9; }

.base-tag,
.result-part {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-fg-muted);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.base-tag::before,
.result-part::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--part);
}

.slider {
  margin-top: 16px;
}

.slider input[type='range'] {
  width: 100%;
  height: 44px;
  margin: 0;
  accent-color: var(--color-accent-fg);
  cursor: grab;
}

.slider input[type='range']:active {
  cursor: grabbing;
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: -6px;
  color: var(--color-fg-muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.slider-hint {
  margin: 6px 0 0;
  color: var(--color-fg-muted);
  font-size: 0.85rem;
  text-align: center;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.day-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.day-btn:hover {
  border-color: var(--color-accent-fg);
  color: var(--color-accent-fg);
}

/* 날짜 글자를 누르면 달력이 열림 (입력칸은 투명하게 위에 겹침) */
.date-pick {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--color-fg-default);
  font-weight: 600;
  cursor: pointer;
}

.date-pick:hover,
.date-pick:focus-within {
  background: var(--color-canvas-subtle);
}

.date-input {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 결과 목록 */
.result-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.result-row {
  display: grid;
  grid-template-columns: 1fr auto 44px;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 8px 0 8px 14px;
  border-bottom: 1px solid var(--color-border-muted);
  font-variant-numeric: tabular-nums;
}

/* 왼쪽 색 막대로 하루 중 때를 한눈에 */
.result-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 2px;
  background: var(--part);
}

.result-main,
.result-when {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.result-when {
  align-items: flex-end;
  text-align: right;
}

.result-city {
  color: var(--color-fg-default);
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: none;
}

.result-city:hover {
  color: var(--color-accent-fg);
}

.result-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
}

.result-gap,
.result-date {
  color: var(--color-fg-muted);
  font-size: 0.85rem;
}

.result-time {
  color: var(--color-fg-default);
  font-size: 1.4rem;
  font-weight: 700;
}

.shift {
  margin-right: 4px;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--color-canvas-subtle);
  color: var(--color-accent-fg);
  font-weight: 600;
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

  .base-time {
    flex-direction: column;
    gap: 4px;
  }

  .result-time {
    font-size: 1.25rem;
  }
}
</style>
