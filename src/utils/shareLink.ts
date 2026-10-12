import type { LocationQuery } from 'vue-router'
import { BACKGROUND_EFFECT_OPTIONS, type BackgroundEffect } from '@/composables/useSettings'
import { CITIES } from '@/utils/cityTime'
import { message } from '@/composables/useToast'

/**
 * ## 공유 링크
 *
 * 지금 보는 시계 모양을 주소에 담아 보냄: `/?city=tokyo&fx=snow&h=12`
 * - 받은 사람은 그 모양으로 보지만 자기 설정은 바뀌지 않음 (저장하지 않음)
 * - 이상한 값은 무시하고 받은 사람 설정을 씀
 */

const SITE_URL = 'https://piso-split-flap.netlify.app'

export interface ShareView {
  /** 영어 도시명 (useLocation과 같은 값) */
  city?: string
  effect?: BackgroundEffect
  is12h?: boolean
}

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
  return view
}

export const buildShareUrl = (path: string, view: ShareView): string => {
  const params = new URLSearchParams()
  const city = CITIES.find(c => c.en === view.city)
  if (city) params.set('city', city.slug)
  if (view.effect) params.set('fx', view.effect)
  if (view.is12h !== undefined) params.set('h', view.is12h ? '12' : '24')
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
