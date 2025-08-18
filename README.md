# 🔄 Split Flap Clock

**분할 플랩 디스플레이로 시간과 도시를 표시하는 PWA 시계 앱**

## 🚀 Netlify 무료 배포 준비 완료!

### 배포 방법 (3분 완성)
1. `npm run build` 실행
2. `dist` 폴더를 [netlify.com](https://netlify.com)에 드래그 앤 드롭  
3. **완료!** 자동으로 HTTPS URL 생성됨

📖 **상세 가이드**: [NETLIFY-DEPLOY.md](./NETLIFY-DEPLOY.md)

## ✨ 주요 기능

- 🎯 **분할 플랩 디스플레이**: 전통적인 공항/기차역 시계 스타일의 애니메이션
- 🌍 **위치 기반 시간**: GPS를 활용한 자동 위치 감지 및 시간 표시
- 🏙️ **다중 도시 지원**: 전 세계 주요 도시의 시간 표시
- 🌙 **다크/라이트 모드**: GitHub 스타일의 테마 시스템
- 📱 **PWA 지원**: 네이티브 앱처럼 설치 및 사용 가능
- 💰 **광고 수익화**: Google AdSense 통합
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 UI

## 🛠️ 기술 스택

- **Frontend**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Ant Design Vue
- **PWA**: Vite PWA Plugin + Workbox
- **Date/Time**: Day.js
- **Styling**: CSS3 + CSS Custom Properties
- **Monetization**: Google AdSense

## 🚀 시작하기

### 필수 조건

- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run typecheck

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📦 프로젝트 구조

```
split-flap/
├── public/
│   ├── manifest.json          # PWA 매니페스트
│   └── *.png                  # PWA 아이콘들
├── src/
│   ├── components/            # Vue 컴포넌트
│   │   ├── SplitFlapDisplay.vue     # 분할 플랩 디스플레이
│   │   ├── AdBanner.vue             # 광고 배너
│   │   └── PWAInstallPrompt.vue     # PWA 설치 프롬프트
│   ├── composables/           # Vue 컴포저블
│   │   ├── useLocation.ts           # 위치 관리
│   │   ├── useTime.ts              # 시간 관리
│   │   └── useTheme.ts             # 테마 관리
│   ├── views/                 # 페이지 뷰
│   │   ├── HomeView.vue            # 메인 시계 화면
│   │   └── SettingsView.vue        # 설정 화면
│   ├── plugins/               # Vue 플러그인
│   │   ├── ant-design.ts           # Ant Design Vue 설정
│   │   └── theme.ts                # 테마 초기화
│   ├── utils/                 # 유틸리티 함수
│   │   └── pwa.ts                  # PWA 관련 기능
│   ├── router/                # Vue Router 설정
│   └── style.css              # 글로벌 스타일
├── vite.config.ts             # Vite 설정
├── tsconfig.json              # TypeScript 설정
└── package.json               # 프로젝트 의존성
```

## 🎨 주요 컴포넌트

### SplitFlapDisplay.vue
- 분할 플랩 보드 스타일의 텍스트 애니메이션
- 문자별 개별 플립 효과
- 반응형 크기 조정

### 위치 기반 시간 시스템
- Geolocation API를 활용한 현재 위치 감지
- 주요 도시별 시간대 매핑
- 수동 도시 선택 기능

### 테마 시스템
- GitHub 스타일 라이트/다크 테마
- 시스템 설정 자동 감지
- CSS Custom Properties 활용

## 📱 PWA 기능

- **오프라인 지원**: 서비스 워커를 통한 캐싱
- **설치 가능**: 홈 화면에 추가 가능
- **업데이트 알림**: 자동 업데이트 감지
- **반응형 아이콘**: 다양한 크기의 앱 아이콘

## 💰 수익화

Google AdSense를 통한 광고 수익화가 구현되어 있습니다:

1. `index.html`에서 AdSense 스크립트 로드
2. `AdBanner.vue`에서 광고 단위 표시
3. 개발 환경에서는 플레이스홀더 표시

### AdSense 설정

`index.html`과 `AdBanner.vue`에서 다음 값들을 실제 AdSense 정보로 교체하세요:

```html
<!-- 실제 AdSense 클라이언트 ID로 교체 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX"></script>
```

```vue
<!-- 실제 광고 슬롯 ID로 교체 -->
<ins class="adsbygoogle"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX">
```

## 🌐 Google Play Store 배포

이 앱은 PWA로 구현되어 Google Play Store에 배포 가능합니다:

1. **TWA (Trusted Web Activity)** 사용
2. **Android Studio**로 TWA 프로젝트 생성
3. **Digital Asset Links** 설정
4. **Google Play Console**에 업로드

### 배포 준비사항

- [ ] HTTPS 호스팅 설정
- [ ] PWA 매니페스트 검증
- [ ] 서비스 워커 테스트
- [ ] AdSense 승인 및 설정
- [ ] 앱 아이콘 및 스크린샷 준비

## 🔧 개발 가이드

### 코딩 컨벤션

- **변수**: camelCase
- **상수**: UPPER_SNAKE_CASE  
- **함수**: camelCase (동사+명사 패턴)
- **클래스**: PascalCase
- **컴포넌트**: PascalCase
- **불린값**: is/has/can/should 접두사 사용

### JSDoc 주석

모든 함수와 컴포넌트에 한국어 JSDoc 주석 작성:

```typescript
/**
 * ## 함수 설명
 * 
 * **주요 기능**에 대한 설명입니다.
 * 
 * @param {type} param - **매개변수 설명**
 * @returns {type} **반환값 설명**
 * 
 * @example
 * ```typescript
 * const result = functionName(param)
 * ```
 */
```

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Vue.js](https://vuejs.org/) - 프레임워크
- [Ant Design Vue](https://antdv.com/) - UI 컴포넌트
- [Vite](https://vitejs.dev/) - 빌드 도구
- [Day.js](https://day.js.org/) - 날짜/시간 라이브러리

---

**Split Flap Clock** - 아름다운 분할 플랩 디스플레이로 시간을 표현하는 PWA 앱 ⏰