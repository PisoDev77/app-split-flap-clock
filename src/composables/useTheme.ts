import { ref, computed, watch } from 'vue'

interface ThemeConfig {
  token?: Record<string, any>
  algorithm?: any
}

/**
 * ## 테마 관리 컴포저블
 * 
 * **라이트/다크 모드** 전환과 Ant Design Vue 테마 설정을 관리합니다.
 * 
 * ### 기능
 * - 다크/라이트 모드 전환
 * - 시스템 테마 자동 감지
 * - 로컬 스토리지 저장
 * - Ant Design Vue 테마 동기화
 * 
 * @since 1.0.0
 */

type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('system')
const isDarkMode = ref(false)

// GitHub 스타일 색상 팔레트
const GITHUB_COLORS = {
  light: {
    colorPrimary: '#0969da',
    colorSuccess: '#1a7f37',
    colorWarning: '#9a6700',
    colorError: '#d1242f',
    colorInfo: '#0969da',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f6f8fa',
    colorBorder: '#d1d9e0',
    colorText: '#24292f',
    colorTextSecondary: '#656d76'
  },
  dark: {
    colorPrimary: '#58a6ff',
    colorSuccess: '#3fb950',
    colorWarning: '#d29922',
    colorError: '#f85149',
    colorInfo: '#58a6ff',
    colorBgContainer: '#0d1117',
    colorBgElevated: '#161b22',
    colorBorder: '#30363d',
    colorText: '#f0f6fc',
    colorTextSecondary: '#8b949e'
  }
}

/**
 * ## Ant Design Vue 테마 설정
 * 
 * **현재 테마 모드**에 따른 Ant Design Vue 테마 설정을 반환합니다.
 * 
 * @returns {ThemeConfig} **Ant Design Vue 테마 설정 객체**
 */
const themeConfig = computed<ThemeConfig>(() => {
  const colors = isDarkMode.value ? GITHUB_COLORS.dark : GITHUB_COLORS.light
  
  return {
    token: {
      colorPrimary: colors.colorPrimary,
      colorSuccess: colors.colorSuccess,
      colorWarning: colors.colorWarning,
      colorError: colors.colorError,
      colorInfo: colors.colorInfo,
      colorBgContainer: colors.colorBgContainer,
      colorBgElevated: colors.colorBgElevated,
      colorBorder: colors.colorBorder,
      colorText: colors.colorText,
      colorTextSecondary: colors.colorTextSecondary,
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
    components: {
      Layout: {
        colorBgHeader: colors.colorBgContainer,
        colorBgBody: colors.colorBgContainer
      },
      Button: {
        borderRadius: 6,
        controlHeight: 36
      },
      Input: {
        borderRadius: 6,
        controlHeight: 36
      },
      Card: {
        borderRadius: 8
      }
    }
  }
})

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
    themeConfig,
    setThemeMode,
    toggleTheme,
    initializeTheme,
    detectSystemTheme
  }
}