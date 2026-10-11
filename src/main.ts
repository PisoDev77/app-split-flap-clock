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
const app = createApp(App)

app.use(router)

// 테마 초기화
const { initializeTheme } = useTheme()
initializeTheme()

app.mount('#app')