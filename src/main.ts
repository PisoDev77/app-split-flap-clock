import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupTheme } from './plugins/theme'
import { useTheme } from './composables/useTheme'
import './style.css'

/**
 * ## Vue 앱 초기화
 * 
 * **Vue 3 애플리케이션**을 생성하고 필요한 플러그인들을 설정합니다.
 * 
 * ### 설정 내용
 * - Vue Router 설정
 * - Ant Design Vue 컴포넌트는 각 화면에서 필요한 것만 import
 * - 테마 시스템 초기화
 * 
 * @since 1.0.0
 */
const app = createApp(App)

app.use(router)
setupTheme()

// 테마 초기화
const { initializeTheme } = useTheme()
initializeTheme()

app.mount('#app')