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
      title: 'Split Flap Clock',
      description: '공항·기차역 플립시계를 그대로 옮긴 무료 온라인 탁상시계. 설치·광고·위치 권한 없이 바로 쓰고, 서울·뉴욕·런던 등 세계 시간과 배경 효과 6가지를 지원합니다.'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: '소개',
      description: 'Split Flap Clock(플립시계)이 무엇이고 어떤 기능과 디자인 철학을 담았는지 소개합니다.'
    }
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue'),
    meta: {
      title: '사용법 가이드',
      description: '플립시계 사용법: 도시와 시간대 바꾸기, 다크 모드, 배경 효과, 화면 켜두기, 홈 화면에 설치하는 방법.'
    }
  },
  {
    path: '/timezone',
    name: 'Timezone',
    component: () => import('@/views/TimezoneView.vue'),
    meta: {
      title: '세계 시간대',
      description: '서울·도쿄·뉴욕·런던·파리·시드니 등 세계 주요 20개 도시의 현재 시간과 시차를 서머타임까지 반영해 보여 줍니다.'
    }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/FaqView.vue'),
    meta: {
      title: '자주 묻는 질문',
      description: '플립시계 자주 묻는 질문: 무료인지, 오프라인에서도 되는지, 시간이 맞지 않을 때와 설정이 저장되지 않을 때 해결 방법.'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: '설정',
      description: '플립시계 설정: 도시, 테마, 배경 효과, 시간 표시 방식을 바꿉니다.'
    }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: {
      title: '개인정보처리방침',
      description: 'Split Flap Clock 개인정보처리방침. 위치와 개인 데이터를 수집하지 않으며 설정은 기기 안에만 저장됩니다.'
    }
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

router.beforeEach((to) => {
  // 홈은 제목이 앱 이름과 같아서 'Split Flap Clock | Split Flap Clock'처럼 겹치지 않게 함
  const title = to.meta.title as string | undefined
  document.title = title && title !== 'Split Flap Clock'
    ? `${title} | Split Flap Clock`
    : '플립시계 Split Flap Clock - 무료 온라인 탁상시계·세계시계'

  const description = to.meta.description as string | undefined
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