import { ref, onUnmounted } from 'vue'
import dayjs from '@/utils/dayjs'

/**
 * ## 시간 관리 컴포저블
 * 
 * **실시간 시간 업데이트**와 시간대 관리를 제공합니다.
 * 
 * ### 기능
 * - 매초 시간 업데이트
 * - 시간대별 시간 계산
 * - 타이머 시작/중지
 * - 날짜 포맷팅
 * 
 * @since 1.0.0
 */


const currentTime = ref<Date>(new Date())
const isRunning = ref(false)

let timer: NodeJS.Timeout | null = null

/**
 * ## 시간 타이머 시작
 * 
 * **매초마다 현재 시간**을 업데이트하는 타이머를 시작합니다.
 * 
 * @example
 * ```typescript
 * startTimer()
 * ```
 */
const startTimer = (): void => {
  if (isRunning.value) return
  
  isRunning.value = true
  currentTime.value = new Date()
  
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

/**
 * ## 시간 타이머 중지
 * 
 * **실행 중인 타이머**를 중지합니다.
 * 
 * @example
 * ```typescript
 * stopTimer()
 * ```
 */
const stopTimer = (): void => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  isRunning.value = false
}

/**
 * ## 시간대별 시간 계산
 * 
 * **특정 시간대의 현재 시간**을 반환합니다.
 * 
 * @param {string} timezoneOffset - **시간대 오프셋** (예: '+09:00', '-05:00')
 * @param {string} format - **시간 포맷** (기본값: 'HH:mm:ss')
 * @returns {string} **포맷된 시간**
 * 
 * @example
 * ```typescript
 * const seoulTime = getTimeByTimezone('+09:00')
 * console.log(seoulTime) // '15:30:45'
 * ```
 */
const getTimeByTimezone = (timezoneOffset: string, format: string = 'HH:mm:ss'): string => {
  const now = dayjs()
  
  // 오프셋 파싱 (+09:00 -> +9, -05:00 -> -5)
  const sign = timezoneOffset.charAt(0) === '+' ? 1 : -1
  const hours = parseInt(timezoneOffset.slice(1, 3))
  const minutes = parseInt(timezoneOffset.slice(4, 6))
  const offsetMinutes = sign * (hours * 60 + minutes)
  
  return now.utc().add(offsetMinutes, 'minute').format(format)
}

/**
 * ## 시간대별 날짜 계산
 * 
 * **특정 시간대의 현재 날짜**를 반환합니다.
 * 
 * @param {string} timezoneOffset - **시간대 오프셋**
 * @param {string} format - **날짜 포맷** (기본값: 'YYYY-MM-DD')
 * @returns {string} **포맷된 날짜**
 * 
 * @example
 * ```typescript
 * const date = getDateByTimezone('+09:00', 'YYYY년 M월 D일')
 * console.log(date) // '2024년 3월 15일'
 * ```
 */
const getDateByTimezone = (timezoneOffset: string, format: string = 'YYYY-MM-DD'): string => {
  const now = dayjs()
  
  const sign = timezoneOffset.charAt(0) === '+' ? 1 : -1
  const hours = parseInt(timezoneOffset.slice(1, 3))
  const minutes = parseInt(timezoneOffset.slice(4, 6))
  const offsetMinutes = sign * (hours * 60 + minutes)
  
  return now.utc().add(offsetMinutes, 'minute').format(format)
}

/**
 * ## 현재 시각의 시간대 오프셋 계산
 * 
 * **브라우저의 현재 시간대**를 오프셋 형태로 반환합니다.
 * 
 * @returns {string} **시간대 오프셋**
 * 
 * @example
 * ```typescript
 * const offset = getCurrentTimezoneOffset()
 * console.log(offset) // '+09:00'
 * ```
 */
const getCurrentTimezoneOffset = (): string => {
  const now = new Date()
  const offsetMinutes = -now.getTimezoneOffset()
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
  const offsetMins = Math.abs(offsetMinutes) % 60
  const sign = offsetMinutes >= 0 ? '+' : '-'
  
  return `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`
}

/**
 * ## 두 시간대 간 시차 계산
 * 
 * **두 시간대 사이의 시차**를 시간 단위로 계산합니다.
 * 
 * @param {string} timezone1 - **첫 번째 시간대**
 * @param {string} timezone2 - **두 번째 시간대**
 * @returns {number} **시차 (시간 단위)**
 * 
 * @example
 * ```typescript
 * const diff = getTimeDifference('+09:00', '-05:00')
 * console.log(diff) // 14
 * ```
 */
const getTimeDifference = (timezone1: string, timezone2: string): number => {
  const parseOffset = (offset: string): number => {
    const sign = offset.charAt(0) === '+' ? 1 : -1
    const hours = parseInt(offset.slice(1, 3))
    const minutes = parseInt(offset.slice(4, 6))
    return sign * (hours + minutes / 60)
  }
  
  return parseOffset(timezone1) - parseOffset(timezone2)
}

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  stopTimer()
})

export function useTime() {
  return {
    currentTime,
    isRunning,
    startTimer,
    stopTimer,
    getTimeByTimezone,
    getDateByTimezone,
    getCurrentTimezoneOffset,
    getTimeDifference
  }
}