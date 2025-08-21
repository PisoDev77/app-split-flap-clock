import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
 * - `/faq` - 자주 묻는 질문
 * - `/settings` - 설정 화면
 * - `/privacy` - 개인정보처리방침
 * 
 * @since 1.0.0
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Split Flap Clock'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: '소개'
    }
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue'),
    meta: {
      title: '사용법 가이드'
    }
  },
  {
    path: '/timezone',
    name: 'Timezone',
    component: () => import('@/views/TimezoneView.vue'),
    meta: {
      title: '세계 시간대'
    }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/FaqView.vue'),
    meta: {
      title: '자주 묻는 질문'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: '설정'
    }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: {
      title: '개인정보처리방침'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = `${to.meta.title} | Split Flap Clock`
})

export default router