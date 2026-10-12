<template>
  <div class="study-view" :class="{ 'is-clean': clean }">
    <AnimatedBackground
      :enabled="settings.backgroundEffectsEnabled"
      :effect="settings.backgroundEffect"
      :intensity="settings.animationIntensity"
    />

    <div class="layout">
      <header v-if="!clean" class="header">
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
          <h1 class="page-title">{{ t.title }}</h1>
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
            <UiButton
              type="text"
              :icon="ShareAltOutlined"
              class="icon-btn"
              :aria-label="t.share"
              :title="t.share"
              @click="share"
            />
          </div>
        </div>
      </header>

      <div class="content" role="main">
        <section class="panel" :aria-label="t.now">
          <div class="now-units">
            <SplitFlapDisplay :text="nowHours" :label="t.h" />
            <div class="sep" aria-hidden="true">:</div>
            <SplitFlapDisplay :text="nowMinutes" :label="t.m" />
          </div>
          <p class="now-date">{{ nowDate }}</p>
        </section>

        <section class="panel timer-panel" :class="{ 'is-done': done }" :aria-label="t.timer">
          <p class="timer-status" aria-live="polite">{{ statusText }}</p>
          <div class="timer-units">
            <template v-if="remainingParts.h">
              <SplitFlapDisplay :text="remainingParts.h" :label="t.leftH" />
              <div class="sep" aria-hidden="true">:</div>
            </template>
            <SplitFlapDisplay :text="remainingParts.m" :label="t.leftM" />
            <div class="sep" aria-hidden="true">:</div>
            <SplitFlapDisplay :text="remainingParts.s" :label="t.leftS" />
          </div>

          <div class="presets" role="group" :aria-label="t.choose">
            <UiButton
              v-for="minutes in PRESETS"
              :key="minutes"
              :type="durationMinutes === minutes ? 'primary' : 'default'"
              :aria-pressed="durationMinutes === minutes"
              @click="choose(minutes)"
            >
              {{ t.minutes(minutes) }}
            </UiButton>
          </div>

          <div class="actions">
            <UiButton type="primary" size="large" :icon="running ? PauseOutlined : CaretRightOutlined" @click="running ? pause() : start()">
              {{ running ? t.pause : remainingMs < durationMinutes * 60000 && !done ? t.resume : t.start }}
            </UiButton>
            <UiButton size="large" :icon="UndoOutlined" @click="reset">{{ t.reset }}</UiButton>
          </div>
        </section>

        <UiCard v-if="!clean && !isEn" class="guide-card" title="공부 시계 이렇게 써요">
          <ul>
            <li><strong>25분 집중 + 5분 휴식</strong>(뽀모도로)이 처음 시작하기 좋아요. 익숙해지면 50분, 긴 공부는 90분.</li>
            <li>이 화면을 열어 두면 <strong>화면이 꺼지지 않아요</strong>. 폰을 눕히면 가로로 크게 보여요.</li>
            <li>타이머는 새로고침하거나 앱을 잠깐 닫아도 이어서 흘러가요.</li>
            <li>스터디 윗미 방송(OBS 등)에는 주소 끝에 <code>?clean=1</code>을 붙이면 머리말·설명 없이 시계만 나와요.</li>
            <li>배경 효과와 다크 모드는 <router-link to="/settings">설정</router-link>에서 바꿀 수 있어요.</li>
          </ul>
        </UiCard>
        <UiCard v-if="!clean && isEn" class="guide-card" title="How to use the study clock">
          <ul>
            <li><strong>25 minutes of focus + 5 minutes of rest</strong> (Pomodoro) is a good start. Move to 50 minutes when it feels easy, or 90 for long sessions.</li>
            <li>While this page is open <strong>your screen stays on</strong>. Turn your phone sideways for a bigger clock.</li>
            <li>The timer keeps running even if you reload or briefly close the app.</li>
            <li>For study-with-me streams (OBS and similar), add <code>?clean=1</code> to the address to show only the clocks.</li>
            <li>Change background effects and dark mode in <router-link to="/en/settings">Settings</router-link>.</li>
          </ul>
        </UiCard>
      </div>

      <AppFooter v-if="!clean" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftOutlined, FullscreenOutlined, FullscreenExitOutlined, ShareAltOutlined,
  CaretRightOutlined, PauseOutlined, UndoOutlined
} from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useSettings } from '@/composables/useSettings'
import { useWakeLock } from '@/composables/useWakeLock'
import { useFullscreen } from '@/composables/useFullscreen'
import { shareLink } from '@/utils/shareLink'
import { useLocale } from '@/composables/useLocale'
import dayjs from '@/utils/dayjs'

/**
 * ## 공부 시계 (/study)
 *
 * 지금 시각 + 집중 타이머(25·50·90분). "공부 시계", "스터디 윗미 시계" 검색용.
 * - 끝나는 시각(endAt)을 저장해서 계산 → 탭이 느려지거나 새로고침해도 정확
 * - 이 화면에서는 항상 화면 켜두기
 * - `?clean=1`: 방송용으로 머리말·설명·푸터 숨김
 */

const PRESETS = [25, 50, 90] as const
const STORAGE_KEY = 'study-timer'

interface SavedTimer {
  minutes: number
  /** 흐르는 중이면 끝나는 시각(ms) */
  endAt: number | null
  /** 멈춰 있으면 남은 시간(ms) */
  remaining: number
}

const route = useRoute()
const { isEn, lp, pick } = useLocale()
const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', title: '공부 시계',
    fullscreen: '전체 화면', fullscreenOff: '전체 화면 끝내기', share: '공부 시계 링크 공유',
    now: '지금 시각', h: '시', m: '분', timer: '집중 타이머', leftH: '남은 시', leftM: '남은 분', leftS: '남은 초',
    choose: '집중 시간 고르기', minutes: (n: number) => `${n}분`,
    start: '시작', pause: '잠깐 멈춤', resume: '이어서', reset: '처음으로',
    done: '끝! 잠깐 쉬어요 ☕', endsAt: (time: string) => `${time}에 끝나요`, focus: (n: number) => `${n}분 집중`,
    timeFormat: 'A h:mm', dateFormat: 'M월 D일 dddd',
    shareTitle: '공부 시계 · 플립시계', shareText: '플립시계로 25·50·90분 집중 타이머를 켜 두세요'
  },
  en: {
    back: 'Back', backLabel: 'Go back', title: 'Study Clock',
    fullscreen: 'Fullscreen', fullscreenOff: 'Exit fullscreen', share: 'Share the study clock',
    now: 'Current time', h: 'Hour', m: 'Minute', timer: 'Focus timer', leftH: 'Hours left', leftM: 'Minutes left', leftS: 'Seconds left',
    choose: 'Choose focus time', minutes: (n: number) => `${n} min`,
    start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset',
    done: 'Done! Take a break ☕', endsAt: (time: string) => `Ends at ${time}`, focus: (n: number) => `${n}-minute focus`,
    timeFormat: 'h:mm A', dateFormat: 'dddd, MMMM D',
    shareTitle: 'Study Clock · Flip Clock', shareText: 'A flip clock with a 25, 50 or 90 minute focus timer'
  }
})
const goBack = useGoBack()
const clean = computed(() => route.query.clean === '1')

const { settings, loadSettings } = useSettings()
useWakeLock(ref(true))
const { supported: fullscreenSupported, isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// ----- 지금 시각 -----
const now = ref(Date.now())
const nowHours = computed(() => dayjs(now.value).format('HH'))
const nowMinutes = computed(() => dayjs(now.value).format('mm'))
const nowDate = computed(() => dayjs(now.value).locale(isEn.value ? 'en' : 'ko').format(t.value.dateFormat))

// ----- 타이머 -----
const durationMinutes = ref<number>(25)
const endAt = ref<number | null>(null)
const pausedRemaining = ref(25 * 60000)

const running = computed(() => endAt.value !== null)
const remainingMs = computed(() => endAt.value !== null
  ? Math.max(0, endAt.value - now.value)
  : pausedRemaining.value)
const done = computed(() => remainingMs.value === 0)

const remainingParts = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  const h = Math.floor(total / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    h: h ? String(h) : '',
    m: pad(Math.floor((total % 3600) / 60)),
    s: pad(total % 60)
  }
})

const statusText = computed(() => {
  if (done.value) return t.value.done
  if (running.value) return t.value.endsAt(dayjs(endAt.value!).locale(isEn.value ? 'en' : 'ko').format(t.value.timeFormat))
  return t.value.focus(durationMinutes.value)
})

const save = () => {
  const data: SavedTimer = { minutes: durationMinutes.value, endAt: endAt.value, remaining: pausedRemaining.value }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* 저장 못 해도 타이머는 동작 */ }
}

const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as SavedTimer | null
    if (!data || !PRESETS.includes(data.minutes as typeof PRESETS[number])) return
    durationMinutes.value = data.minutes
    endAt.value = data.endAt
    pausedRemaining.value = data.endAt === null ? data.remaining : 0
  } catch { /* 저장값이 깨졌으면 기본값 */ }
}

const choose = (minutes: number) => {
  durationMinutes.value = minutes
  endAt.value = null
  pausedRemaining.value = minutes * 60000
  save()
}

const start = () => {
  const remaining = done.value ? durationMinutes.value * 60000 : pausedRemaining.value
  endAt.value = Date.now() + remaining
  save()
}

const pause = () => {
  pausedRemaining.value = remainingMs.value
  endAt.value = null
  save()
}

const reset = () => choose(durationMinutes.value)

// 끝나는 순간: 진동(지원 기기만), 멈춘 상태로 저장
watch(done, (isDone) => {
  if (!isDone || !running.value) return
  navigator.vibrate?.([200, 100, 200])
  endAt.value = null
  pausedRemaining.value = 0
  save()
})

const share = () => shareLink(`https://piso-split-flap.netlify.app${lp('/study')}`, t.value.shareTitle, t.value.shareText)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  loadSettings()
  load()
  now.value = Date.now()
  timer = setInterval(() => { now.value = Date.now() }, 250)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.study-view {
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
  max-width: 720px;
  padding: 24px;
  text-align: center;
  background: rgba(var(--color-canvas-default-rgb), 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(var(--color-border-default-rgb), 0.3);
  border-radius: 20px;
  box-shadow: var(--shadow-large);
}

.now-units,
.timer-units {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.now-units {
  --flap-w: min(clamp(1.5rem, calc(8vw - 2px), 3rem), 12vh);
}

.timer-units {
  --flap-w: min(clamp(1.9rem, calc(12vw - 2px), 5rem), 20vh);
}

.sep {
  color: var(--color-fg-muted);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 2px;
}

.now-date {
  margin: 12px 0 0;
  color: var(--color-fg-muted);
}

.timer-status {
  margin: 0 0 16px;
  color: var(--color-fg-default);
  font-size: 1.1rem;
  font-weight: 600;
}

.timer-panel.is-done {
  animation: done-pulse 1.2s ease-in-out 3;
}

@keyframes done-pulse {
  50% { box-shadow: 0 0 0 6px var(--color-accent-fg); }
}

@media (prefers-reduced-motion: reduce) {
  .timer-panel.is-done {
    animation: none;
    box-shadow: 0 0 0 4px var(--color-accent-fg);
  }
}

.presets,
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.presets :deep(button) {
  min-width: 72px;
  min-height: 44px;
}

.guide-card {
  width: 100%;
  max-width: 720px;
  border-radius: 12px;
}

.guide-card ul {
  margin: 0;
  padding-left: 1.25rem;
}

.guide-card li {
  color: var(--color-fg-default);
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.guide-card a {
  color: var(--color-accent-fg);
}

.guide-card code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-canvas-subtle);
}

/* 방송용: 시계만 화면 가운데 */
.is-clean .content {
  justify-content: center;
}

/* 가로로 눕힌 폰: 두 판을 나란히 */
@media (orientation: landscape) and (max-height: 500px) {
  .header {
    height: 48px;
  }

  .content {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    padding: 12px;
  }

  .panel {
    flex: 1 1 280px;
    max-width: none;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .content {
    padding: 16px;
  }
}
</style>
