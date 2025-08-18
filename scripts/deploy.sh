#!/bin/bash

# Split Flap Clock 배포 스크립트
# 사용법: ./scripts/deploy.sh [환경]
# 예시: ./scripts/deploy.sh production

set -e

# 기본값 설정
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"

echo "🚀 Split Flap Clock 배포 시작 (환경: $ENVIRONMENT)"

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 2. 린트 및 타입 체크
echo "🔍 코드 품질 검사 중..."
npm run lint --if-present
npm run typecheck --if-present

# 3. 테스트 실행 (있는 경우)
echo "🧪 테스트 실행 중..."
npm test --if-present

# 4. 빌드
echo "🏗️ 프로덕션 빌드 중..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    npm run build
fi

# 5. 빌드 결과 확인
echo "📊 빌드 결과 분석 중..."
echo "총 파일 수: $(find $BUILD_DIR -type f | wc -l)"
echo "총 크기: $(du -sh $BUILD_DIR | cut -f1)"

# 6. 주요 파일 크기 체크
echo "📁 주요 파일 크기:"
find $BUILD_DIR/assets -name "*.js" -o -name "*.css" | head -10 | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  $(basename "$file"): $size"
done

# 7. PWA 파일 확인
echo "🔧 PWA 파일 확인 중..."
if [ -f "$BUILD_DIR/sw.js" ]; then
    echo "✅ Service Worker 생성됨"
else
    echo "❌ Service Worker 누락"
    exit 1
fi

if [ -f "$BUILD_DIR/manifest.json" ]; then
    echo "✅ PWA Manifest 확인됨"
else
    echo "❌ PWA Manifest 누락"
    exit 1
fi

# 8. 아이콘 파일 확인
echo "🎨 아이콘 파일 확인 중..."
ICON_COUNT=$(find $BUILD_DIR/icons -name "*.png" 2>/dev/null | wc -l)
if [ $ICON_COUNT -ge 8 ]; then
    echo "✅ PWA 아이콘 확인됨 ($ICON_COUNT개)"
else
    echo "⚠️ PWA 아이콘 부족 ($ICON_COUNT개)"
fi

# 9. 보안 헤더 설정 파일 생성
echo "🔒 보안 설정 파일 생성 중..."
cat > $BUILD_DIR/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https:; frame-src https://googleads.g.doubleclick.net;

/sw.js
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=31536000, immutable
EOF

# 10. robots.txt 생성
echo "🤖 robots.txt 생성 중..."
cat > $BUILD_DIR/robots.txt << EOF
User-agent: *
Allow: /

Sitemap: https://split-flap-clock.app/sitemap.xml
EOF

# 11. sitemap.xml 생성
echo "🗺️ sitemap.xml 생성 중..."
cat > $BUILD_DIR/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://split-flap-clock.app/</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://split-flap-clock.app/settings</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
EOF

echo "✅ 배포 준비 완료!"
echo "📂 빌드 파일 위치: $BUILD_DIR"
echo ""
echo "다음 단계:"
echo "1. $BUILD_DIR 폴더를 웹 서버에 업로드"
echo "2. HTTPS 설정 확인"
echo "3. 도메인 설정 확인"
echo "4. PWA 기능 테스트"
echo ""
echo "배포 후 확인 사항:"
echo "- https://split-flap-clock.app"
echo "- PWA 설치 가능 여부"
echo "- 오프라인 동작 확인"
echo "- 다양한 기기에서 테스트"