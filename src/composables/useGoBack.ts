import { useRouter } from 'vue-router'

/**
 * ## 뒤로 가기
 *
 * 앱 안에서 온 페이지가 있으면 그곳으로, 링크·북마크로 바로 들어와
 * 돌아갈 곳이 없으면 홈으로 갑니다. (history.back만 쓰면 아무 반응이 없거나 앱을 벗어남)
 */
export function useGoBack() {
  const router = useRouter()
  return () => {
    if (window.history.state?.back) {
      router.back()
    } else {
      router.push('/')
    }
  }
}
