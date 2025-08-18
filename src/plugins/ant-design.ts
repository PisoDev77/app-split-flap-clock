import type { App } from 'vue'
import {
  Button,
  Layout,
  Switch,
  Select,
  Card,
  Space,
  Typography,
  ConfigProvider,
  message
} from 'ant-design-vue'

/**
 * ## Ant Design Vue 플러그인 설정
 * 
 * **필요한 Ant Design Vue 컴포넌트들**을 전역으로 등록합니다.
 * 
 * ### 등록 컴포넌트
 * - Button, Layout, Switch, Select
 * - Card, Space, Row, Col
 * - Typography, ConfigProvider
 * - Message (전역 메시지 서비스)
 * 
 * @param {App} app - **Vue 앱 인스턴스**
 * 
 * @example
 * ```typescript
 * import { setupAntDesign } from '@/plugins/ant-design'
 * setupAntDesign(app)
 * ```
 * 
 * @since 1.0.0
 */
export function setupAntDesign(app: App): void {
  app.use(Button)
  app.use(Layout)
  app.use(Switch)
  app.use(Select)
  app.use(Card)
  app.use(Space)
  app.use(Typography)
  app.use(ConfigProvider)
  
  app.config.globalProperties.$message = message
}