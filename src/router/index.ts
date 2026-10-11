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
  },
  {
    // 등록되지 않은 모든 주소
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '페이지를 찾을 수 없음'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 새 페이지는 맨 위에서, 뒤로 가기는 이전 위치에서 시작
  scrollBehavior: (_to, _from, savedPosition) => savedPosition || { top: 0 }
})

router.beforeEach((to) => {
  // 홈은 제목이 앱 이름과 같아서 'Split Flap Clock | Split Flap Clock'처럼 겹치지 않게 함
  const title = to.meta.title as string | undefined
  document.title = title && title !== 'Split Flap Clock' ? `${title} | Split Flap Clock` : 'Split Flap Clock'
})

export default router