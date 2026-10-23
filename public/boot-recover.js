// 하얀 화면 자동 회복 (2026-10-21)
// 옛 서비스 워커가 준 옛 index.html이 지금은 없는(또는 잘못 저장된) js·css 조각을 부르면
// 앱이 안 뜨고 하얀 화면으로 멈춤. 그럴 때 탭마다 한 번만: 그 파일을 새로 받고,
// 서비스 워커·캐시를 지운 뒤 새로고침. (CSP가 인라인 스크립트를 막아서 파일로 둠)
;(function () {
  var KEY = 'flip-recovered'

  function recover (url) {
    if (!navigator.onLine) return // 오프라인이면 캐시를 지우면 더 나빠짐
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch (e) {
      return // 기록을 못 하면 새로고침이 반복될 수 있어 아무것도 안 함
    }
    var jobs = []
    // 브라우저에 1년짜리로 잘못 저장된 파일이면 새로 받아 덮어씀
    if (url) jobs.push(fetch(url, { cache: 'reload' }))
    if ('serviceWorker' in navigator) {
      jobs.push(navigator.serviceWorker.getRegistrations().then(function (list) {
        return Promise.all(list.map(function (r) { return r.unregister() }))
      }))
    }
    if (window.caches) {
      jobs.push(caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k) }))
      }))
    }
    Promise.all(jobs.map(function (job) { return job.catch(function () {}) })).then(function () {
      location.reload()
    })
  }

  // <script type="module">·modulepreload·css 조각을 못 불러온 경우 (MIME 오류 포함)
  window.addEventListener('error', function (event) {
    var el = event.target
    var url = el && (el.src || el.href)
    if (url && /\/assets\//.test(url) && (el.tagName === 'SCRIPT' || el.tagName === 'LINK')) recover(url)
  }, true)

  // 화면을 옮길 때 나눠 둔 조각을 못 불러온 경우 (Vite가 보내는 신호)
  window.addEventListener('vite:preloadError', function () { recover() })
})()
