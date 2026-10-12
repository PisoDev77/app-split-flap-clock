import dayjs from '@/utils/dayjs'
import { CITIES, type City } from '@/utils/cityTime'

/**
 * ## 새해 카운트다운 계산
 *
 * - 1월 1일 하루 동안은 "새해 축하" 상태, 그 뒤로는 다음 해 1월 1일 0시까지 셈
 * - 모든 계산은 시간대별 0시(IANA) 기준이라 서머타임 지역도 정확함
 */

/** 이 시간대에서 지금 세고 있는 새해 (1월 1일 당일이면 그 해) */
export const targetYear = (timezone: string, now = dayjs()): number => {
  const local = now.tz(timezone)
  return local.month() === 0 && local.date() === 1 ? local.year() : local.year() + 1
}

/** 이 시간대의 새해 0시 */
export const newYearMoment = (timezone: string, year: number) =>
  dayjs.tz(`${year}-01-01 00:00:00`, timezone)

export const isCelebrating = (timezone: string, now = dayjs()): boolean => {
  const local = now.tz(timezone)
  return local.month() === 0 && local.date() === 1
}

/** 남은 시간을 일·시·분·초로 */
export const splitRemaining = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  }
}

/**
 * 세계 도시가 새해를 맞는 순서 (빠른 곳부터)
 * 같은 해의 1월 1일 0시를 비교 → 오클랜드가 가장 먼저
 */
export const worldOrder = (year: number): { city: City, at: dayjs.Dayjs }[] =>
  CITIES
    .map(city => ({ city, at: newYearMoment(city.timezone, year) }))
    .sort((a, b) => a.at.valueOf() - b.at.valueOf())
