/**
 * 빌드 후 검색용 HTML 만들기 (npm run build 마지막 단계)
 *
 * SPA라서 모든 주소가 index.html 하나를 받는데, 네이버처럼 자바스크립트를
 * 잘 실행하지 않는 검색 로봇은 모든 페이지를 "홈"으로 봄.
 * 그래서 페이지마다 제목·설명·대표 주소와 본문 요약을 넣은 HTML을
 * dist/<주소>.html로 만들어 둠. 앱이 뜨면 Vue가 #app 내용을 바꿔 그림.
 *
 * - 페이지 정보: src/data/pages.json, 도시: src/data/cities.json
 * - sitemap.xml도 여기서 만듦 (도시가 늘면 자동 반영)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE_URL = 'https://piso-split-flap.netlify.app'

const pages = JSON.parse(readFileSync(join(root, 'src/data/pages.json'), 'utf8'))
const cities = JSON.parse(readFileSync(join(root, 'src/data/cities.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const escape = (text) => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ----- 시간대 계산 (앱의 src/utils/cityTime.ts와 같은 규칙) -----
const offsetMinutes = (timeZone, date) => {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date).find(part => part.type === 'timeZoneName').value // 'GMT-04:00' 또는 'GMT'
  const [, sign, h, m] = name.match(/GMT([+-])(\d{2}):(\d{2})/) || [null, '+', '00', '00']
  return (sign === '-' ? -1 : 1) * (Number(h) * 60 + Number(m))
}
const formatOffset = (minutes) => {
  const abs = Math.abs(minutes)
  const m = abs % 60
  return `UTC${minutes < 0 ? '-' : '+'}${Math.floor(abs / 60)}${m ? `:${String(m).padStart(2, '0')}` : ''}`
}
const formatGap = (minutes) => {
  const abs = Math.abs(minutes)
  return [Math.floor(abs / 60) ? `${Math.floor(abs / 60)}시간` : '', abs % 60 ? `${abs % 60}분` : '']
    .filter(Boolean).join(' ')
}
const year = new Date().getUTCFullYear()
const jan = new Date(Date.UTC(year, 0, 15, 12))
const jul = new Date(Date.UTC(year, 6, 15, 12))

/** 서머타임 때문에 시차가 철마다 다르므로 '1월 기준, 7월 기준'을 모두 적음 */
const cityFacts = (city) => {
  const offsets = [jan, jul].map(date => offsetMinutes(city.timezone, date))
  const gaps = [jan, jul].map((date, i) => offsets[i] - offsetMinutes('Asia/Seoul', date))
  const gapText = (diff) => diff === 0 ? '서울과 시차가 없습니다' : `서울보다 ${formatGap(diff)} ${diff > 0 ? '빠릅니다' : '느립니다'}`
  const hasDst = offsets[0] !== offsets[1]
  const zone = hasDst
    ? `평소 ${formatOffset(Math.min(...offsets))}, 서머타임 때 ${formatOffset(Math.max(...offsets))}`
    : `서머타임 없이 1년 내내 ${formatOffset(offsets[0])}`
  const sameDirection = Math.sign(gaps[0]) === Math.sign(gaps[1]) && gaps[0] !== 0
  const gap = gaps[0] === gaps[1]
    ? `${gapText(gaps[0])}.`
    : sameDirection
      ? `서울보다 1월에는 ${formatGap(gaps[0])}, 7월에는 ${formatGap(gaps[1])} ${gaps[0] > 0 ? '빠릅니다' : '느립니다'}.`
      : `1월에는 ${gapText(gaps[0])}. 7월에는 ${gapText(gaps[1])}.`
  return { zone, gap }
}

// ----- 한국어·영어 짝 (src/composables/useLocale.ts의 alternatePath와 같은 규칙) -----
const isEnPath = (path) => path === '/en' || path.startsWith('/en/')
const alternatePath = (path) => {
  if (isEnPath(path)) {
    const ko = path === '/en' ? '/' : path.slice(3)
    if (ko === '/world-clock') return '/timezone'
    return ['/', '/study', '/settings', '/privacy'].includes(ko) || ko.startsWith('/time/') ? ko : undefined
  }
  if (path === '/timezone') return '/en/world-clock'
  if (path === '/') return '/en'
  return ['/study', '/settings', '/privacy'].includes(path) || path.startsWith('/time/') ? `/en${path}` : undefined
}
const hreflangTags = (path) => {
  const other = alternatePath(path)
  if (!other) return ''
  const ko = isEnPath(path) ? other : path
  const en = isEnPath(path) ? path : other
  return [['ko', ko], ['en', en], ['x-default', ko]]
    .map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${SITE_URL}${href}" />`)
    .join('\n    ')
}

// ----- HTML 만들기 -----
const fill = (html, { path, fullTitle, description, body }) => {
  const url = SITE_URL + path
  const en = isEnPath(path)
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(fullTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(fullTitle)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${escape(fullTitle)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*" \/>/, `$1${url}" />\n    ${hreflangTags(path)}`)
  if (en) {
    out = out
      .replace('<html lang="ko">', '<html lang="en">')
      .replace(/(<meta property="og:locale" content=")[^"]*/, '$1en_US')
      .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*/, '$1Flip Clock')
  }
  if (body) out = out.replace('<div id="app"></div>', `<div id="app">${body}</div>`)
  return out
}

const render = (page) => {
  const html = fill(template, page)
  if (html === template) throw new Error(`prerender: ${page.path} 바꿀 곳을 못 찾음`)
  // faq/index.html로 두면 Netlify가 /faq → /faq/로 301 이동시켜 canonical과 어긋남 → faq.html로 저장
  const file = join(dist, `${page.path}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const pageTitle = (meta) => meta.fullTitle ?? `${meta.title} | Split Flap Clock`

const cityLinks = (except, en) => cities
  .filter(city => city.slug !== except)
  .map(city => en
    ? `<a href="/en/time/${city.slug}">${city.en} time now</a>`
    : `<a href="/time/${city.slug}">${city.ko} 현재 시간</a>`)
  .join(' · ')

// 한국어 홈: dist/index.html에 짝 표시만 추가 (모든 주소의 기본 화면이라 본문은 넣지 않음)
writeFileSync(join(dist, 'index.html'), fill(template, {
  path: '/', fullTitle: pageTitle(pages['/']), description: pages['/'].description
}))

// 일반 페이지
for (const [path, meta] of Object.entries(pages)) {
  if (path === '/') continue
  const en = isEnPath(path)
  render({
    path,
    fullTitle: pageTitle(meta),
    description: meta.description,
    body: `<main><h1>${escape(meta.title)}</h1><p>${escape(meta.description)}</p><p><a href="${en ? '/en' : '/'}">${en ? 'Open the flip clock' : '플립시계 열기'}</a></p></main>`
  })
}

// 영어판 시차 문장 (서울 대신 UTC 기준으로만 설명)
const enZone = (city) => {
  const offsets = [jan, jul].map(date => offsetMinutes(city.timezone, date))
  return offsets[0] === offsets[1]
    ? `${formatOffset(offsets[0])} all year (no daylight saving time)`
    : `${formatOffset(Math.min(...offsets))} standard time and ${formatOffset(Math.max(...offsets))} during daylight saving time`
}

// 도시별 현재 시간 (한국어 + 영어)
for (const city of cities) {
  const { zone, gap } = cityFacts(city)
  // 제목·설명 규칙은 src/utils/cityTime.ts의 cityTitle·cityDescription과 같게
  const title = city.slug === 'seoul' ? '한국 시간 · 서울 현재 시간' : `${city.ko} 현재 시간 · 서울 시차`
  const description = city.slug === 'seoul'
    ? '지금 한국 시간(서울, UTC+9)을 플립시계로 보여 줍니다. 해외에서 한국이 몇 시인지 확인할 때 켜 두세요.'
    : `${city.ko}(${city.country}) 지금 몇 시인지 플립시계로 보여 줍니다. 서울과의 시차, 서머타임 여부, 서울 시간 변환표를 한눈에 확인하세요.`
  render({
    path: `/time/${city.slug}`,
    fullTitle: `${title} | Split Flap Clock`,
    description,
    body: [
      '<main>',
      `<h1>${escape(city.ko)} 현재 시간</h1>`,
      `<p>${escape(city.ko)}(${escape(city.country)}, ${city.en})의 시간대는 ${city.timezone}이며 ${escape(zone)}입니다. ${city.slug === 'seoul' ? '' : escape(gap)}</p>`,
      `<p>${escape(city.tip)}</p>`,
      `<p>다른 도시: ${cityLinks(city.slug, false)}</p>`,
      '</main>'
    ].join('')
  })

  const titleEn = city.slug === 'seoul' ? 'Korea Time Now · Seoul Time (KST)' : `${city.en} Time Now · Local Time & Time Zone`
  render({
    path: `/en/time/${city.slug}`,
    fullTitle: `${titleEn} | Split Flap Clock`,
    description: `Current local time in ${city.en}, ${city.countryEn} on a split-flap clock, with the time difference from your time, daylight saving status and a quick time converter.`,
    body: [
      '<main>',
      `<h1>${escape(city.en)} time now</h1>`,
      `<p>${escape(city.en)}, ${escape(city.countryEn)} uses the ${city.timezone} time zone: ${enZone(city)}.</p>`,
      `<p>${escape(city.tipEn)}</p>`,
      `<p>Other cities: ${cityLinks(city.slug, true)}</p>`,
      '</main>'
    ].join('')
  })
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10)
const urls = [
  ...Object.keys(pages).filter(path => !path.endsWith('/settings')),
  ...cities.flatMap(city => [`/time/${city.slug}`, `/en/time/${city.slug}`])
]
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(path => `  <url><loc>${SITE_URL}${path === '/' ? '/' : path}</loc><lastmod>${today}</lastmod></url>`),
  '</urlset>',
  ''
].join('\n')
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`prerender: 페이지 ${Object.keys(pages).length}개 + 도시 ${cities.length}×2개, sitemap ${urls.length}개 주소`)
