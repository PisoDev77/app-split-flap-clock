/**
 * ## 미디어 쿼리 변경 감지
 *
 * 오래된 iOS Safari(14 미만)는 MediaQueryList.addEventListener가 없어 오류가 나므로
 * addListener로 대체합니다. 반환값을 호출하면 감지를 멈춥니다.
 */
export function onMediaQueryChange(query: string, handler: (event: MediaQueryListEvent) => void): () => void {
  const list = window.matchMedia(query)
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', handler)
    return () => list.removeEventListener('change', handler)
  }
  list.addListener(handler)
  return () => list.removeListener(handler)
}
