import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import pages from '@/data/pages.json'
import { findCity, cityTitle, cityDescription } from '@/utils/cityTime'
import { alternatePath, isEnPath } from '@/composables/useLocale'

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
 * - `/study` - 공부 시계 (집중 타이머)
 * - `/faq` - 자주 묻는 질문
 * - `/settings` - 설정 화면
 * - `/privacy` - 개인정보처리방침
 * - `/en`, `/en/study`, `/en/time/:slug`, `/en/world-clock`, `/en/settings`, `/en/privacy` - 영어판
 * 
 * 페이지 제목·설명은 src/data/pages.json에 있음
 * (빌드 후 scripts/prerender.mjs가 같은 파일로 검색용 HTML을 만듦)
 * 
 * @since 1.0.0
 */

type PagePath = keyof typeof pages

// 목록에 없는 도시는 404 화면으로 (주소는 그대로)
const cityGuard = (to: { params: { slug?: string | string[] }, path: string }) => findCity(String(to.params.slug))
  ? true
  : { name: 'NotFound', params: { pathMatch: to.path.slice(1).split('/') }, replace: true }

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
    beforeEnter: cityGuard
  },
  page('/study', 'Study', () => import('@/views/StudyView.vue')),
  page('/faq', 'FAQ', () => import('@/views/FaqView.vue')),
  page('/settings', 'Settings', () => import('@/views/SettingsView.vue')),
  page('/privacy', 'Privacy', () => import('@/views/PrivacyView.vue')),

  // 영어판: 같은 화면을 쓰고, 화면이 주소(/en)를 보고 문구를 바꿈
  page('/en', 'HomeEn', () => import('@/views/HomeView.vue')),
  page('/en/study', 'StudyEn', () => import('@/views/StudyView.vue')),
  page('/en/world-clock', 'WorldClockEn', () => import('@/views/WorldClockView.vue')),
  page('/en/settings', 'SettingsEn', () => import('@/views/SettingsView.vue')),
  page('/en/privacy', 'PrivacyEn', () => import('@/views/PrivacyView.vue')),
  {
    path: '/en/time/:slug',
    name: 'CityTimeEn',
    component: () => import('@/views/CityTimeView.vue'),
    beforeEnter: cityGuard
  },
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

// 한국어·영어 짝 페이지를 검색엔진에 알림 (prerender.mjs도 같은 태그를 넣음)
const setAlternates = (path: string, noindex: boolean) => {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove())
  const other = noindex ? undefined : alternatePath(path)
  if (!other) return
  const ko = isEnPath(path) ? other : path
  const en = isEnPath(path) ? path : other
  for (const [lang, href] of [['ko', ko], ['en', en], ['x-default', ko]]) {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = lang
    link.href = SITE_URL + href
    document.head.appendChild(link)
  }
}

router.beforeEach((to) => {
  let title = to.meta.title as string | undefined
  let description = to.meta.description as string | undefined

  const locale = isEnPath(to.path) ? 'en' : 'ko'
  const city = (to.name === 'CityTime' || to.name === 'CityTimeEn') ? findCity(String(to.params.slug)) : undefined
  if (city) {
    title = cityTitle(city, locale)
    description = cityDescription(city, locale)
  }
  if (to.name === 'NotFound' && locale === 'en') {
    title = 'Page not found'
    description = 'This page could not be found.'
  }

  // 홈은 fullTitle을 그대로 (앱 이름이 겹치지 않게)
  const fullTitle = to.meta.fullTitle as string | undefined
  document.title = fullTitle ?? (title ? `${title} | Split Flap Clock` : 'Split Flap Clock')
  document.documentElement.lang = locale
  setMeta('meta[property="og:locale"]', 'content', locale === 'en' ? 'en_US' : 'ko_KR')

  if (description) {
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:description"]', 'content', description)
  }
  const url = SITE_URL + (to.meta.noindex ? '/' : to.path)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[property="og:url"]', 'content', url)
  // 없는 주소는 서버가 200으로 답하므로 검색 결과에서 빼 달라고 표시
  setMeta('meta[name="robots"]', 'content', to.meta.noindex ? 'noindex, follow' : 'index, follow')
  setAlternates(to.path, !!to.meta.noindex)
})

export default router
