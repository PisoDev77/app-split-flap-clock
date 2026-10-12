import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * ## 언어 (한국어 기본, 영어는 /en 아래)
 *
 * - 주소가 `/en`으로 시작하면 영어
 * - `lp('/study')` → 지금 언어에 맞는 주소 ('/study' 또는 '/en/study')
 * - 화면 문구는 각 화면에 `{ ko: {...}, en: {...} }`로 두고 `pick()`으로 고름
 */

export type Locale = 'ko' | 'en'

export const isEnPath = (path: string): boolean => path === '/en' || path.startsWith('/en/')

/** 같은 주소로 한국어·영어판이 모두 있는 페이지 (/timezone ↔ /en/world-clock은 따로) */
const PAIRED = ['/', '/study', '/countdown/new-year', '/time-converter', '/widget', '/settings', '/privacy']

/** 한국어 주소 ↔ 영어 주소 짝 (검색엔진 hreflang, 언어 바꾸기 링크용). 짝이 없으면 undefined */
export const alternatePath = (path: string): string | undefined => {
  if (isEnPath(path)) {
    const ko = path === '/en' ? '/' : path.slice(3)
    if (ko === '/world-clock') return '/timezone'
    return PAIRED.includes(ko) || ko.startsWith('/time/') ? ko : undefined
  }
  if (path === '/timezone') return '/en/world-clock'
  if (path === '/') return '/en'
  return PAIRED.includes(path) || path.startsWith('/time/') ? `/en${path}` : undefined
}

export function useLocale() {
  const route = useRoute()
  const locale = computed<Locale>(() => isEnPath(route.path) ? 'en' : 'ko')
  const isEn = computed(() => locale.value === 'en')

  const lp = (path: string): string => {
    if (!isEn.value) return path
    return path === '/' ? '/en' : `/en${path}`
  }

  const pick = <T>(texts: Record<Locale, T>) => computed(() => texts[locale.value])

  return { locale, isEn, lp, pick }
}
