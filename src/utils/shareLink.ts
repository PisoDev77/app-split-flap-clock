import type { LocationQuery } from 'vue-router'
import { BACKGROUND_EFFECT_OPTIONS, type BackgroundEffect } from '@/composables/useSettings'
import { CITIES } from '@/utils/cityTime'
import { message } from '@/composables/useToast'
import { DDAY_NAME_MAX, MESSAGE_LINE_MAX, type Dday } from '@/composables/useBoard'

/**
 * ## 공유 링크
 *
 * 지금 보는 판을 주소에 담아 보냄
 * - 시계: `/?city=tokyo&fx=snow&h=12`
 * - D-day: `/?dd=여행&d=2026-12-24` (+ `k=s` 며칠째, `y=1` 매년 반복)
 * - 문구: `/?m1=공부 중&m2=말 걸지 마`
 * - 받은 사람은 그 모양으로 보지만 자기 설정은 바뀌지 않음 (저장하지 않음)
 * - 이상한 값은 무시하고 받은 사람 설정을 씀
 */

const SITE_URL = 'https://piso-split-flap.netlify.app'

export interface ShareView {
  /** 영어 도시명 (useLocation과 같은 값) */
  city?: string
  effect?: BackgroundEffect
  is12h?: boolean
  dday?: Omit<Dday, 'id'>
  message?: [string, string]
}

const clip = (text: string, max: number) => Array.from(text.trim()).slice(0, max).join('')

const first = (value: LocationQuery[string]): string | undefined =>
  (Array.isArray(value) ? value[0] : value) ?? undefined

export const parseShareQuery = (query: LocationQuery): ShareView => {
  const view: ShareView = {}
  const slug = first(query.city)
  const city = CITIES.find(c => c.slug === slug)
  if (city) view.city = city.en

  const fx = first(query.fx)
  if (BACKGROUND_EFFECT_OPTIONS.some(option => option.value === fx)) view.effect = fx as BackgroundEffect

  const h = first(query.h)
  if (h === '12' || h === '24') view.is12h = h === '12'

  const name = clip(first(query.dd) ?? '', DDAY_NAME_MAX)
  const date = first(query.d) ?? ''
  if (name && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date))) {
    const kind = first(query.k) === 's' ? 'since' : 'until'
    view.dday = { name, date, kind, yearly: kind === 'until' && first(query.y) === '1' }
  }

  const lines: [string, string] = [clip(first(query.m1) ?? '', MESSAGE_LINE_MAX), clip(first(query.m2) ?? '', MESSAGE_LINE_MAX)]
  if (lines[0] || lines[1]) view.message = lines
  return view
}

export const buildShareUrl = (path: string, view: ShareView): string => {
  const params = new URLSearchParams()
  const city = CITIES.find(c => c.en === view.city)
  if (city) params.set('city', city.slug)
  if (view.effect) params.set('fx', view.effect)
  if (view.is12h !== undefined) params.set('h', view.is12h ? '12' : '24')
  if (view.dday) {
    params.set('dd', view.dday.name)
    params.set('d', view.dday.date)
    if (view.dday.kind === 'since') params.set('k', 's')
    else if (view.dday.yearly) params.set('y', '1')
  }
  if (view.message) {
    if (view.message[0]) params.set('m1', view.message[0])
    if (view.message[1]) params.set('m2', view.message[1])
  }
  const query = params.toString()
  return `${SITE_URL}${path}${query ? `?${query}` : ''}`
}

/**
 * 폰은 공유 창(카카오톡 등), 지원하지 않으면 주소 복사
 * 공유 창을 사용자가 닫은 경우(AbortError)는 조용히 끝냄
 */
export const shareLink = async (url: string, title: string, text: string): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ url, title, text })
      return
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return
    }
  }
  const en = document.documentElement.lang === 'en'
  try {
    await navigator.clipboard.writeText(url)
    message.success(en ? 'Link copied' : '링크를 복사했어요')
  } catch {
    message.error(en ? "Couldn't copy the link" : '링크를 복사하지 못했어요')
  }
}
