import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'
import './style.css'
import './components/ui/ui.css'

/**
 * ## Vue 앱 초기화
 * 
 * **Vue 3 애플리케이션**을 생성하고 필요한 플러그인들을 설정합니다.
 * 
 * ### 설정 내용
 * - Vue Router 설정
 * - UI 부품은 src/components/ui (직접 만든 가벼운 컴포넌트)
 * - 테마 시스템 초기화
 * 
 * @since 1.0.0
 */
// 새로 배포된 뒤 옛 화면이 없는 파일을 부르면 한 번만 새로고침 (하얀 화면 방지)
window.addEventListener('vite:preloadError', event => {
  if (sessionStorage.getItem('preload-reload')) return
  sessionStorage.setItem('preload-reload', '1')
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('preload-reload'), 10000))

const app = createApp(App)

app.use(router)

// 테마 초기화
const { initializeTheme } = useTheme()
initializeTheme()

app.mount('#app')