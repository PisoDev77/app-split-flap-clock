import { ref } from 'vue'

/**
 * ## 위치 정보 관리 컴포저블
 * 
 * **사용자의 지리적 위치**를 가져오고 도시명과 시간대를 관리합니다.
 * 
 * ### 기능
 * - 브라우저 지오로케이션 API 사용
 * - 위도/경도를 도시명으로 변환
 * - 시간대 정보 제공
 * - 오류 처리 및 폴백
 * 
 * @since 1.0.0
 */

interface LocationInfo {
  city: string
  country: string
  timezone: string
  latitude: number
  longitude: number
}

const currentLocation = ref<LocationInfo | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// 주요 도시별 시간대 매핑
const CITY_TIMEZONE_MAP: Record<string, string> = {
  'Seoul': '+09:00',
  'Tokyo': '+09:00',
  'New York': '-05:00',
  'London': '+00:00',
  'Paris': '+01:00',
  'Sydney': '+11:00',
  'Los Angeles': '-08:00',
  'Beijing': '+08:00',
  'Singapore': '+08:00',
  'Dubai': '+04:00'
}

/**
 * ## 현재 위치 조회
 * 
 * **브라우저의 지오로케이션 API**를 사용하여 사용자의 현재 위치를 가져옵니다.
 * 
 * @returns {Promise<LocationInfo | null>} **위치 정보 객체** 또는 null
 * 
 * @example
 * ```typescript
 * const location = await getCurrentLocation()
 * console.log(location?.city) // 'Seoul'
 * ```
 */
const getCurrentLocation = async (): Promise<LocationInfo | null> => {
  // 브라우저 호환성 확인
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    error.value = '이 브라우저는 위치 서비스를 지원하지 않습니다.'
    console.warn('Geolocation API를 지원하지 않는 브라우저입니다.')
    return null
  }

  isLoading.value = true
  error.value = null

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      // HTTPS 환경이 아닌 경우 경고
      if (typeof location !== 'undefined' && location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('Geolocation API는 HTTPS 환경에서만 정상 작동합니다.')
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000, // iOS Safari 호환성을 위해 시간 연장
        maximumAge: 300000 // 5분
      })
    })

    const { latitude, longitude } = position.coords
    
    // 실제 앱에서는 역지오코딩 API를 사용해야 합니다
    // 여기서는 예시를 위해 기본값을 사용합니다
    const locationInfo: LocationInfo = {
      city: await getCityFromCoordinates(latitude, longitude),
      country: 'South Korea',
      timezone: '+09:00',
      latitude,
      longitude
    }

    currentLocation.value = locationInfo
    return locationInfo

  } catch (err) {
    console.error('위치 조회 실패:', err)
    error.value = '위치 정보를 가져올 수 없습니다.'
    
    // 폴백: 기본 위치 설정
    const fallbackLocation: LocationInfo = {
      city: 'Seoul',
      country: 'South Korea',
      timezone: '+09:00',
      latitude: 37.5665,
      longitude: 126.9780
    }
    
    currentLocation.value = fallbackLocation
    return fallbackLocation
    
  } finally {
    isLoading.value = false
  }
}

/**
 * ## 좌표를 도시명으로 변환
 * 
 * **위도와 경도 정보**를 사용하여 해당 지역의 도시명을 조회합니다.
 * 
 * @param {number} lat - **위도**
 * @param {number} lng - **경도**
 * @returns {Promise<string>} **도시명**
 * 
 * @example
 * ```typescript
 * const city = await getCityFromCoordinates(37.5665, 126.9780)
 * console.log(city) // 'Seoul'
 * ```
 */
const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    // 실제 구현에서는 OpenStreetMap Nominatim이나 Google Geocoding API 사용
    // 여기서는 간단한 구역별 매핑을 사용합니다
    
    // 한국 지역 판별
    if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
      if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) {
        return 'Seoul'
      } else if (lat >= 35.0 && lat <= 35.3 && lng >= 128.9 && lng <= 129.3) {
        return 'Busan'
      } else {
        return 'Seoul' // 기본값
      }
    }
    
    // 일본 지역
    if (lat >= 35.5 && lat <= 35.8 && lng >= 139.6 && lng <= 139.9) {
      return 'Tokyo'
    }
    
    // 기타 지역은 기본값
    return 'Seoul'
    
  } catch (error) {
    console.error('도시명 조회 실패:', error)
    return 'Seoul'
  }
}

/**
 * ## 도시별 시간대 조회
 * 
 * **도시명을 기반**으로 해당 지역의 시간대를 반환합니다.
 * 
 * @param {string} cityName - **도시명**
 * @returns {string} **시간대 오프셋** (예: '+09:00')
 * 
 * @example
 * ```typescript
 * const timezone = getTimezoneByCity('Seoul')
 * console.log(timezone) // '+09:00'
 * ```
 */
const getTimezoneByCity = (cityName: string): string => {
  return CITY_TIMEZONE_MAP[cityName] || '+09:00'
}

/**
 * ## 지원되는 도시 목록 조회
 * 
 * **사용자가 선택할 수 있는** 도시 목록을 반환합니다.
 * 
 * @returns {Array<{name: string, timezone: string}>} **도시 목록**
 */
const getSupportedCities = () => {
  return Object.entries(CITY_TIMEZONE_MAP).map(([name, timezone]) => ({
    name,
    timezone
  }))
}

export function useLocation() {
  return {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    getCityFromCoordinates,
    getTimezoneByCity,
    getSupportedCities
  }
}