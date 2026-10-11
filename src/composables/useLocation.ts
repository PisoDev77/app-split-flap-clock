import { ref } from 'vue'
import dayjs from '@/utils/dayjs'

/**
 * ## 도시·시간대 관리 컴포저블
 *
 * **이 기기의 시간대**를 감지하고 도시별 시간대를 관리합니다.
 *
 * ### 기능
 * - 기기 시간대(IANA) 감지 → 지원 도시와 연결 (GPS 권한 불필요)
 * - 도시별 IANA 시간대 제공 (서머타임 자동 반영)
 * - 현재 UTC 오프셋 계산
 *
 * @since 1.0.0
 */

export interface LocationInfo {
  /** 영어 도시명 (지원 목록에 없으면 IANA 이름의 마지막 부분) */
  city: string
  /** IANA 시간대 (예: 'Asia/Seoul') */
  timezone: string
}

const DEFAULT_TIMEZONE = 'Asia/Seoul'

const currentLocation = ref<LocationInfo | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// 주요 도시별 IANA 시간대 (서머타임은 브라우저 시간대 데이터가 자동 처리)
const CITY_TIMEZONE_MAP: Record<string, string> = {
  'Seoul': 'Asia/Seoul',
  'Tokyo': 'Asia/Tokyo',
  'New York': 'America/New_York',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Sydney': 'Australia/Sydney',
  'Los Angeles': 'America/Los_Angeles',
  'Beijing': 'Asia/Shanghai',
  'Singapore': 'Asia/Singapore',
  'Dubai': 'Asia/Dubai',
  'Busan': 'Asia/Seoul',
  'Incheon': 'Asia/Seoul',
  'Daegu': 'Asia/Seoul',
  'Daejeon': 'Asia/Seoul',
  'Gwangju': 'Asia/Seoul',
  'Ulsan': 'Asia/Seoul'
}

// 도시명 한국어 매핑
const CITY_KOREAN_MAP: Record<string, string> = {
  'Seoul': '서울',
  'Busan': '부산',
  'Incheon': '인천',
  'Daegu': '대구',
  'Daejeon': '대전',
  'Gwangju': '광주',
  'Ulsan': '울산',
  'Tokyo': '도쿄',
  'New York': '뉴욕',
  'London': '런던',
  'Paris': '파리',
  'Sydney': '시드니',
  'Los Angeles': '로스앤젤레스',
  'Beijing': '베이징',
  'Singapore': '싱가포르',
  'Dubai': '두바이'
}

/**
 * ## 기기 시간대 기준 현재 위치 조회
 *
 * 위치 권한 없이 **기기에 설정된 시간대**로 도시를 정합니다.
 * 지원 도시 중 같은 시간대가 있으면 그 도시, 없으면 시간대 이름의 도시를 씁니다.
 *
 * @returns {Promise<LocationInfo | null>} **위치 정보** (감지 실패 시 null)
 */
const getCurrentLocation = async (): Promise<LocationInfo | null> => {
  isLoading.value = true
  error.value = null

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!timezone) {
      throw new Error('timezone unavailable')
    }

    const supportedCity = Object.keys(CITY_TIMEZONE_MAP)
      .find(name => CITY_TIMEZONE_MAP[name] === timezone)
    const city = supportedCity || timezone.split('/').pop()!.replace(/_/g, ' ')

    currentLocation.value = { city, timezone }
    return currentLocation.value
  } catch {
    error.value = '이 기기의 시간대를 확인할 수 없습니다.'
    currentLocation.value = { city: 'Seoul', timezone: DEFAULT_TIMEZONE }
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * ## 도시별 시간대 조회
 *
 * @param {string} cityName - **영어 도시명**
 * @returns {string} **IANA 시간대** (예: 'America/New_York')
 */
const getTimezoneByCity = (cityName: string): string => {
  return CITY_TIMEZONE_MAP[cityName] || DEFAULT_TIMEZONE
}

/**
 * ## 현재 UTC 오프셋
 *
 * 서머타임을 반영한 **지금 시점의 오프셋**을 돌려줍니다.
 *
 * @param {string} timezone - **IANA 시간대**
 * @returns {string} **오프셋** (예: '-04:00')
 */
const getUtcOffset = (timezone: string): string => {
  return dayjs().tz(timezone).format('Z')
}

/**
 * ## 지원되는 도시 목록 조회
 *
 * @returns {Array<{name: string, timezone: string}>} **도시 목록** (IANA 시간대 포함)
 */
const getSupportedCities = () => {
  return Object.entries(CITY_TIMEZONE_MAP).map(([name, timezone]) => ({
    name,
    timezone
  }))
}

/**
 * ## 도시명 한국어 변환
 *
 * @param {string} cityName - **영어 도시명**
 * @returns {string} **한국어 도시명** 또는 원본 이름
 */
const getCityKoreanName = (cityName: string): string => {
  return CITY_KOREAN_MAP[cityName] || cityName
}

/**
 * ## 도시 표시명 가져오기
 *
 * @param {string} cityName - **영어 도시명**
 * @returns {string} **표시용 도시명** (예: '서울 (Seoul)')
 */
const getCityDisplayName = (cityName: string): string => {
  const koreanName = CITY_KOREAN_MAP[cityName]
  return koreanName ? `${koreanName} (${cityName})` : cityName
}

export function useLocation() {
  return {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    getTimezoneByCity,
    getUtcOffset,
    getSupportedCities,
    getCityKoreanName,
    getCityDisplayName
  }
}
