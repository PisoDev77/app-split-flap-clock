import dayjs from '@/utils/dayjs'
import cities from '@/data/cities.json'

/**
 * ## 도시별 현재 시간 페이지용 데이터·계산
 *
 * 도시 목록은 `src/data/cities.json` 하나만 고치면 됩니다.
 * (빌드 후 `scripts/prerender.mjs`가 같은 파일로 검색용 HTML과 sitemap을 만듦)
 */

export interface City {
  slug: string
  en: string
  ko: string
  country: string
  region: string
  timezone: string
  tip: string
}

export const CITIES = cities as City[]

export const SEOUL_TZ = 'Asia/Seoul'

export const findCity = (slug: string): City | undefined =>
  CITIES.find(city => city.slug === slug)

/** 검색 결과 제목 (뒤에 ' | Split Flap Clock'이 붙음). scripts/prerender.mjs도 같은 규칙 */
export const cityTitle = (city: City): string =>
  city.slug === 'seoul' ? '한국 시간 · 서울 현재 시간' : `${city.ko} 현재 시간 · 서울 시차`

export const cityDescription = (city: City): string =>
  city.slug === 'seoul'
    ? '지금 한국 시간(서울, UTC+9)을 플립시계로 보여 줍니다. 해외에서 한국이 몇 시인지 확인할 때 켜 두세요.'
    : `${city.ko}(${city.country}) 지금 몇 시인지 플립시계로 보여 줍니다. 서울과의 시차, 서머타임 여부, 서울 시간 변환표를 한눈에 확인하세요.`

/** 영어 도시명 → 페이지 주소 (세계 시간대 목록에서 링크할 때) */
export const cityPath = (en: string): string | undefined => {
  const city = CITIES.find(c => c.en === en)
  return city ? `/time/${city.slug}` : undefined
}

/** 지금 시점의 UTC 오프셋(분). 서머타임 반영 */
const offsetMinutes = (timezone: string, at = dayjs()): number => at.tz(timezone).utcOffset()

/** 'UTC+9', 'UTC-4', 'UTC+5:30' */
export const formatOffset = (minutes: number): string => {
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
}

export const currentOffset = (timezone: string, at = dayjs()): string => formatOffset(offsetMinutes(timezone, at))

/** 시간 차이(분)를 '13시간', '30분', '5시간 30분'으로 */
const formatGap = (minutes: number): string => {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return [h ? `${h}시간` : '', m ? `${m}분` : ''].filter(Boolean).join(' ')
}

/** 서울 기준 시차 문장. 예: '서울보다 13시간 느려요' */
export const gapFromSeoul = (timezone: string, at = dayjs()): string => {
  const diff = offsetMinutes(timezone, at) - offsetMinutes(SEOUL_TZ, at)
  if (diff === 0) return '서울과 시차가 없어요'
  return `서울보다 ${formatGap(diff)} ${diff > 0 ? '빨라요' : '느려요'}`
}

/**
 * 서머타임 사용 여부: 1월과 7월의 오프셋이 다르면 서머타임이 있음
 * @returns 서머타임이 없으면 null
 */
export const dstOffsets = (timezone: string): { standard: string, summer: string } | null => {
  const year = dayjs().year()
  const jan = offsetMinutes(timezone, dayjs.utc(`${year}-01-15T12:00:00Z`))
  const jul = offsetMinutes(timezone, dayjs.utc(`${year}-07-15T12:00:00Z`))
  if (jan === jul) return null
  return { standard: formatOffset(Math.min(jan, jul)), summer: formatOffset(Math.max(jan, jul)) }
}

/** 서울 시각 → 이 도시 시각 변환표 (오늘 날짜 기준) */
export const conversionRows = (timezone: string, seoulHours = [9, 12, 18, 22]) => {
  const today = dayjs().tz(SEOUL_TZ).format('YYYY-MM-DD')
  return seoulHours.map(hour => {
    const seoul = dayjs.tz(`${today} ${String(hour).padStart(2, '0')}:00`, SEOUL_TZ)
    const local = seoul.tz(timezone)
    const localDate = local.format('YYYY-MM-DD')
    return {
      seoul: seoul.format('A h시'),
      local: local.format('A h:mm'),
      day: localDate < today ? '전날' : localDate > today ? '다음 날' : ''
    }
  })
}
