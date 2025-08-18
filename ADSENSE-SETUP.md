# Google AdSense 설정 가이드

## 🎯 현재 설정 상태
- ✅ **게시자 ID**: `ca-pub-9032352332550166`
- ✅ **AdSense 스크립트**: index.html에 추가됨
- ✅ **AdSenseBanner 컴포넌트**: 반응형 배너 구현 완료
- ✅ **개발/프로덕션 환경 분리**: 개발 시 더미 광고 표시

## 📋 Google AdSense 계정에서 해야 할 작업

### 1. 광고 단위 생성
Google AdSense 대시보드에서 다음 광고 단위들을 생성하세요:

#### 메인 배너 (하단 고정)
- **광고 단위 이름**: `split-flap-bottom-banner`
- **광고 크기**: 반응형
- **광고 유형**: 디스플레이 광고
- **위치**: 앱 하단 고정

#### 설정 페이지 인라인 (선택사항)
- **광고 단위 이름**: `split-flap-settings-inline`
- **광고 크기**: 반응형 (320x100 또는 300x250)
- **광고 유형**: 디스플레이 광고
- **위치**: 설정 페이지 중간

### 2. 광고 단위 슬롯 ID 획득
생성한 각 광고 단위의 **data-ad-slot** 값을 복사하세요.

### 3. 코드 업데이트
획득한 슬롯 ID로 다음 파일들을 업데이트하세요:

#### App.vue
```vue
<AdSenseBanner 
  ad-slot="YOUR_SLOT_ID_HERE" 
  position="bottom" 
/>
```

#### SettingsView.vue (선택사항)
```vue
<AdSenseBanner 
  ad-slot="YOUR_SETTINGS_SLOT_ID_HERE" 
  position="inline" 
  :mobile="true"
/>
```

## 🔧 컴포넌트 사용법

### 기본 하단 배너
```vue
<AdSenseBanner 
  ad-slot="1234567890"
  position="bottom"
/>
```

### 인라인 광고 (컨텐츠 중간)
```vue
<AdSenseBanner 
  ad-slot="0987654321"
  position="inline"
  ad-format="rectangle"
/>
```

### 모바일 전용 광고
```vue
<AdSenseBanner 
  ad-slot="1122334455"
  position="bottom"
  :mobile="true"
/>
```

## 🧪 테스트 방법

### 개발 환경
- 더미 광고가 표시되는지 확인
- 반응형 동작 테스트 (모바일/데스크톱)
- 광고 차단기 감지 기능 테스트

### 프로덕션 환경
1. **도메인 등록**: AdSense에 실제 도메인 등록
2. **사이트 검토**: Google의 사이트 검토 완료 대기
3. **광고 표시 확인**: 실제 광고가 로드되는지 확인
4. **성능 모니터링**: 광고 로딩이 앱 성능에 미치는 영향 체크

## 📊 성능 최적화

### 지연 로딩
```javascript
// AdSense 스크립트 지연 로딩
setTimeout(() => {
  loadAdSense()
}, 1000)
```

### 광고 차단기 대응
- 광고 차단기 감지 시 대체 컨텐츠 표시
- 사용자에게 앱 지원 요청 메시지 (선택사항)

### 성능 지표 모니터링
- **LCP (Largest Contentful Paint)**: 광고가 메인 컨텐츠 로딩을 방해하지 않도록
- **CLS (Cumulative Layout Shift)**: 광고 로딩 시 레이아웃 변경 최소화
- **FID (First Input Delay)**: 사용자 상호작용 반응성 유지

## 🚨 주의사항

1. **정책 준수**: Google AdSense 정책 준수 필수
2. **클릭 유도 금지**: 광고 클릭 유도하는 텍스트나 버튼 금지
3. **적정 광고 밀도**: 과도한 광고로 UX 저하 방지
4. **모바일 최적화**: 모바일에서 광고가 컨텐츠를 가리지 않도록 주의

## 📈 다음 단계

1. ✅ AdSense 계정에서 광고 단위 생성
2. ✅ 슬롯 ID 코드에 적용
3. ✅ 프로덕션 배포 후 AdSense 승인 대기
4. ✅ 광고 성능 모니터링 시작