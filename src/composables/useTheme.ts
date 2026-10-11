import { ref, watch } from 'vue'


/**
 * ## 테마 관리 컴포저블
 * 
 * **라이트/다크 모드** 전환을 관리합니다. 색은 style.css의 CSS 변수가 담당합니다.
 * 
 * ### 기능
 * - 다크/라이트 모드 전환
 * - 시스템 테마 자동 감지
 * - 로컬 스토리지 저장
 * 
 * @since 1.0.0
 */

type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('system')
const isDarkMode = ref(false)

/**
 * ## 시스템 테마 감지
 * 
 * **브라우저의 다크 모드 설정**을 감지합니다.
 * 
 * @returns {boolean} **다크 모드 여부**
 */
const detectSystemTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * ## 테마 모드 설정
 * 
 * **테마 모드를 변경**하고 관련 설정을 업데이트합니다.
 * 
 * @param {ThemeMode} mode - **설정할 테마 모드**
 * 
 * @example
 * ```typescript
 * setThemeMode('dark')   // 다크 모드 강제 설정
 * setThemeMode('system') // 시스템 설정 따름
 * ```
 */
const setThemeMode = (mode: ThemeMode): void => {
  themeMode.value = mode
  localStorage.setItem('theme-mode', mode)
  
  updateTheme()
}

/**
 * ## 테마 업데이트
 * 
 * **현재 테마 설정에 따라** DOM과 CSS 변수를 업데이트합니다.
 */
const updateTheme = (): void => {
  let shouldBeDark = false
  
  switch (themeMode.value) {
    case 'dark':
      shouldBeDark = true
      break
    case 'light':
      shouldBeDark = false
      break
    case 'system':
      shouldBeDark = detectSystemTheme()
      break
  }
  
  isDarkMode.value = shouldBeDark
  
  // DOM 클래스 업데이트
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.classList.toggle('dark-theme', shouldBeDark)
    appElement.classList.toggle('light-theme', !shouldBeDark)
  }
  
  // HTML data-theme 속성 업데이트
  document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light')
  
  // 메타 테마 컬러 업데이트 (PWA)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', shouldBeDark ? '#0d1117' : '#ffffff')
  }
}

/**
 * ## 테마 토글
 * 
 * **라이트/다크 모드**를 토글합니다.
 * 
 * @example
 * ```typescript
 * toggleTheme() // 현재 모드와 반대로 전환
 * ```
 */
const toggleTheme = (): void => {
  const newMode = isDarkMode.value ? 'light' : 'dark'
  setThemeMode(newMode)
}

/**
 * ## 테마 초기화
 * 
 * **저장된 설정**을 불러와서 테마를 초기화합니다.
 */
const initializeTheme = (): void => {
  const savedMode = localStorage.getItem('theme-mode') as ThemeMode
  themeMode.value = savedMode || 'system'
  
  updateTheme()
  
  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeMode.value === 'system') {
      updateTheme()
    }
  })
}

// 테마 변경 시 업데이트
watch(themeMode, updateTheme)

export function useTheme() {
  return {
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleTheme,
    initializeTheme,
    detectSystemTheme
  }
}