# PWA 아이콘 생성 가이드

## 🎨 아이콘 생성 방법

### 1. 자동 생성기 사용 (권장)
1. 브라우저에서 `/public/icons/generate-icons.html` 파일을 열어주세요
2. 페이지가 로드되면 자동으로 모든 크기의 아이콘이 생성됩니다
3. 각 아이콘 아래의 "다운로드" 버튼을 클릭하여 PNG 파일들을 다운로드하세요
4. 다운로드한 파일들을 `public/icons/` 폴더에 저장하세요

### 2. 필요한 아이콘 크기들
- ✅ icon-72x72.png (Android Chrome)
- ✅ icon-96x96.png (Android Chrome)  
- ✅ icon-128x128.png (Android Chrome)
- ✅ icon-144x144.png (Android Chrome)
- ✅ icon-152x152.png (iOS Safari)
- ✅ icon-192x192.png (Android Chrome)
- ✅ icon-384x384.png (Android Chrome)
- ✅ icon-512x512.png (Android Chrome)

### 3. 현재 생성된 파일들
- ✅ `/public/favicon.svg` (브라우저 탭 아이콘)
- ✅ `/public/icons/icon.svg` (마스터 아이콘)
- ✅ `/public/icons/generate-icons.html` (아이콘 생성기)
- ✅ `/public/manifest.json` (PWA 매니페스트 - 업데이트됨)
- ✅ `/index.html` (메타 태그 추가됨)

## 🚀 PWA 기능 확인

### 개발 서버에서 테스트
```bash
npm run build
npm run preview
```

### 확인할 항목들
1. **브라우저 주소창**: 설치 버튼이 나타나는지 확인
2. **개발자 도구 > Application > Manifest**: 매니페스트 정보 확인
3. **개발자 도구 > Application > Service Workers**: SW 등록 확인
4. **개발자 도구 > Lighthouse**: PWA 점수 확인

## 📱 모바일 테스트

### iOS Safari
1. 사이트 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 아이콘과 이름 확인

### Android Chrome
1. 사이트 접속
2. 메뉴 → "홈 화면에 추가" 또는 자동 설치 프롬프트
3. 독립 실행형 앱으로 실행 확인

## 🎯 다음 단계
1. 아이콘 파일들 생성 완료
2. Google AdSense 통합
3. 프로덕션 배포 준비
4. Google Play Store 업로드