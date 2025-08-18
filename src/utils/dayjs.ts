/**
 * ## Day.js 설정
 * 
 * **Day.js 라이브러리**의 플러그인과 로케일을 중앙에서 관리합니다.
 * 
 * ### 설정 내용
 * - UTC 플러그인
 * - 타임존 플러그인
 * - 한국어 로케일
 * 
 * @since 1.0.0
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ko'

// 플러그인 설정
dayjs.extend(utc)
dayjs.extend(timezone)

// 한국어 로케일 설정
dayjs.locale('ko')

export default dayjs