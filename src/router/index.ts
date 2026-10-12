import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import pages from '@/data/pages.json'
import { findCity, cityTitle, cityDescription } from '@/utils/cityTime'

/**
 * ## 라우터 설정
 * 
 * **Vue Router**를 사용한 앱 내 페이지 라우팅을 설정합니다.
 * 
 * ### 라우트 목록
 * - `/` - 메인 시계 화면
 * - `/about` - 앱 소개
 * - `/guide` - 사용법 가이드
 * - `/timezone` - 세계 시간대 정보
 * - `/time/:slug` - 도시별 현재 시간 (도시 목록: src/data/cities.json)
 * - `/faq` - 자주 묻는 질문
 * - `/settings` - 설정 화면
 * - `/privacy` - 개인정보처리방침
 * 
 * 페이지 제목·설명은 src/data/pages.json에 있음
 * (빌드 후 scripts/prerender.mjs가 같은 파일로 검색용 HTML을 만듦)
 * 
 * @since 1.0.0
 */

type PagePath = keyof typeof pages

const page = (path: PagePath, name: string, component: RouteRecordRaw['component']): RouteRecordRaw => ({
  path,
  name,
  component: component!,
  meta: { ...pages[path] }
})

const routes: RouteRecordRaw[] = [
  page('/', 'Home', () => import('@/views/HomeView.vue')),
  page('/about', 'About', () => import('@/views/AboutView.vue')),
  page('/guide', 'Guide', () => import('@/views/GuideView.vue')),
  page('/timezone', 'Timezone', () => import('@/views/TimezoneView.vue')),
  {
    path: '/time/:slug',
    name: 'CityTime',
    component: () => import('@/views/CityTimeView.vue'),
    // 목록에 없는 도시는 404 화면으로 (주소는 그대로)
    beforeEnter: (to) => findCity(String(to.params.slug))
      ? true
      : { name: 'NotFound', params: { pathMatch: to.path.slice(1).split('/') }, replace: true }
  },
  page('/faq', 'FAQ', () => import('@/views/FaqView.vue')),
  page('/settings', 'Settings', () => import('@/views/SettingsView.vue')),
  page('/privacy', 'Privacy', () => import('@/views/PrivacyView.vue')),
  {
    // 등록되지 않은 모든 주소
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '페이지를 찾을 수 없음',
      description: '요청한 페이지를 찾을 수 없습니다.',
      noindex: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 새 페이지는 맨 위에서, 뒤로 가기는 이전 위치에서 시작
  scrollBehavior: (_to, _from, savedPosition) => savedPosition || { top: 0 }
})

const SITE_URL = 'https://piso-split-flap.netlify.app'

// 페이지마다 검색·공유용 정보를 맞춤 (SPA라 index.html 하나를 같이 쓰기 때문)
const setMeta = (selector: string, attr: string, value: string) => {
  document.querySelector(selector)?.setAttribute(attr, value)
}

router.beforeEach((to) => {
  let title = to.meta.title as string | undefined
  let description = to.meta.description as string | undefined

  const city = to.name === 'CityTime' ? findCity(String(to.params.slug)) : undefined
  if (city) {
    title = cityTitle(city)
    description = cityDescription(city)
  }

  // 홈은 제목이 앱 이름과 같아서 'Split Flap Clock | Split Flap Clock'처럼 겹치지 않게 함
  document.title = title && title !== 'Split Flap Clock'
    ? `${title} | Split Flap Clock`
    : '플립시계 Split Flap Clock - 무료 온라인 탁상시계·세계시계'

  if (description) {
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:description"]', 'content', description)
  }
  const url = SITE_URL + (to.meta.noindex ? '/' : to.path)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[property="og:url"]', 'content', url)
  // 없는 주소는 서버가 200으로 답하므로 검색 결과에서 빼 달라고 표시
  setMeta('meta[name="robots"]', 'content', to.meta.noindex ? 'noindex, follow' : 'index, follow')
})

export default router
