<template>
  <div class="widget-view">
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <UiButton type="text" :icon="ArrowLeftOutlined" class="back-btn" :aria-label="t.backLabel" @click="goBack">
            {{ t.back }}
          </UiButton>
          <h1 class="page-title">{{ t.title }}</h1>
          <div class="header-spacer" />
        </div>
      </header>

      <div class="content">
        <div class="widget-container" role="main">
          <UiCard class="card" :title="t.options">
            <div class="form-grid">
              <label class="field">
                <span class="field-label">{{ t.city }}</span>
                <UiSelect v-model:value="citySlug" :aria-label="t.city" :options="cityOptions" />
              </label>
              <label class="field">
                <span class="field-label">{{ t.format }}</span>
                <UiSelect v-model:value="format" :aria-label="t.format" :options="formatOptions" />
              </label>
              <label class="field">
                <span class="field-label">{{ t.theme }}</span>
                <UiSelect v-model:value="theme" :aria-label="t.theme" :options="themeOptions" />
              </label>
              <label class="field">
                <span class="field-label">{{ t.size }}</span>
                <UiSelect v-model:value="size" :aria-label="t.size" :options="sizeOptions" />
              </label>
            </div>
            <div class="switch-row">
              <span class="field-label">{{ t.seconds }}</span>
              <UiSwitch v-model:checked="showSeconds" :aria-label="t.seconds" />
            </div>
          </UiCard>

          <UiCard class="card" :title="t.preview">
            <div class="preview-frame">
              <iframe
                :key="embedUrl"
                :src="embedPath"
                :width="dimensions.width"
                :height="dimensions.height"
                :title="t.previewTitle"
                class="preview-iframe"
              />
            </div>
          </UiCard>

          <UiCard class="card" :title="t.code">
            <p class="note">{{ t.codeNote }}</p>
            <textarea class="code" readonly rows="5" :value="embedCode" :aria-label="t.code" @focus="selectAll" />
            <div class="actions">
              <UiButton type="primary" :icon="CopyOutlined" @click="copy(embedCode, t.copiedCode)">{{ t.copyCode }}</UiButton>
              <UiButton :icon="LinkOutlined" @click="copy(embedUrl, t.copiedUrl)">{{ t.copyUrl }}</UiButton>
            </div>
          </UiCard>

          <UiCard v-if="!isEn" class="card" title="어디에 붙일 수 있나요?">
            <ul>
              <li><strong>노션</strong>: <code>/embed</code> 블록을 만들고 <strong>주소 복사</strong>로 복사한 주소를 붙여 넣으세요.</li>
              <li><strong>티스토리</strong>: 글쓰기에서 기본 모드를 <strong>HTML</strong>로 바꾸고 <strong>코드 복사</strong>로 복사한 코드를 붙여 넣으세요.</li>
              <li><strong>워드프레스</strong>: <strong>사용자 정의 HTML</strong> 블록에 코드를 붙여 넣으세요.</li>
              <li><strong>내 홈페이지</strong>: HTML 안 원하는 곳에 코드를 넣으세요.</li>
              <li>네이버 블로그는 HTML 코드를 붙일 수 없어서, 위젯 대신 링크로 소개해 주세요.</li>
              <li>위젯은 무료이고 광고가 없어요. 보는 사람의 정보를 모으지 않아요.</li>
            </ul>
          </UiCard>
          <UiCard v-else class="card" title="Where can I use it?">
            <ul>
              <li><strong>Notion</strong>: add an <code>/embed</code> block and paste the address from <strong>Copy URL</strong>.</li>
              <li><strong>WordPress</strong>: paste the code into a <strong>Custom HTML</strong> block.</li>
              <li><strong>Your website or blog</strong>: paste the code where you want the clock to appear.</li>
              <li>The widget is free, has no ads and collects no data about your visitors.</li>
            </ul>
          </UiCard>
        </div>
      </div>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeftOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons-vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiSwitch from '@/components/ui/UiSwitch.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useGoBack } from '@/composables/useGoBack'
import { useLocale } from '@/composables/useLocale'
import { message } from '@/composables/useToast'
import { CITIES, findCity } from '@/utils/cityTime'

/**
 * ## 시계 위젯 만들기 (/widget, /en/widget)
 *
 * 블로그·노션에 붙일 플립시계 코드를 만들어 줌. 실제 시계는 /embed (EmbedView).
 * 코드 아래에 사이트 링크 한 줄을 함께 넣어 검색 순위에 도움이 되는 외부 링크를 얻음.
 */

const SITE_URL = 'https://piso-split-flap.netlify.app'
const VIEWER = '__viewer__'

const goBack = useGoBack()
const { isEn, pick } = useLocale()

const t = pick({
  ko: {
    back: '뒤로', backLabel: '이전 페이지로 돌아가기', title: '블로그 시계 위젯',
    options: '위젯 모양', city: '도시', viewer: '보는 사람의 시간', format: '시간 표시',
    h24: '24시간', h12: '12시간 (오전·오후)', theme: '색', auto: '보는 사람 설정 따라', light: '밝게', dark: '어둡게',
    size: '크기', small: '작게 (280×140)', medium: '보통 (360×170)', large: '크게 (480×210)', seconds: '초 보이기',
    preview: '미리보기', previewTitle: '플립시계 위젯 미리보기',
    code: '붙여 넣을 코드', codeNote: '아래 코드를 블로그나 홈페이지에 붙여 넣으면 위 미리보기와 같은 시계가 나와요.',
    copyCode: '코드 복사', copyUrl: '주소 복사', copiedCode: '코드를 복사했어요', copiedUrl: '위젯 주소를 복사했어요',
    copyFail: '복사하지 못했어요. 코드를 길게 눌러 직접 복사해 주세요.',
    iframeTitle: '플립시계', credit: '플립시계 – 무료 온라인 시계'
  },
  en: {
    back: 'Back', backLabel: 'Go back', title: 'Clock Widget for Your Site',
    options: 'Widget options', city: 'City', viewer: "Visitor's local time", format: 'Time format',
    h24: '24-hour', h12: '12-hour (AM/PM)', theme: 'Colors', auto: "Follow visitor's setting", light: 'Light', dark: 'Dark',
    size: 'Size', small: 'Small (280×140)', medium: 'Medium (360×170)', large: 'Large (480×210)', seconds: 'Show seconds',
    preview: 'Preview', previewTitle: 'Flip clock widget preview',
    code: 'Embed code', codeNote: 'Paste this code into your blog or website to show the clock from the preview.',
    copyCode: 'Copy code', copyUrl: 'Copy URL', copiedCode: 'Code copied', copiedUrl: 'Widget URL copied',
    copyFail: "Couldn't copy. Please select the code and copy it.",
    iframeTitle: 'Flip Clock', credit: 'Flip Clock – free online clock'
  }
})

const SIZES = {
  small: { width: 280, height: 140 },
  medium: { width: 360, height: 170 },
  large: { width: 480, height: 210 }
} as const

const citySlug = ref<string>(isEn.value ? VIEWER : 'seoul')
const format = ref<'24' | '12'>(isEn.value ? '12' : '24')
const theme = ref<'auto' | 'light' | 'dark'>('dark')
const size = ref<keyof typeof SIZES>('medium')
const showSeconds = ref(true)

const cityOptions = computed(() => [
  { value: VIEWER, label: t.value.viewer },
  ...CITIES.map(city => ({ value: city.slug, label: isEn.value ? city.en : city.ko }))
])
const formatOptions = computed(() => [{ value: '24', label: t.value.h24 }, { value: '12', label: t.value.h12 }])
const themeOptions = computed(() => [
  { value: 'auto', label: t.value.auto }, { value: 'light', label: t.value.light }, { value: 'dark', label: t.value.dark }
])
const sizeOptions = computed(() => [
  { value: 'small', label: t.value.small }, { value: 'medium', label: t.value.medium }, { value: 'large', label: t.value.large }
])

const dimensions = computed(() => SIZES[size.value])

const embedPath = computed(() => {
  const params = new URLSearchParams()
  if (findCity(citySlug.value)) params.set('city', citySlug.value)
  if (format.value === '12') params.set('h', '12')
  if (!showSeconds.value) params.set('s', '0')
  if (theme.value !== 'auto') params.set('theme', theme.value)
  if (isEn.value) params.set('lang', 'en')
  const query = params.toString()
  return `/embed${query ? `?${query}` : ''}`
})
const embedUrl = computed(() => SITE_URL + embedPath.value)

// 아래 링크 한 줄: 위젯을 붙인 사이트에서 이 사이트로 오는 링크 (검색 순위에 도움)
const embedCode = computed(() => [
  `<iframe src="${embedUrl.value}" width="${dimensions.value.width}" height="${dimensions.value.height}" style="border:0;border-radius:12px;max-width:100%" title="${t.value.iframeTitle}" loading="lazy"></iframe>`,
  `<p style="margin:4px 0 0;font-size:12px"><a href="${SITE_URL}${isEn.value ? '/en' : '/'}">${t.value.credit}</a></p>`
].join('\n'))

const selectAll = (event: FocusEvent) => (event.target as HTMLTextAreaElement).select()

const copy = async (text: string, done: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(done)
  } catch {
    message.error(t.value.copyFail)
  }
}
</script>

<style scoped>
.widget-view,
.layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout {
  background: var(--color-canvas-default);
}

.header {
  background: var(--color-canvas-default);
  border-bottom: 1px solid var(--color-border-default);
  height: 64px;
  padding: 0 24px;
  box-shadow: var(--shadow-small);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  color: var(--color-accent-fg);
  border: none;
  margin-right: 16px;
}

.page-title {
  flex: 1;
  margin: 0;
  color: var(--color-fg-default);
  font-size: 1.5rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-spacer {
  width: 80px;
}

.content {
  flex: 1;
  padding: 24px;
  background: var(--color-canvas-subtle);
}

.widget-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-label {
  color: var(--color-fg-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  min-height: 44px;
}

.preview-frame {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-radius: 12px;
  background: repeating-conic-gradient(var(--color-canvas-subtle) 0% 25%, var(--color-canvas-default) 0% 50%) 50% / 20px 20px;
  overflow-x: auto;
}

.preview-iframe {
  max-width: 100%;
  border: 0;
  border-radius: 12px;
}

.note {
  margin: 0 0 12px;
  color: var(--color-fg-muted);
  line-height: 1.6;
}

.code {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  background: var(--color-canvas-subtle);
  color: var(--color-fg-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  resize: vertical;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.card ul {
  margin: 0;
  padding-left: 1.25rem;
}

.card li {
  color: var(--color-fg-default);
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.card code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-canvas-subtle);
}

@media (max-width: 640px) {
  .header {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .header-spacer {
    display: none;
  }

  .content {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
