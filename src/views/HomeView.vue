<template>
  <div class="home-view">
    <!-- 애니메이션 배경 -->
    <AnimatedBackground 
      :enabled="backgroundEffectsEnabled"
      :effect="backgroundEffect"
      :intensity="animationIntensity"
    />
    
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <div class="header-start">
            <UiButton
              ref="menuButton"
              type="text"
              :icon="MenuOutlined"
              class="settings-btn round-btn"
              :aria-label="t.tools"
              :title="t.tools"
              aria-controls="clock-tools"
              :aria-expanded="toolsOpen"
              @click="toolsOpen = true"
            />
            <h1 class="app-title">Split Flap Clock</h1>
          </div>
          <div class="header-controls">
            <UiButton 
              type="text" 
              :icon="SettingOutlined"
              class="settings-btn round-btn gear-btn"
              :aria-label="t.settings"
              :title="t.settingsTitle"
              @click="$router.push(lp('/settings'))"
            />
          </div>
        </div>
      </header>
      
      <div class="content">
        <div class="clock-container" role="main" :aria-label="t.clockArea">
          <div class="city-display" :style="cityFlapStyle">
            <div class="city-container">
              <SplitFlapDisplay :text="cityName" :label="t.city" />
              <span class="city-label">{{ cityLabel }}</span>
            </div>
          </div>
          
          <div class="time-display" role="timer" :aria-label="t.now">
            <div class="time-units">
              <SplitFlapDisplay :text="hours" :label="t.h" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="minutes" :label="t.m" />
              <div class="time-separator" aria-hidden="true">:</div>
              <SplitFlapDisplay :text="seconds" :label="t.s" />
            </div>
          </div>
          
          <div class="date-info">
            <span class="ui-text date-text" role="text" :aria-label="t.date">
              {{ currentDate }}
            </span>
          </div>

          <!-- 12월~1월 1일: 새해 카운트다운 안내 -->
          <router-link v-if="newYearSoon" :to="lp('/countdown/new-year')" class="lang-pill">
            {{ t.countdown(newYearSoon) }}
          </router-link>

          <!-- 브라우저 언어와 페이지 언어가 다르면 다른 언어판을 살짝 안내 -->
          <router-link v-if="otherLanguage" :to="otherLanguage.to" class="lang-pill" :lang="otherLanguage.lang">
            {{ otherLanguage.label }}
          </router-link>
        </div>
      </div>
      
      <!-- 도구 사이드바: 평소엔 숨기고 메뉴 버튼으로 엶 -->
      <Transition name="drawer-fade">
        <div v-if="toolsOpen" class="drawer-backdrop" @click="toolsOpen = false" />
      </Transition>
      <Transition name="drawer-slide">
        <aside
          v-if="toolsOpen"
          id="clock-tools"
          ref="drawer"
          class="drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="t.tools"
          @keydown.esc="toolsOpen = false"
        >
          <div class="drawer-head">
            <span class="drawer-title">{{ t.tools }}</span>
            <UiButton type="text" :icon="CloseOutlined" class="settings-btn round-btn" :aria-label="t.close" @click="toolsOpen = false" />
          </div>
          <nav class="drawer-list">
            <button
              v-for="action in clockActions"
              :key="action.key"
              type="button"
              class="drawer-item"
              :class="{ 'is-on': action.on }"
              :aria-pressed="action.pressed"
              @click="runTool(action.run)"
            >
              <component :is="action.icon" class="drawer-icon" aria-hidden="true" />
              <span class="drawer-text">
                <span>{{ action.label }}</span>
                <small v-if="action.key === 'wake'">{{ t.wakeHint }}</small>
              </span>
            </button>
            <router-link :to="lp('/time-converter')" class="drawer-item">
              <GlobalOutlined class="drawer-icon" aria-hidden="true" />
              <span class="drawer-text">
                <span>{{ t.converter }}</span>
                <small>{{ t.converterHint }}</small>
              </span>
            </router-link>
          </nav>
        </aside>
      </Transition>

      <AppFooter class="desktop-only-footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useRoute } from 'vue-router'
import { SettingOutlined, BulbOutlined, BulbFilled, FullscreenOutlined, FullscreenExitOutlined, ShareAltOutlined, GlobalOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { useWakeLock } from '@/composables/useWakeLock'
import { useFullscreen } from '@/composables/useFullscreen'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useLocation } from '@/composables/useLocation'
import { useTime } from '@/composables/useTime'
import { useSettings } from '@/composables/useSettings'
import dayjs from '@/utils/dayjs'
import { parseShareQuery, buildShareUrl, shareLink } from '@/utils/shareLink'
import { useLocale } from '@/composables/useLocale'
import { message } from '@/composables/useToast'

/**
 * ## 홈 화면 뷰
 * 
 * **메인 시계 화면**을 표시하는 뷰 컴포넌트입니다.
 * 
 * ### 기능
 * - 현재 시간 실시간 표시
 * - 선택한 도시 또는 기기 시간대 기준 도시명 표시
 * - 설정 페이지 네비게이션
 * - 반응형 레이아웃
 * 
 * @since 1.0.0
 */


const { currentLocation, getCurrentLocation, getCityKoreanName, getTimezoneByCity } = useLocation()
const { currentTime: time, startTimer, stopTimer } = useTime()

// 배경 효과 설정
// 설정 관리 컴포저블 사용
const { settings, loadSettings } = useSettings()

const backgroundEffectsEnabled = computed(() => settings.value.backgroundEffectsEnabled)
const { isEn, lp, pick } = useLocale()
const t = pick({
  ko: {
    wake: '화면 켜두기', wakeOff: '화면 켜두기 끄기', fullscreen: '전체 화면', fullscreenOff: '전체 화면 끝내기',
    wakeShort: '켜두기', fullShort: '전체 화면', shareShort: '공유',
    wakeHint: '시계를 켜 둔 동안 화면이 꺼지지 않게 합니다', wakeOn: '화면 켜두기 켜짐 · 이 화면에서는 화면이 꺼지지 않아요', wakeOffToast: '화면 켜두기 꺼짐',
    converter: '시차 계산기', converterHint: '다른 나라는 지금 몇 시인지 계산', tools: '메뉴', close: '닫기',
    share: '이 시계 링크 공유', settings: '설정 페이지 열기', settingsTitle: '설정', clockArea: '시계 표시 영역', city: '도시',
    now: '현재 시간', h: '시', m: '분', s: '초', date: '현재 날짜',
    shared: '공유받은 도시', selected: '선택한 도시', here: '현재 위치',
    am: '오전', pm: '오후', dateFormat: 'YYYY년 M월 D일 dddd',
    countdown: (y: number) => `🎆 ${y} 새해 카운트다운 →`,
    shareTitle: '플립시계', shareCity: (city: string) => `${city} 시간을 플립시계로 보세요`, shareDefault: '공항 안내판처럼 넘어가는 플립시계'
  },
  en: {
    wake: 'Keep screen on', wakeOff: 'Stop keeping screen on', fullscreen: 'Fullscreen', fullscreenOff: 'Exit fullscreen',
    wakeShort: 'Stay on', fullShort: 'Fullscreen', shareShort: 'Share',
    wakeHint: 'Stops the screen from sleeping while the clock is open', wakeOn: 'Screen will stay on while the clock is open', wakeOffToast: 'Screen can sleep again',
    converter: 'Time zone converter', converterHint: 'What time is it elsewhere?', tools: 'Menu', close: 'Close',
    share: 'Share this clock', settings: 'Open settings', settingsTitle: 'Settings', clockArea: 'Clock', city: 'City',
    now: 'Current time', h: 'Hour', m: 'Minute', s: 'Second', date: 'Today',
    shared: 'Shared city', selected: 'Selected city', here: 'Your time zone',
    am: 'AM', pm: 'PM', dateFormat: 'dddd, MMMM D, YYYY',
    countdown: (y: number) => `🎆 ${y} New Year countdown →`,
    shareTitle: 'Flip Clock', shareCity: (city: string) => `See ${city} time on a flip clock`, shareDefault: 'A free split-flap clock for your desk'
  }
})

// 12월이거나 1월 1일이면 다가오는(또는 오늘 맞은) 새해 연도, 아니면 null
const newYearSoon = computed(() => {
  const local = dayjs(time.value)
  if (local.month() === 11) return local.year() + 1
  if (local.month() === 0 && local.date() === 1) return local.year()
  return null
})

const otherLanguage = computed(() => {
  const browserKo = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ko')
  if (isEn.value && browserKo) return { to: '/', label: '한국어로 보기 →', lang: 'ko' }
  if (!isEn.value && !browserKo) return { to: '/en', label: 'View in English →', lang: 'en' }
  return null
})

// 공유 링크로 들어오면 그 모양으로 보여 줌 (내 설정은 바꾸지 않음)
const shared = parseShareQuery(useRoute().query)

const backgroundEffect = computed(() => shared.effect ?? settings.value.backgroundEffect)

// 탁상시계로 켜 둘 때: 화면 꺼짐 방지 + 전체 화면
const keepScreenOn = computed({
  get: () => settings.value.keepScreenOn,
  set: (value) => { settings.value.keepScreenOn = value }
})
const { supported: wakeLockSupported } = useWakeLock(keepScreenOn)
const { supported: fullscreenSupported, isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const is12h = computed(() => shared.is12h ?? settings.value.timeFormat === '12h')
const animationIntensity = computed(() => settings.value.animationIntensity)

// 설정에서 고른 도시 (없으면 이 기기 시간대를 따름)
const savedCity = shared.city ?? localStorage.getItem('selectedCity')

const cityName = computed(() => {
  const city = savedCity || currentLocation.value?.city
  if (!city) return 'LOADING...'
  // 영어판은 공항 안내판처럼 대문자 영어 도시명
  return isEn.value ? city.toUpperCase() : getCityKoreanName(city)
})

const cityLabel = computed(() => shared.city ? t.value.shared : savedCity ? t.value.selected : t.value.here)

// IANA 시간대 → 서머타임 자동 반영
const timezone = computed(() => {
  if (savedCity) return getTimezoneByCity(savedCity)
  return currentLocation.value?.timezone
})

// 도시 이름이 길면 칸을 줄여 한 줄에 들어가게 함
const cityFlapStyle = computed(() => {
  const length = Math.max(cityName.value.length, 1)
  return {
    // 14vh: 가로로 눕힌 폰에서 시계가 화면 높이를 넘지 않게
    '--flap-w': `min(clamp(1.75rem, calc(11vw - 2px), 5.5rem), calc((100vw - 6rem) / ${length}), 14vh)`
  }
})

const zonedTime = computed(() => {
  if (!time.value) return null
  return timezone.value ? dayjs(time.value).tz(timezone.value) : dayjs(time.value)
})

// 시간을 시, 분, 초로 분리
const hours = computed(() => zonedTime.value?.format(is12h.value ? 'hh' : 'HH') ?? '00')
const minutes = computed(() => zonedTime.value?.format('mm') ?? '00')
const seconds = computed(() => zonedTime.value?.format('ss') ?? '00')
const currentDate = computed(() => {
  if (!zonedTime.value) return ''
  const date = zonedTime.value.locale(isEn.value ? 'en' : 'ko').format(t.value.dateFormat)
  // 12시간 표시일 때 오전/오후를 날짜 줄에 함께 보여 줌
  return is12h.value ? `${zonedTime.value.hour() < 12 ? t.value.am : t.value.pm} · ${date}` : date
})

// 자동(기기 시간대)이면 도시를 넣지 않음 → 받은 사람도 자기 시간대로 봄
const shareClock = () => shareLink(
  buildShareUrl(lp('/'), { city: savedCity ?? undefined, effect: backgroundEffect.value, is12h: is12h.value }),
  t.value.shareTitle,
  savedCity ? t.value.shareCity(isEn.value ? savedCity : cityName.value) : t.value.shareDefault
)


// 메뉴 사이드바: 열면 첫 항목에 초점, 닫으면 메뉴 버튼으로 돌려줌
const toolsOpen = ref(false)
const drawer = ref<HTMLElement | null>(null)
const menuButton = ref<{ $el: HTMLElement } | null>(null)
watch(toolsOpen, async (open) => {
  await nextTick()
  if (open) drawer.value?.querySelector<HTMLElement>('.drawer-item')?.focus()
  else menuButton.value?.$el?.focus()
})
const runTool = (run: () => void) => {
  toolsOpen.value = false
  run()
}

// 화면 켜두기·전체 화면·공유: 메뉴 사이드바 안에 그림
interface ClockAction {
  key: string
  icon: Component
  label: string
  title: string
  short: string
  hint: string
  on?: boolean
  pressed?: boolean
  run: () => void
}
const clockActions = computed<ClockAction[]>(() => {
  const actions: ClockAction[] = []
  if (wakeLockSupported) {
    actions.push({
      key: 'wake',
      icon: keepScreenOn.value ? BulbFilled : BulbOutlined,
      label: keepScreenOn.value ? t.value.wakeOff : t.value.wake,
      title: t.value.wake,
      short: t.value.wakeShort,
      hint: t.value.wakeHint,
      on: keepScreenOn.value,
      pressed: keepScreenOn.value,
      run: () => {
        keepScreenOn.value = !keepScreenOn.value
        message.info(keepScreenOn.value ? t.value.wakeOn : t.value.wakeOffToast)
      }
    })
  }
  if (fullscreenSupported) {
    actions.push({
      key: 'fullscreen',
      icon: isFullscreen.value ? FullscreenExitOutlined : FullscreenOutlined,
      label: isFullscreen.value ? t.value.fullscreenOff : t.value.fullscreen,
      title: t.value.fullscreen,
      short: t.value.fullShort,
      hint: t.value.fullscreen,
      run: toggleFullscreen
    })
  }
  actions.push({ key: 'share', icon: ShareAltOutlined, label: t.value.share, title: t.value.shareShort, short: t.value.shareShort, hint: t.value.share, run: shareClock })
  return actions
})

onMounted(async () => {
  loadSettings() // 설정 로드
  await getCurrentLocation()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Hide footer on mobile devices to prevent covering clock */
@media (max-width: 768px) {
  .desktop-only-footer {
    display: none;
  }
}

.layout {
  position: relative;
  z-index: 1; /* 고정된 배경(z-index 0) 위에 내용 표시 */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: transparent;
}

/* 머리말 막대 없음(폰·PC): 메뉴는 왼쪽 위, 설정은 오른쪽 위에 떠 있음 */
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: calc(env(safe-area-inset-top) + 12px) calc(env(safe-area-inset-right) + 12px) 0 calc(env(safe-area-inset-left) + 12px);
  pointer-events: none; /* 빈 곳은 아래 시계로 통과 */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 제목은 화면 낭독기용으로만 남김 */
.app-title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.header-start {
  display: flex;
  align-items: center;
}

.header .round-btn {
  pointer-events: auto;
  color: var(--color-fg-muted);
  background: rgba(var(--color-canvas-default-rgb), 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn {
  color: var(--color-accent-fg);
  border: none;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: var(--color-canvas-subtle);
  color: var(--color-accent-fg);
}

.gear-btn:hover {
  transform: rotate(90deg);
}

/* 메뉴·설정: 같은 동그란 버튼 */
.round-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.4);
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 21;
  width: min(300px, 85vw);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: calc(env(safe-area-inset-top) + 12px) 12px calc(env(safe-area-inset-bottom) + 12px) calc(env(safe-area-inset-left) + 12px);
  background: rgba(var(--color-canvas-default-rgb), 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(var(--color-border-default-rgb), 0.4);
  box-shadow: var(--shadow-large);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 8px;
}

.drawer-title {
  font-weight: 600;
  color: var(--color-fg-default);
}

.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 52px;
  padding: 8px 12px;
  border: none;
  border-radius: 12px;
  background: none;
  color: var(--color-fg-default);
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.drawer-item:hover,
.drawer-item:focus-visible {
  background: var(--color-canvas-subtle);
}

.drawer-item.is-on .drawer-icon {
  color: var(--color-accent-fg);
}

.drawer-icon {
  font-size: 20px;
  color: var(--color-fg-muted);
}

.drawer-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-text small {
  font-size: 0.78rem;
  color: var(--color-fg-muted);
}

.drawer-slide-enter-active,
.drawer-slide-leave-active,
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .drawer-slide-enter-active,
  .drawer-slide-leave-active,
  .drawer-fade-enter-active,
  .drawer-fade-leave-active {
    transition: none;
  }
}



.content {
  flex: 1;
  /* 시계가 첫 화면을 채우고 푸터는 스크롤해야 보임 */
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: transparent;
  position: relative;
  z-index: 1; /* 배경보다 앞에 표시하되 드롭다운보다는 뒤에 */
}

.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1040px;
  padding: 2rem;
  /* 반투명 유리: 뒤의 배경 효과가 은은하게 비침 */
  background: rgba(var(--color-canvas-default-rgb), 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 20px;
  border: 1px solid rgba(var(--color-border-default-rgb), 0.3);
  box-shadow: var(--shadow-large);
}

.city-display {
  animation: fadeInUp 0.6s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 0.6s ease-out;
  -moz-animation: fadeInUp 0.6s ease-out;
}

.city-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.city-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-fg-muted);
  text-align: center;
}

/* 모바일에서 도시 라벨 크기 증가 */
@media (max-width: 768px) {
  .city-label {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .city-label {
    font-size: 0.95rem;
  }
}

.time-display {
  animation: fadeInUp 0.8s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 0.8s ease-out;
  -moz-animation: fadeInUp 0.8s ease-out;
}

.time-units {
  /* 가로 화면에서 높이에 맞춤 (세로에선 22vh가 커서 영향 없음) */
  /* PC에서는 화면에 맞춰 더 크게 (최대 7rem), 시계 6칸이 가로에 들어가게 */
  --flap-w: min(clamp(1.75rem, calc(11vw - 2px), 7rem), 22vh, calc((100vw - 8rem) / 7.5));
  display: flex;
  align-items: center;
  gap: clamp(0.15rem, 1vw, 0.5rem);
  justify-content: center;
  flex-wrap: nowrap; /* 강제로 한 줄 유지 */
  white-space: nowrap; /* 줄바꿈 방지 */
}


.time-separator {
  font-size: clamp(1.25rem, 6vw, 3rem);
  font-weight: bold;
  color: var(--color-fg-default);
  font-family: 'Courier New', monospace;
  margin: 0 clamp(0.05rem, 0.8vw, 0.25rem);
  flex-shrink: 0;
  line-height: 1;
  opacity: 0.7;
  animation: pulse 2s ease-in-out infinite;
  /* 브라우저 호환성 */
  -webkit-animation: pulse 2s ease-in-out infinite;
  -moz-animation: pulse 2s ease-in-out infinite;
}


@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

@-webkit-keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

@-moz-keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

.date-info {
  animation: fadeInUp 1s ease-out;
  /* 브라우저 호환성 */
  -webkit-animation: fadeInUp 1s ease-out;
  -moz-animation: fadeInUp 1s ease-out;
}

.date-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-fg-muted);
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
    -webkit-transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    -webkit-transform: translateY(0);
  }
}

@-webkit-keyframes fadeInUp {
  from {
    opacity: 0;
    -webkit-transform: translateY(30px);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
  }
}

@-moz-keyframes fadeInUp {
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
  .content {
    padding: 16px;
  }
  
  .clock-container {
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .date-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 12px;
  }
  
  .clock-container {
    gap: 1rem;
    padding: 1rem;
  }
  
  .date-text {
    font-size: 0.9rem;
  }
}

/* 가로로 눕힌 폰 (탁상시계 거치): 머리말을 줄이고 시계를 화면 높이에 맞춤 */
@media (orientation: landscape) and (max-height: 500px) {
  .content {
    padding: 8px;
  }

  .clock-container {
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .city-label {
    display: none;
  }
}
.lang-pill {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  margin-top: -1rem;
  border-radius: 999px;
  color: var(--color-accent-fg);
  font-size: 0.95rem;
  text-decoration: none;
}

.lang-pill:hover {
  background: var(--color-canvas-subtle);
}

</style>
