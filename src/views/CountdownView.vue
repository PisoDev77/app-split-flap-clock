<template>
  <div class="countdown-view" :class="{ 'is-clean': clean }">
    <AnimatedBackground
      :enabled="settings.backgroundEffectsEnabled"
      :effect="celebrating ? 'particles' : 'stars'"
      :intensity="celebrating ? 'high' : settings.animationIntensity"
    />

    <div class="layout">
      <header v-if="!clean" class="header">
        <div class="header-content">
          <UiButton type="text" :icon="ArrowLeftOutlined" class="back-btn" :aria-label="t.backLabel" @click="goBack">
            {{ t.back }}
          </UiButton>
          <h1 class="page-title">{{ t.title(year) }}</h1>
          <div class="header-controls">
            <UiButton
              v-if="fullscreenSupported"
              type="text"
              :icon="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined"
              class="icon-btn"
              :aria-label="isFullscreen ? t.fullscreenOff : t.fullscreen"
              :title="t.fullscreen"
              @click="toggleFullscreen"
            />
            <UiButton type="text" :icon="ShareAltOutlined" class="icon-btn" :aria-label="t.share" :title="t.share" @click="share" />
          </div>
        </div>
      </header>

      <div class="content" role="main">
        <section class="panel" :class="{ 'is-celebrating': celebrating }" :aria-label="t.title(year)">
          <p class="place">{{ placeLabel }}</p>

          <template v-if="celebrating">
            <div class="units">
              <SplitFlapDisplay :text="String(year)" :label="t.year" />
            </div>
            <p class="headline">{{ t.happy(year) }}</p>
          </template>

          <template v-else>
            <p class="headline">{{ t.until(year) }}</p>
            <div class="units" role="timer" :aria-label="t.remainingLabel">
              <div class="unit">
                <SplitFlapDisplay :text="pad(parts.days)" :label="t.days" />
                <span class="unit-label" aria-hidden="true">{{ t.days }}</span>
              </div>
              <div class="unit">
                <SplitFlapDisplay :text="pad(parts.hours)" :label="t.hours" />
                <span class="unit-label" aria-hidden="true">{{ t.hours }}</span>
              </div>
              <div class="unit">
                <SplitFlapDisplay :text="pad(parts.minutes)" :label="t.minutes" />
                <span class="unit-label" aria-hidden="true">{{ t.minutes }}</span>
              </div>
              <div class="unit">
                <SplitFlapDisplay :text="pad(parts.seconds)" :label="t.seconds" />
                <span class="unit-label" aria-hidden="true">{{ t.seconds }}</span>
              </div>
            </div>
            <p class="target">{{ t.at(targetText) }}</p>
          </template>

          <div v-if="!clean" class="city-pick">
            <UiSelect v-model:value="citySlug" :aria-label="t.pickCity" :options="cityOptions" />
          </div>
        </section>

        <UiCard v-if="!clean" class="info-card" :title="t.orderTitle(year)">
          <p class="note">{{ t.orderNote }}</p>
          <ol class="order-list">
            <li v-for="item in order" :key="item.city.slug" :class="{ done: item.passed }">
              <router-link :to="lp(`/time/${item.city.slug}`)" class="order-city">{{ isEn ? item.city.en : item.city.ko }}</router-link>
              <span class="order-at">{{ item.yourTime }}</span>
              <span class="order-state">{{ item.passed ? t.already : item.left }}</span>
            </li>
          </ol>
        </UiCard>

        <UiCard v-if="!clean && !isEn" class="info-card" title="새해 카운트다운 이렇게 써요">
          <ul>
            <li>이 화면을 열어 두면 <strong>화면이 꺼지지 않아요</strong>. TV에 미러링하거나 전체화면으로 띄워 두세요.</li>
            <li>기본은 <strong>이 기기의 시간대</strong> 기준이에요. 아래 목록에서 다른 도시를 고르면 그 도시의 자정까지 셉니다.</li>
            <li>보신각 제야의 종은 한국 시간 자정(0시)에 맞춰 울려요. 해외에 있다면 도시를 서울로 골라 보세요.</li>
            <li>방송·모임 화면에는 주소 끝에 <code>?clean=1</code>을 붙이면 카운트다운만 크게 나와요.</li>
            <li>자정이 지나면 1월 1일 하루 동안 새해 인사 화면이 나오고, 그 뒤에는 다음 새해를 셉니다.</li>
          </ul>
        </UiCard>
        <UiCard v-if="!clean && isEn" class="info-card" title="How to use the New Year countdown">
          <ul>
            <li>While this page is open <strong>your screen stays on</strong>. Go fullscreen or cast it to your TV for the party.</li>
            <li>It counts to midnight in <strong>your device's time zone</strong>. Pick another city to count down to its midnight instead.</li>
            <li>For streams and party screens, add <code>?clean=1</code> to the address to show only the countdown.</li>
            <li>After midnight it shows a Happy New Year screen for all of January 1, then starts counting to the next year.</li>
          </ul>
        </UiCard>
      </div>

      <AppFooter v-if="!clean" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftOutlined, FullscreenOutlined, FullscreenExitOutlined, ShareAltOutlined
} from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useSettings } from '@/composables/useSettings'
import { useWakeLock } from '@/composables/useWakeLock'
import { useFullscreen } from '@/composables/useFullscreen'
import { useLocale } from '@/composables/useLocale'
import { shareLink } from '@/utils/shareLink'
import { CITIES, deviceTimezone, findCity } from '@/utils/cityTime'
import { targetYear, newYearMoment, isCelebrating, splitRemaining, worldOrder } from '@/utils/newYear'
import dayjs from '@/utils/dayjs'

/**
 * ## 새해 카운트다운 (/countdown/new-year, /en/countdown/new-year)
 *
 * 12월 31일 "새해 카운트다운" 검색용. 기본은 이 기기 시간대의 자정,
 * 도시를 고르면(?city=seoul) 그 도시의 자정까지 셈.
 * - 1월 1일 하루는 축하 화면, 그 뒤엔 다음 해를 셈
 * - 화면 항상 켜두기, 전체화면, ?clean=1 (방송·TV용)
 */

const route = useRoute()
const router = useRouter()
const goBack = useGoBack()
const { isEn, lp, pick } = useLocale()
const { settings, loadSettings } = useSettings()
useWakeLock(ref(true))
const { supported: fullscreenSupported, isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기',
    title: (y: number) => `${y} 새해 카운트다운`,
    fullscreen: '전체 화면', fullscreenOff: '전체 화면 끝내기', share: '카운트다운 링크 공유',
    year: '새해', happy: (y: number) => `${y}년 새해 복 많이 받으세요! 🎉`,
    until: (y: number) => `${y}년 1월 1일 0시까지`, remainingLabel: '새해까지 남은 시간',
    days: '일', hours: '시간', minutes: '분', seconds: '초',
    at: (time: string) => `내 시간으로 ${time}`,
    here: (tz: string) => `이 기기 시간대 (${tz})`, cityPlace: (name: string) => `${name} 기준`,
    pickCity: '기준 도시 고르기', mine: '내 시간대 (이 기기)',
    orderTitle: (y: number) => `세계에서 ${y}년을 맞는 순서`,
    orderNote: '새해를 먼저 맞는 도시부터 차례대로예요. 도시 옆 날짜·시각은 그 도시가 자정이 될 때의 내 시간이에요.',
    already: '새해 🎉', left: (h: number, m: number) => h ? `${h}시간 ${m}분 남음` : `${m}분 남음`,
    timeFormat: 'M월 D일 HH:mm', shareTitle: (y: number) => `${y} 새해 카운트다운 · 플립시계`,
    shareText: '플립시계로 새해까지 남은 시간을 함께 세요'
  },
  en: {
    back: 'Back', backLabel: 'Go back',
    title: (y: number) => `${y} New Year Countdown`,
    fullscreen: 'Fullscreen', fullscreenOff: 'Exit fullscreen', share: 'Share the countdown',
    year: 'New Year', happy: (y: number) => `Happy New Year ${y}! 🎉`,
    until: (y: number) => `Until January 1, ${y} at midnight`, remainingLabel: 'Time left until the New Year',
    days: 'days', hours: 'hours', minutes: 'min', seconds: 'sec',
    at: (time: string) => `${time} your time`,
    here: (tz: string) => `Your time zone (${tz})`, cityPlace: (name: string) => `${name} time`,
    pickCity: 'Count down for a city', mine: 'My time zone (this device)',
    orderTitle: (y: number) => `Who reaches ${y} first`,
    orderNote: 'Cities in the order they reach midnight. The date and time shown is that moment in your time.',
    already: 'New Year 🎉', left: (h: number, m: number) => h ? `${h} h ${m} min left` : `${m} min left`,
    timeFormat: 'MMM D, h:mm A', shareTitle: (y: number) => `${y} New Year Countdown · Flip Clock`,
    shareText: 'Count down to the New Year together on a flip clock'
  }
})

const clean = computed(() => route.query.clean === '1')
const MINE = '__mine__'
const citySlug = ref<string>(findCity(String(route.query.city)) ? String(route.query.city) : MINE)
// 고른 도시를 주소에 남겨 공유·새로고침해도 유지
watch(citySlug, (slug) => {
  router.replace({ query: { ...route.query, city: slug === MINE ? undefined : slug } })
})

const myTimezone = deviceTimezone()
const city = computed(() => citySlug.value === MINE ? undefined : findCity(citySlug.value))
const timezone = computed(() => city.value?.timezone ?? myTimezone)

const now = ref(dayjs())
const year = computed(() => targetYear(timezone.value, now.value))
const celebrating = computed(() => isCelebrating(timezone.value, now.value))
const target = computed(() => newYearMoment(timezone.value, year.value))
const parts = computed(() => splitRemaining(target.value.diff(now.value)))
const pad = (n: number) => String(n).padStart(2, '0')

const locale = computed(() => isEn.value ? 'en' : 'ko')
const targetText = computed(() => target.value.tz(myTimezone).locale(locale.value).format(t.value.timeFormat))
const placeLabel = computed(() => city.value
  ? t.value.cityPlace(isEn.value ? city.value.en : city.value.ko)
  : t.value.here(myTimezone))

const cityOptions = computed(() => [
  { value: MINE, label: t.value.mine },
  ...CITIES.map(c => ({ value: c.slug, label: isEn.value ? c.en : c.ko }))
])

// 세계 순서: 1분마다만 바뀌면 충분
const minuteTick = computed(() => now.value.startOf('minute').valueOf())
const order = computed(() => {
  const at = dayjs(minuteTick.value)
  return worldOrder(year.value).map(({ city: c, at: moment }) => {
    const left = moment.diff(at, 'minute')
    return {
      city: c,
      passed: left <= 0,
      yourTime: moment.tz(myTimezone).locale(locale.value).format(t.value.timeFormat),
      left: t.value.left(Math.floor(left / 60), left % 60)
    }
  })
})

const share = () => shareLink(
  `https://piso-split-flap.netlify.app${lp('/countdown/new-year')}${city.value ? `?city=${city.value.slug}` : ''}`,
  t.value.shareTitle(year.value),
  t.value.shareText
)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  loadSettings()
  now.value = dayjs()
  timer = setInterval(() => { now.value = dayjs() }, 250)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.countdown-view {
  min-height: 100vh;
  min-height: 100dvh;
}

.layout {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.header {
  background: rgba(var(--color-canvas-default-rgb), 0.85);
  backdrop-filter: blur(8px);
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

.header-controls {
  display: flex;
  gap: 8px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.panel {
  width: 100%;
  max-width: 820px;
  padding: 28px 20px;
  text-align: center;
  background: rgba(var(--color-canvas-default-rgb), 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(var(--color-border-default-rgb), 0.3);
  border-radius: 20px;
  box-shadow: var(--shadow-large);
}

.place {
  margin: 0 0 8px;
  color: var(--color-fg-muted);
  font-size: 0.95rem;
}

.headline {
  margin: 0 0 20px;
  color: var(--color-fg-default);
  font-size: 1.25rem;
  font-weight: 700;
}

.is-celebrating .headline {
  margin: 20px 0 0;
  font-size: 1.5rem;
}

.units {
  --flap-w: min(clamp(1.6rem, calc(9vw - 4px), 4.25rem), 18vh);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(8px, 2.5vw, 20px);
}

.unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.unit-label {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.target {
  margin: 20px 0 0;
  color: var(--color-fg-muted);
}

.city-pick {
  max-width: 280px;
  margin: 20px auto 0;
}

.info-card {
  width: 100%;
  max-width: 820px;
  border-radius: 12px;
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

.info-card a {
  color: var(--color-accent-fg);
}

.info-card code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-canvas-subtle);
}

.note {
  margin: 0 0 12px;
  color: var(--color-fg-muted);
  line-height: 1.6;
}

.info-card .order-list {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: order;
}

.info-card .order-list li {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) minmax(120px, 1.2fr) minmax(100px, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin: 0;
  border-bottom: 1px solid var(--color-border-muted);
  font-variant-numeric: tabular-nums;
}

.order-city {
  font-weight: 600;
  text-decoration: none;
}

.order-at,
.order-state {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
}

.order-state {
  text-align: right;
}

.order-list .done .order-state {
  color: var(--color-accent-fg);
  font-weight: 600;
}

.is-clean .content {
  justify-content: center;
}

@media (orientation: landscape) and (max-height: 500px) {
  .header {
    height: 48px;
  }

  .panel {
    padding: 12px;
  }

  .headline {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .content {
    padding: 16px;
  }

  .info-card .order-list li {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'city state'
      'at at';
    row-gap: 0;
    padding: 6px 0;
  }

  .order-city { grid-area: city; }
  .order-state { grid-area: state; }
  .order-at { grid-area: at; font-size: 0.85rem; }
}
</style>
