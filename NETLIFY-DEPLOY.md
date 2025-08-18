# Netlify 무료 배포 가이드

## 🚀 1단계: 빌드 테스트

로컬에서 빌드가 잘 되는지 확인하세요:

```bash
# 의존성 설치 (한 번만)
npm install

# 빌드 테스트
npm run build

# 빌드 결과 확인
ls dist/
```

✅ `dist` 폴더가 생성되고 파일들이 있으면 성공!

## 🌐 2단계: Netlify 배포 (3가지 방법)

### 방법 A: 드래그 앤 드롭 (가장 쉬움) ⭐

1. **Netlify 접속**: https://netlify.com
2. **계정 생성/로그인**: GitHub, Google 등으로 가능
3. **"Deploy manually" 또는 "Want to deploy a new site without connecting to Git?"** 클릭
4. **`dist` 폴더를 드래그 앤 드롭**
5. **배포 완료!** 자동으로 URL 생성됨 (예: `amazing-name-123456.netlify.app`)

### 방법 B: Git 연동 (자동 배포)

1. **GitHub에 코드 업로드**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Netlify에서 "New site from Git"** 클릭
3. **GitHub 연결** → 저장소 선택
4. **빌드 설정**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Deploy site** 클릭

### 방법 C: Netlify CLI

```bash
# CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=dist
```

## 🔧 3단계: 설정 확인

배포 후 다음을 확인하세요:

### ✅ 기본 기능
- [ ] 시계가 정상 작동하는가?
- [ ] 설정 페이지로 이동되는가?
- [ ] 스플릿플랩 애니메이션이 작동하는가?
- [ ] 모바일에서도 잘 보이는가?

### ✅ PWA 기능
- [ ] 브라우저에서 "앱 설치" 버튼이 나타나는가?
- [ ] 홈 화면에 추가할 수 있는가?
- [ ] 오프라인에서 작동하는가?

### ✅ 성능
- [ ] 로딩이 빠른가? (3초 이내)
- [ ] Lighthouse 점수가 좋은가?

## 🌟 4단계: 도메인 설정 (선택사항)

### 무료 서브도메인 변경
1. **Site settings** → **Change site name**
2. **원하는 이름 입력** (예: `split-flap-clock`)
3. **결과**: `split-flap-clock.netlify.app`

### 커스텀 도메인 (유료)
1. **Domain settings** → **Add custom domain**
2. **도메인 입력** (예: `mysplitclock.com`)
3. **DNS 설정** 변경 (A 레코드 또는 CNAME)

## 🛠️ 문제 해결

### ❌ 빌드 실패시
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 메시지 확인
# 주로 타입스크립트 에러나 의존성 문제
```

### ❌ 페이지가 404 에러시
- `netlify.toml` 파일이 있는지 확인
- SPA 리다이렉트 설정이 올바른지 확인

### ❌ PWA가 설치 안 될 때
- HTTPS가 자동으로 활성화되었는지 확인
- Service Worker가 등록되었는지 확인 (개발자 도구 → Application → Service Workers)

### ❌ 폰트가 안 보일 때
- 네트워크 탭에서 SUIT 폰트 로딩 확인
- CSP 헤더 설정 확인

## 📊 5단계: 성능 체크

### Lighthouse 테스트
1. **Chrome 개발자 도구** → **Lighthouse**
2. **Generate report** 클릭
3. **목표 점수**:
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+
   - PWA: 체크마크 모두

### 실제 사용자 테스트
- 다양한 기기에서 접속 테스트
- 오프라인 모드 테스트
- PWA 설치 및 사용 테스트

## 🎉 배포 완료 체크리스트

- [ ] Netlify에 성공적으로 배포됨
- [ ] HTTPS가 자동으로 활성화됨
- [ ] 모든 페이지가 정상 작동함 (`/`, `/settings`)
- [ ] PWA 설치 가능
- [ ] 오프라인에서 작동
- [ ] 모바일에서 반응형 잘 됨
- [ ] Lighthouse 점수 양호
- [ ] 실제 사용자 테스트 완료

## 🔄 업데이트 방법

### 드래그 앤 드롭으로 배포한 경우
1. 코드 수정 후 `npm run build`
2. 새로운 `dist` 폴더를 다시 드래그 앤 드롭

### Git 연동으로 배포한 경우
1. 코드 수정 후 GitHub에 푸시
2. Netlify가 자동으로 새로 빌드 및 배포

## 💰 비용

- **Netlify 무료 플랜**: 
  - 월 100GB 대역폭
  - 월 300분 빌드 시간
  - 1개 동시 빌드
  - 커뮤니티 지원

➡️ **개인 프로젝트에는 충분함!**

## 🔗 유용한 링크

- **Netlify 대시보드**: https://app.netlify.com
- **Netlify 문서**: https://docs.netlify.com
- **PWA 체크리스트**: https://web.dev/pwa-checklist/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse