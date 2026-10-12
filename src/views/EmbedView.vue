<template>
  <div class="embed" :lang="isEnglish ? 'en' : 'ko'">
    <div class="embed-clock" role="timer" :aria-label="ariaLabel">
      <div v-if="showCity" class="embed-city">
        <SplitFlapDisplay :text="cityText" :label="isEnglish ? 'City' : '도시'" />
      </div>
      <div class="embed-time">
        <SplitFlapDisplay :text="hours" :label="isEnglish ? 'Hour' : '시'" />
        <span class="sep" aria-hidden="true">:</span>
        <SplitFlapDisplay :text="minutes" :label="isEnglish ? 'Minute' : '분'" />
        <template v-if="showSeconds">
          <span class="sep" aria-hidden="true">:</span>
          <SplitFlapDisplay :text="seconds" :label="isEnglish ? 'Second' : '초'" />
        </template>
      </div>
      <p v-if="ampm" class="embed-ampm">{{ ampm }}</p>
    </div>
    <a class="embed-brand" :href="brandHref" target="_blank" rel="noopener">
      {{ isEnglish ? 'Flip Clock ↗' : '플립시계 ↗' }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import { useTheme } from '@/composables/useTheme'
import { deviceTimezone, findCity } from '@/utils/cityTime'
import dayjs from '@/utils/dayjs'

/**
 * ## 블로그·노션에 붙이는 시계 위젯 (/embed)
 *
 * 다른 사이트의 iframe 안에서 열리는 화면. 머리말·푸터·설치 안내 없이 시계만.
 * - ?city=seoul  도시 (없으면 보는 사람 기기 시간대)
 * - ?h=12        12시간 표시 (기본 24)
 * - ?s=0         초 숨기기 (기본 보임)
 * - ?theme=light|dark  (기본: 보는 사람 기기 설정)  ※ 저장하지 않음
 * - ?lang=en     영어
 * 이 주소만 다른 사이트에서 iframe으로 열 수 있음 (netlify.toml)
 * 위젯 만들기 화면: /widget
 */

const route = useRoute()
const q = (key: string) => {
  const value = route.query[key]
  return (Array.isArray(value) ? value[0] : value) ?? undefined
}

const isEnglish = q('lang') === 'en'
const city = findCity(String(q('city')))
const timezone = city?.timezone ?? deviceTimezone()
const is12h = q('h') === '12'
const showSeconds = q('s') !== '0'
const showCity = !!city

const theme = q('theme')
if (theme === 'light' || theme === 'dark') {
  useTheme().applyThemeTemporarily(theme)
}

const cityText = city ? (isEnglish ? city.en.toUpperCase() : city.ko) : ''

const now = ref(dayjs())
const zoned = computed(() => now.value.tz(timezone))
const hours = computed(() => zoned.value.format(is12h ? 'hh' : 'HH'))
const minutes = computed(() => zoned.value.format('mm'))
const seconds = computed(() => zoned.value.format('ss'))
const ampm = computed(() => {
  if (!is12h) return ''
  const pm = zoned.value.hour() >= 12
  return isEnglish ? (pm ? 'PM' : 'AM') : (pm ? '오후' : '오전')
})

const ariaLabel = city
  ? (isEnglish ? `${city.en} time` : `${city.ko} 현재 시간`)
  : (isEnglish ? 'Current time' : '현재 시간')

// 위젯을 누르면 같은 도시의 페이지로 (보는 사람을 사이트로 데려옴)
const brandHref = `https://piso-split-flap.netlify.app${isEnglish ? '/en' : ''}${city ? `/time/${city.slug}` : ''}`

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = dayjs()
  timer = setInterval(() => { now.value = dayjs() }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.embed {
  position: relative;
  container-type: inline-size;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 12px 12px 28px;
  box-sizing: border-box;
  background: var(--color-canvas-default);
  overflow: hidden;
}

.embed-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 위젯 칸 너비에 맞춰 플랩 크기 결정 (초까지 6칸 + 구분자) */
.embed-time,
.embed-city {
  --flap-w: min(calc((100cqw - 64px) / 6.6), 72px);
  display: flex;
  align-items: center;
  gap: 3px;
}

.embed-city {
  --flap-w: min(calc((100cqw - 64px) / 9), 40px);
}

.sep {
  color: var(--color-fg-muted);
  font-size: clamp(1rem, 6cqw, 2rem);
  font-weight: 700;
  margin: 0 1px;
}

.embed-ampm {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: 0.85rem;
}

.embed-brand {
  position: absolute;
  right: 10px;
  bottom: 6px;
  color: var(--color-fg-muted);
  font-size: 11px;
  text-decoration: none;
}

.embed-brand:hover {
  color: var(--color-accent-fg);
  text-decoration: underline;
}
</style>
