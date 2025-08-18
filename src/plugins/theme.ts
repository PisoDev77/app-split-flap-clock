/**
 * ## 테마 초기화 플러그인
 * 
 * **애플리케이션 테마**를 시스템 설정에 따라 초기화합니다.
 * 
 * ### 기능
 * - 시스템 다크모드 감지
 * - 로컬 스토리지 테마 설정 복원
 * - CSS 커스텀 프로퍼티 적용
 * 
 * @example
 * ```typescript
 * import { setupTheme } from '@/plugins/theme'
 * setupTheme()
 * ```
 * 
 * @since 1.0.0
 */
export function setupTheme(): void {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark
  
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  
  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
  })
}