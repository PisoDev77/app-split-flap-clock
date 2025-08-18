# 브라우저 호환성 테스트 가이드

## 🎯 목표 브라우저 지원
- **Chrome**: 90+ (2021년 4월 이후)
- **Safari**: 14+ (iOS 14+, macOS Big Sur+)
- **Firefox**: 88+ (2021년 4월 이후)
- **Edge**: 90+ (2021년 4월 이후)
- **Samsung Internet**: 14+
- **Opera**: 76+

## ✅ 적용된 호환성 개선 사항

### 1. CSS 호환성
- **-webkit- prefix**: 모든 transform, animation, clip-path에 추가
- **-moz- prefix**: Firefox 전용 속성 지원
- **CSS 변수 fallback**: 구형 브라우저를 위한 기본값 설정

```css
/* 적용 예시 */
.flap-unit {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  -moz-transform-style: preserve-3d;
}

@keyframes flipTop { /* ... */ }
@-webkit-keyframes flipTop { /* ... */ }
@-moz-keyframes flipTop { /* ... */ }
```

### 2. JavaScript API 호환성
- **Service Worker**: 지원하지 않는 브라우저에서 graceful degradation
- **Geolocation API**: HTTPS 환경 체크 및 타임아웃 연장
- **navigator.onLine**: 지원하지 않는 환경에서 fallback

### 3. PWA 호환성
- **beforeinstallprompt**: Chrome 계열에서만 지원되는 이벤트 처리
- **Service Worker 등록**: 지원하지 않는 브라우저에서 에러 방지

## 🧪 테스트 체크리스트

### Chrome (90+)
- [ ] **기본 기능**: 시계 표시, 스플릿플랩 애니메이션
- [ ] **PWA 설치**: 설치 프롬프트 표시 및 정상 설치
- [ ] **오프라인 기능**: Service Worker 동작, 캐시 활용
- [ ] **위치 서비스**: Geolocation API 정상 동작
- [ ] **반응형 디자인**: 모든 화면 크기에서 정상 표시

### Safari (14+)
- [ ] **webkit prefix**: CSS 애니메이션 정상 동작
- [ ] **clip-path**: 스플릿플랩 분할 표시 정상
- [ ] **Service Worker**: 캐싱 및 오프라인 기능
- [ ] **모바일 Safari**: iOS에서 정상 동작
- [ ] **PWA 설치**: Add to Home Screen 기능

### Firefox (88+)
- [ ] **-moz- prefix**: Firefox 전용 CSS 속성
- [ ] **CSS Grid/Flexbox**: 레이아웃 정상 표시
- [ ] **Service Worker**: 백그라운드 캐싱
- [ ] **Geolocation**: 위치 서비스 동작
- [ ] **SUIT 폰트**: 웹폰트 로딩 및 표시

### Edge (90+)
- [ ] **Chromium 기반**: Chrome과 동일한 기능
- [ ] **PWA 설치**: Microsoft Store 연동
- [ ] **Windows 통합**: 시스템 알림, 테마 연동
- [ ] **접근성**: 스크린 리더 호환성

## 🔧 테스트 방법

### 1. 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 테스트
npm run build
npm run preview
```

### 2. 크로스 브라우저 테스트
1. **BrowserStack** 또는 **Sauce Labs** 사용
2. **각 브라우저별 개발자 도구** 활용
3. **실제 기기에서 테스트** (iOS Safari, Android Chrome)

### 3. PWA 기능 테스트
- **설치 프롬프트**: Chrome DevTools > Application > Manifest
- **Service Worker**: Application > Service Workers
- **캐시 확인**: Application > Storage > Cache Storage
- **오프라인 테스트**: Network 탭에서 Offline 모드

### 4. 모바일 테스트
- **Chrome DevTools**: Device Toolbar로 시뮬레이션
- **실제 기기 연결**: USB 디버깅 또는 wireless debugging
- **Touch 인터랙션**: 터치 스크롤, 버튼 탭 확인

## ⚠️ 알려진 제한사항

### Safari 관련
- **Fullscreen API**: 제한적 지원
- **Background Sync**: 지원하지 않음
- **Web Push**: iOS 16.4+ 부분적 지원

### Firefox 관련
- **Web Manifest**: 일부 속성 미지원
- **Installation Prompt**: 브라우저별 다른 UX

### 구형 브라우저
- **IE 11**: 지원하지 않음 (Vue 3 요구사항)
- **Chrome < 90**: 일부 최신 CSS 기능 제한
- **Safari < 14**: iOS 14 미만 기기 제외

## 📊 성능 테스트

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 브라우저별 성능
- **Chrome**: 기준 성능
- **Safari**: 특히 iOS에서 메모리 사용량 확인
- **Firefox**: 스플릿플랩 애니메이션 최적화 필요시
- **Edge**: Chrome과 유사한 성능 예상

## 🚀 배포 전 최종 체크

1. **모든 타겟 브라우저에서 기본 기능 동작 확인**
2. **PWA 설치 및 오프라인 기능 테스트**
3. **모바일 환경에서 터치 인터랙션 확인**
4. **성능 지표 측정 및 최적화**
5. **접근성 테스트 (스크린 리더, 키보드 네비게이션)**

## 📱 모바일 브라우저 특별 고려사항

### iOS Safari
- **Viewport 메타태그**: 확대/축소 방지
- **Safe Area**: 노치 대응
- **Home Screen 아이콘**: 다양한 크기 지원

### Android Chrome
- **PWA 설치**: 더 나은 설치 경험
- **Background Sync**: 백그라운드 동기화
- **Web Share API**: 네이티브 공유 기능

## 🔄 지속적인 호환성 관리

1. **브라우저 업데이트 모니터링**
2. **Can I Use 체크**: 새로운 기능 도입시
3. **Polyfill 고려**: 필요한 기능에 대해
4. **사용자 피드백 수집**: 실제 환경에서의 문제점
5. **정기적인 호환성 테스트**: 월 1회 권장