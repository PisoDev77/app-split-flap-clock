<template>
  <div
    class="animated-background"
    :class="[`period-${period}`, isDarkMode ? 'theme-dark' : 'theme-light', { 'is-contained': contained }]"
    aria-hidden="true"
  >
    <!-- 시간대별 그라디언트 (모든 효과의 바탕) -->
    <div v-if="enabled" class="gradient-layer" :class="`intensity-${intensity}`" />

    <!-- 오로라: CSS만으로 그리는 흐릿한 빛 덩어리 -->
    <div v-if="isActive && effect === 'aurora'" class="aurora-layer" :class="`intensity-${intensity}`">
      <span class="aurora-blob aurora-blob--1" />
      <span class="aurora-blob aurora-blob--2" />
      <span class="aurora-blob aurora-blob--3" />
    </div>

    <!-- 나머지 효과: 캔버스 하나에 그림 -->
    <canvas v-show="isActive && effect !== 'aurora'" ref="canvasRef" class="effect-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type { BackgroundEffect } from '@/composables/useSettings'
import { onMediaQueryChange } from '@/utils/mediaQuery'

/**
 * ## 애니메이션 배경
 *
 * 시간대별 그라디언트 위에 고른 효과(파티클·별·눈·비·보케·오로라)를 그립니다.
 *
 * ### 성능·접근성
 * - 캔버스 하나 + requestAnimationFrame, 초당 최대 30프레임
 * - 탭이 안 보이면 멈춤, '동작 줄이기' 설정이면 그리지 않음
 * - 화면 밀도(DPR)는 최대 2배까지만 사용
 */

interface Props {
  enabled?: boolean
  effect?: BackgroundEffect
  intensity?: 'low' | 'medium' | 'high'
  /** true면 화면 전체가 아니라 부모 상자 안에만 그림 (설정 미리보기용) */
  contained?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  effect: 'particles',
  intensity: 'medium',
  contained: false
})

const { isDarkMode } = useTheme()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentHour = ref(new Date().getHours())
const prefersReducedMotion = ref(false)

const period = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
})

const isActive = computed(() => props.enabled && props.effect !== 'none' && !prefersReducedMotion.value)

const DENSITY = { low: 0.5, medium: 1, high: 1.7 } as const
const FRAME_MS = 1000 / 30

// 효과별 색 (다크: 밝은 빛, 라이트: 진한 색이 은은하게 보이도록)
const palette = computed(() => isDarkMode.value
  ? { dot: '255, 255, 255', warm: '255, 214, 165', cool: '147, 197, 253', rain: '186, 230, 253' }
  : { dot: '30, 64, 175', warm: '234, 88, 12', cool: '37, 99, 235', rain: '71, 85, 105' })

// ---- 캔버스 렌더러 ----

interface Item {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  a: number
  phase: number
}

let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let items: Item[] = []
let shootingStar: { x: number, y: number, life: number } | null = null
let nextShootingStarAt = 0
let rafId: number | null = null
let lastFrame = 0
let resizeObserver: ResizeObserver | null = null
const spriteCache = new Map<string, HTMLCanvasElement>()

const rand = (min: number, max: number) => min + Math.random() * (max - min)

// 흐릿한 원 이미지를 한 번 만들어 두고 drawImage로 재사용 (shadowBlur보다 훨씬 가벼움)
const glowSprite = (rgb: string, softness: number): HTMLCanvasElement => {
  const key = `${rgb}|${softness}`
  const cached = spriteCache.get(key)
  if (cached) return cached
  const size = 64
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = size
  const g = sprite.getContext('2d')!
  const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${rgb}, 1)`)
  gradient.addColorStop(softness, `rgba(${rgb}, 0.35)`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  g.fillStyle = gradient
  g.fillRect(0, 0, size, size)
  spriteCache.set(key, sprite)
  return sprite
}

const countFor = (perMegapixel: number) => {
  const area = (width * height) / 1_000_000
  return Math.max(8, Math.round(perMegapixel * area * DENSITY[props.intensity]))
}

const createItems = () => {
  const make = (overrides: Partial<Item>): Item => ({
    x: rand(0, width), y: rand(0, height), r: 1, vx: 0, vy: 0, a: 1, phase: rand(0, Math.PI * 2), ...overrides
  })
  switch (props.effect) {
    case 'particles':
      items = Array.from({ length: countFor(150) }, () => make({ r: rand(1.5, 4.5), vy: rand(-0.45, -0.15), a: rand(0.35, 0.95) }))
      break
    case 'stars':
      items = Array.from({ length: countFor(260) }, () => make({ r: rand(0.6, 1.9), a: rand(0.35, 1), vx: rand(0.6, 2.2) }))
      nextShootingStarAt = performance.now() + rand(2000, 5000)
      break
    case 'snow':
      items = Array.from({ length: countFor(180) }, () => make({ r: rand(1.4, 4.2), vy: rand(0.5, 1.4), a: rand(0.5, 0.95) }))
      break
    case 'rain':
      items = Array.from({ length: countFor(220) }, () => make({ r: rand(12, 26), vy: rand(9, 15), vx: -1.6, a: rand(0.2, 0.5) }))
      break
    case 'bokeh':
      items = Array.from({ length: countFor(22) }, () => make({ r: rand(30, 90), vx: rand(-0.2, 0.2), vy: rand(-0.15, 0.15), a: rand(0.12, 0.3) }))
      break
    default:
      items = []
  }
  shootingStar = null
}

const wrap = (item: Item, margin: number) => {
  if (item.y < -margin) { item.y = height + margin; item.x = rand(0, width) }
  if (item.y > height + margin) { item.y = -margin; item.x = rand(0, width) }
  if (item.x < -margin) item.x = width + margin
  if (item.x > width + margin) item.x = -margin
}

const draw = (now: number) => {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  const colors = palette.value
  const t = now / 1000

  switch (props.effect) {
    case 'particles': {
      const sprite = glowSprite(colors.dot, 0.25)
      for (const p of items) {
        p.y += p.vy
        p.x += Math.sin(t * 0.6 + p.phase) * 0.25
        wrap(p, 10)
        const size = p.r * 5
        ctx.globalAlpha = p.a * (0.75 + 0.25 * Math.sin(t * 1.5 + p.phase))
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size)
      }
      break
    }
    case 'stars': {
      ctx.fillStyle = `rgb(${colors.dot})`
      for (const s of items) {
        ctx.globalAlpha = s.a * (0.45 + 0.55 * Math.abs(Math.sin(t * s.vx * 0.5 + s.phase)))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!shootingStar && now > nextShootingStarAt) {
        shootingStar = { x: rand(width * 0.2, width), y: rand(0, height * 0.4), life: 1 }
      }
      if (shootingStar) {
        const { x, y, life } = shootingStar
        const gradient = ctx.createLinearGradient(x, y, x + 120, y - 50)
        gradient.addColorStop(0, `rgba(${colors.dot}, ${life})`)
        gradient.addColorStop(1, `rgba(${colors.dot}, 0)`)
        ctx.globalAlpha = 1
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 120, y - 50)
        ctx.stroke()
        shootingStar.x -= 14
        shootingStar.y += 6
        shootingStar.life -= 0.03
        if (shootingStar.life <= 0) {
          shootingStar = null
          nextShootingStarAt = now + rand(5000, 11000)
        }
      }
      break
    }
    case 'snow': {
      const sprite = glowSprite(isDarkMode.value ? colors.dot : '148, 163, 184', 0.55)
      for (const f of items) {
        f.y += f.vy
        f.x += Math.sin(t * 0.8 + f.phase) * 0.6
        wrap(f, 10)
        const size = f.r * 2.6
        ctx.globalAlpha = f.a
        ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size)
      }
      break
    }
    case 'rain': {
      ctx.strokeStyle = `rgb(${colors.rain})`
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      for (const d of items) {
        d.y += d.vy
        d.x += d.vx
        wrap(d, 30)
        ctx.globalAlpha = d.a
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + d.vx * 2, d.y + d.r)
        ctx.stroke()
      }
      break
    }
    case 'bokeh': {
      const warm = glowSprite(colors.warm, 0.6)
      const cool = glowSprite(colors.cool, 0.6)
      items.forEach((b, index) => {
        b.x += b.vx
        b.y += b.vy
        wrap(b, b.r)
        ctx!.globalAlpha = b.a * (0.8 + 0.2 * Math.sin(t * 0.4 + b.phase))
        ctx!.drawImage(index % 2 ? warm : cool, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)
      })
      break
    }
  }
  ctx.globalAlpha = 1
}

const loop = (now: number) => {
  rafId = requestAnimationFrame(loop)
  if (now - lastFrame < FRAME_MS) return
  lastFrame = now
  draw(now)
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  createItems()
}

const stop = () => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  ctx?.clearRect(0, 0, width, height)
}

const start = () => {
  stop()
  if (!isActive.value || props.effect === 'aurora' || document.hidden) return
  resize()
  rafId = requestAnimationFrame(loop)
}

const onVisibilityChange = () => (document.hidden ? stop() : start())

let stopReducedMotionWatch: (() => void) | null = null
let hourTimer: ReturnType<typeof setInterval> | undefined

watch(() => [props.enabled, props.effect, props.intensity, prefersReducedMotion.value], () => {
  // v-show 전환 뒤 캔버스 크기를 읽도록 한 프레임 기다림
  requestAnimationFrame(start)
})

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  stopReducedMotionWatch = onMediaQueryChange('(prefers-reduced-motion: reduce)', (e) => {
    prefersReducedMotion.value = e.matches
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => { if (rafId !== null) resize() })
    resizeObserver.observe(canvasRef.value)
  }
  hourTimer = setInterval(() => { currentHour.value = new Date().getHours() }, 60_000)
  start()
})

onUnmounted(() => {
  stop()
  stopReducedMotionWatch?.()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  resizeObserver?.disconnect()
  clearInterval(hourTimer)
})
</script>

<style scoped>
.animated-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.animated-background.is-contained {
  position: absolute;
}

.gradient-layer,
.aurora-layer,
.effect-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 시간대별 배경: 깊은 바탕색 + 은은한 빛 두 군데 (탁한 단색 대각선 그라디언트 대신) */
.gradient-layer {
  inset: -15%;
  width: 130%;
  height: 130%;
  background-color: var(--bg-base);
  background-image:
    radial-gradient(65% 50% at 25% 20%, var(--bg-glow-1), transparent 70%),
    radial-gradient(70% 55% at 80% 85%, var(--bg-glow-2), transparent 70%);
  animation: gradient-drift 40s ease-in-out infinite alternate;
}
.intensity-low.gradient-layer { opacity: 0.7; }
.intensity-medium.gradient-layer { opacity: 0.9; }
.intensity-high.gradient-layer { opacity: 1; }

.period-morning.theme-light { --bg-base: #eef4fb; --bg-glow-1: rgba(125, 211, 252, 0.45); --bg-glow-2: rgba(196, 181, 253, 0.35); }
.period-afternoon.theme-light { --bg-base: #f6f4ef; --bg-glow-1: rgba(253, 230, 138, 0.45); --bg-glow-2: rgba(147, 197, 253, 0.35); }
.period-evening.theme-light { --bg-base: #f7f1f0; --bg-glow-1: rgba(251, 182, 156, 0.45); --bg-glow-2: rgba(196, 181, 253, 0.4); }
.period-night.theme-light { --bg-base: #f1f2f7; --bg-glow-1: rgba(165, 180, 252, 0.4); --bg-glow-2: rgba(148, 163, 184, 0.3); }
.period-morning.theme-dark { --bg-base: #0b1220; --bg-glow-1: rgba(56, 189, 248, 0.22); --bg-glow-2: rgba(99, 102, 241, 0.2); }
.period-afternoon.theme-dark { --bg-base: #0e1116; --bg-glow-1: rgba(148, 163, 184, 0.2); --bg-glow-2: rgba(56, 189, 248, 0.14); }
.period-evening.theme-dark { --bg-base: #110f1c; --bg-glow-1: rgba(139, 92, 246, 0.22); --bg-glow-2: rgba(251, 146, 60, 0.2); }
.period-night.theme-dark { --bg-base: #070a14; --bg-glow-1: rgba(79, 70, 229, 0.22); --bg-glow-2: rgba(20, 184, 166, 0.11); }

@keyframes gradient-drift {
  from { transform: translate3d(-3%, -2%, 0); }
  to { transform: translate3d(3%, 2%, 0); }
}

/* 오로라 */
.aurora-layer { filter: blur(60px); }
.aurora-layer.intensity-low { opacity: 0.35; }
.aurora-layer.intensity-medium { opacity: 0.55; }
.aurora-layer.intensity-high { opacity: 0.8; }

.aurora-blob {
  position: absolute;
  width: 60vmax;
  height: 40vmax;
  border-radius: 50%;
  mix-blend-mode: screen;
  will-change: transform;
}
.theme-light .aurora-blob { mix-blend-mode: multiply; }

.aurora-blob--1 {
  top: -10%;
  left: -10%;
  background: radial-gradient(closest-side, rgba(34, 211, 238, 0.7), transparent);
  animation: aurora-1 26s ease-in-out infinite alternate;
}
.aurora-blob--2 {
  top: 20%;
  right: -15%;
  background: radial-gradient(closest-side, rgba(167, 139, 250, 0.7), transparent);
  animation: aurora-2 32s ease-in-out infinite alternate;
}
.aurora-blob--3 {
  bottom: -20%;
  left: 20%;
  background: radial-gradient(closest-side, rgba(52, 211, 153, 0.6), transparent);
  animation: aurora-3 38s ease-in-out infinite alternate;
}

@keyframes aurora-1 { to { transform: translate(25vw, 15vh) scale(1.2); } }
@keyframes aurora-2 { to { transform: translate(-30vw, 10vh) scale(0.85); } }
@keyframes aurora-3 { to { transform: translate(10vw, -20vh) scale(1.15); } }

@media (prefers-reduced-motion: reduce) {
  .gradient-layer,
  .aurora-blob {
    animation: none;
  }
}
</style>
