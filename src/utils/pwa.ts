/**
 * ## PWA 유틸리티
 * 
 * **PWA 관련 기능**을 제공하는 유틸리티 함수들입니다.
 * 
 * ### 기능
 * - 설치 프롬프트 관리
 * - 업데이트 알림
 * - 오프라인 상태 감지
 * 
 * @since 1.0.0
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

/**
 * ## PWA 설치 가능 여부 확인
 * 
 * **앱이 설치 가능한 상태**인지 확인합니다.
 * 
 * @returns {boolean} **설치 가능 여부**
 * 
 * @example
 * ```typescript
 * if (canInstallPWA()) {
 *   showInstallButton()
 * }
 * ```
 */
export const canInstallPWA = (): boolean => {
  return deferredPrompt !== null
}

/**
 * ## PWA 설치 프롬프트 표시
 * 
 * **브라우저의 PWA 설치 프롬프트**를 표시합니다.
 * 
 * @returns {Promise<boolean>} **사용자가 설치를 승인했는지 여부**
 * 
 * @example
 * ```typescript
 * const installed = await showInstallPrompt()
 * if (installed) {
 *   console.log('앱이 설치되었습니다!')
 * }
 * ```
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('설치 프롬프트를 사용할 수 없습니다.')
    return false
  }

  try {
    await deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    
    if (choiceResult.outcome === 'accepted') {
      console.log('사용자가 PWA 설치를 승인했습니다.')
      deferredPrompt = null
      return true
    } else {
      console.log('사용자가 PWA 설치를 취소했습니다.')
      return false
    }
  } catch (error) {
    console.error('PWA 설치 프롬프트 오류:', error)
    return false
  }
}

/**
 * ## PWA 이벤트 리스너 설정
 * 
 * **PWA 관련 이벤트들**을 등록합니다.
 * 
 * @example
 * ```typescript
 * setupPWAListeners()
 * ```
 */
export const setupPWAListeners = (): void => {
  // beforeinstallprompt 이벤트 리스너
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    console.log('PWA 설치 프롬프트가 준비되었습니다.')
    
    // 커스텀 설치 버튼 표시 이벤트 발생
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  })

  // appinstalled 이벤트 리스너
  window.addEventListener('appinstalled', () => {
    console.log('PWA가 성공적으로 설치되었습니다.')
    deferredPrompt = null
    
    // 설치 완료 이벤트 발생
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })
}

/**
 * ## 오프라인 상태 감지
 * 
 * **네트워크 연결 상태**를 확인합니다.
 * 
 * @returns {boolean} **온라인 상태 여부**
 * 
 * @example
 * ```typescript
 * if (isOnline()) {
 *   fetchData()
 * } else {
 *   showOfflineMessage()
 * }
 * ```
 */
export const isOnline = (): boolean => {
  // navigator.onLine 브라우저 호환성 확인
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine
  }
  // 브라우저에서 지원하지 않는 경우 온라인으로 가정
  return true
}

/**
 * ## 네트워크 상태 변경 리스너 설정
 * 
 * **온라인/오프라인 상태 변경**을 감지하는 리스너를 설정합니다.
 * 
 * @param {(isOnline: boolean) => void} callback - **상태 변경 콜백**
 * 
 * @example
 * ```typescript
 * setupNetworkListeners((online) => {
 *   if (online) {
 *     console.log('온라인 상태')
 *   } else {
 *     console.log('오프라인 상태')
 *   }
 * })
 * ```
 */
export const setupNetworkListeners = (callback: (isOnline: boolean) => void): void => {
  window.addEventListener('online', () => {
    console.log('네트워크 연결됨')
    callback(true)
  })

  window.addEventListener('offline', () => {
    console.log('네트워크 연결 끊김')
    callback(false)
  })
}

/**
 * ## 앱 업데이트 확인
 * 
 * **서비스 워커를 통해 앱 업데이트**를 확인합니다.
 * 
 * @returns {Promise<boolean>} **업데이트 가능 여부**
 * 
 * @example
 * ```typescript
 * const hasUpdate = await checkForUpdate()
 * if (hasUpdate) {
 *   showUpdateNotification()
 * }
 * ```
 */
export const checkForUpdate = async (): Promise<boolean> => {
  // 브라우저 호환성 확인
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker를 지원하지 않는 브라우저입니다.')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    
    return new Promise((resolve) => {
      const worker = registration.installing || registration.waiting
      if (worker) {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            resolve(true)
          }
        })
      } else {
        resolve(false)
      }
    })
  } catch (error) {
    console.error('업데이트 확인 실패:', error)
    return false
  }
}

/**
 * ## 앱 업데이트 적용
 * 
 * **대기 중인 서비스 워커를 활성화**하여 업데이트를 적용합니다.
 * 
 * @example
 * ```typescript
 * await applyUpdate()
 * window.location.reload()
 * ```
 */
export const applyUpdate = async (): Promise<void> => {
  // 브라우저 호환성 확인
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker를 지원하지 않는 브라우저입니다.')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const worker = registration.waiting
    
    if (worker) {
      worker.postMessage({ type: 'SKIP_WAITING' })
      
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          window.location.reload()
        }
      })
    }
  } catch (error) {
    console.error('업데이트 적용 실패:', error)
  }
}