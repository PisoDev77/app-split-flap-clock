# Split Flap Clock 배포 가이드

## 🚀 배포 방법

### 1. 환경 변수 설정

실제 배포 전에 `.env.production` 파일의 도메인 정보를 업데이트하세요:

```bash
# .env.production 파일 수정
VITE_APP_DOMAIN="your-actual-domain.com"
VITE_APP_URL="https://your-actual-domain.com"
```

### 2. 빌드 및 배포

#### 방법 A: 자동 배포 스크립트 사용 (권장)
```bash
# 프로덕션 배포
npm run deploy:prod

# 일반 배포
npm run deploy
```

#### 방법 B: 수동 빌드
```bash
# 의존성 설치
npm ci

# 빌드
npm run build

# 결과 확인
ls -la dist/
```

### 3. Docker를 사용한 배포 (권장)

#### 기본 Docker 배포
```bash
# 이미지 빌드
docker build -t split-flap-clock .

# 컨테이너 실행
docker run -d -p 80:80 --name split-flap-clock split-flap-clock
```

#### Docker Compose 사용
```bash
# 기본 실행 (HTTP만)
docker-compose up -d split-flap-clock

# HTTPS 포함 실행 (프로덕션)
docker-compose --profile production up -d
```

### 4. 정적 호스팅 서비스 배포

#### Netlify
1. `dist` 폴더를 Netlify에 드래그 앤 드롭
2. 또는 Git 연동으로 자동 배포 설정

#### Vercel
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### GitHub Pages
```bash
# gh-pages 패키지 설치
npm install --save-dev gh-pages

# 배포
npm run build
npx gh-pages -d dist
```

#### AWS S3 + CloudFront
```bash
# AWS CLI로 S3에 업로드
aws s3 sync dist/ s3://your-bucket-name --delete

# CloudFront 무효화
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔧 서버 설정

### Nginx 설정 (직접 서버 관리시)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # HTTPS 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 인증서 설정
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    root /var/www/split-flap-clock;
    index index.html;
    
    # 정적 파일 캐싱
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker
    location /sw.js {
        expires -1;
        add_header Cache-Control "no-cache";
    }
    
    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache 설정 (.htaccess)

```apache
RewriteEngine On

# HTTPS 강제
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA 라우팅
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 캐싱 설정
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</filesMatch>

# Service Worker 캐시 방지
<filesMatch "sw\.js$">
    ExpiresActive On
    ExpiresDefault "access plus 0 seconds"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</filesMatch>
```

## 🔒 보안 설정

### 1. HTTPS 설정
- Let's Encrypt를 사용한 무료 SSL 인증서 권장
- CloudFlare를 통한 CDN 및 SSL 설정 가능

### 2. CSP (Content Security Policy) 확인
배포 스크립트가 자동으로 생성하는 `_headers` 파일에 포함됨:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; ...
```

### 3. 보안 헤더
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 📊 성능 최적화

### 1. CDN 설정
- CloudFlare, AWS CloudFront, 또는 다른 CDN 서비스 사용
- 전 세계 사용자를 위한 빠른 로딩 속도

### 2. 압축 설정
- Gzip/Brotli 압축 활성화
- Nginx/Apache에서 자동 압축 설정

### 3. 캐싱 전략
- **정적 파일**: 1년 캐시
- **Service Worker**: 캐시 없음
- **HTML**: 1시간 캐시
- **Manifest**: 1일 캐시

## 🧪 배포 후 확인 사항

### 1. 기본 기능 테스트
- [ ] 시계 정상 작동
- [ ] 스플릿플랩 애니메이션
- [ ] 설정 페이지 접근
- [ ] 반응형 디자인

### 2. PWA 기능 테스트
- [ ] PWA 설치 프롬프트 표시
- [ ] 오프라인에서 앱 동작
- [ ] Service Worker 등록 확인
- [ ] 홈 화면 아이콘 표시

### 3. 성능 테스트
- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 첫 페이지 로딩 시간 (3초 이내)
- [ ] Core Web Vitals 확인

### 4. 브라우저 호환성
- [ ] Chrome/Edge (최신 2개 버전)
- [ ] Safari (최신 2개 버전)
- [ ] Firefox (최신 2개 버전)
- [ ] 모바일 브라우저 (iOS Safari, Android Chrome)

### 5. SEO 확인
- [ ] robots.txt 접근 가능
- [ ] sitemap.xml 접근 가능
- [ ] Open Graph 메타태그 확인
- [ ] 구조화된 데이터 확인

## 🔄 CI/CD 설정 (선택사항)

### GitHub Actions 예시
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to S3
      run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🆘 문제 해결

### 1. PWA 설치가 안 되는 경우
- HTTPS 설정 확인
- Service Worker 등록 확인
- Manifest 파일 유효성 검사

### 2. 오프라인에서 작동하지 않는 경우
- Service Worker 캐시 전략 확인
- 네트워크 요청 차단 여부 확인

### 3. 성능이 느린 경우
- 번들 크기 분석: `npm run analyze`
- CDN 설정 확인
- 압축 설정 확인

### 4. 스타일이 깨지는 경우
- SUIT 폰트 로딩 확인
- CSS 압축 설정 확인
- CSP 정책 검토

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:
1. GitHub Issues에 문제 등록
2. 배포 로그 확인
3. 브라우저 개발자 도구 콘솔 확인