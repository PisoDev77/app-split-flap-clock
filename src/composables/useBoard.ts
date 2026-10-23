import { effectScope, ref, watch, type Ref } from 'vue'

/**
 * ## 플립 보드 상태
 *
 * 판에 띄울 것(시계·D-day·타이머·문구)과 각 목록을 기기 안(localStorage)에만 저장합니다.
 * 설계: `docs/FLIP-BOARD-PLAN.md`
 */

export type BoardMode = 'clock' | 'dday' | 'timer' | 'message'

export interface Dday {
  id: string
  name: string
  /** YYYY-MM-DD (기기 시간 기준) */
  date: string
  /** 시각 HH:mm (24시간, 선택). 없으면 그날 0시 */
  time?: string
  /** until: 남은 날(D-29), since: 며칠째(412일째) */
  kind: 'until' | 'since'
  /** 매년 반복(생일·기념일) */
  yearly: boolean
}

export interface TimerPreset {
  id: string
  name: string
  minutes: number
}

export interface TimerRun {
  presetId: string
  /** 돌아가는 중이면 끝나는 시각(ms), 멈췄으면 null */
  endAt: number | null
  /** 멈췄을 때 남은 초 */
  left: number
}

export interface Message {
  id: string
  lines: [string, string]
}

export const DDAY_NAME_MAX = 6
export const MESSAGE_LINE_MAX = 8

export const newId = (): string => Math.random().toString(36).slice(2, 10)

const load = <T>(key: string, fallback: () => T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // 저장값이 깨졌으면 기본값
  }
  return fallback()
}

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장이 안 돼도 이번 화면에서는 동작
  }
}

const persisted = <T>(key: string, fallback: () => T): Ref<T> => {
  const state = ref(load(key, fallback)) as Ref<T>
  // 기본값도 바로 저장 (안 그러면 다음에 열 때 id가 새로 생겨 고른 것이 풀림)
  save(key, state.value)
  watch(state, value => save(key, value), { deep: true })
  return state
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// ── 판 글자 ──

// 판 한 칸에 한 글자가 안 되는 것: 이모지 대부분(BMP 밖)·짝 없는 반쪽 글자·이모지 결합 기호.
// ♥ ★ ☀ 같은 한 글자 기호는 남김
const NOT_BOARD_CHAR = /[\u{10000}-\u{10FFFF}\uD800-\uDFFF\u200D\uFE0E\uFE0F\u20E3]/gu

/** 판에 못 띄우는 글자(이모지 등)를 뺌 */
export const boardText = (text: string) => text.replace(NOT_BOARD_CHAR, '')

/** 판에 띄울 글자로 다듬고 max 글자까지 자름 (저장할 때) */
export const clipBoard = (text: string, max: number) => Array.from(boardText(text).trim()).slice(0, max).join('')
export const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const defaultDdays = (isEn: boolean): Dday[] => [{
  id: newId(),
  name: isEn ? 'NEWYR' : '새해',
  date: `${new Date().getFullYear() + 1}-01-01`,
  kind: 'until',
  yearly: true
}]

const defaultTimers = (isEn: boolean): TimerPreset[] => isEn
  ? [
      { id: newId(), name: 'FOCUS', minutes: 25 },
      { id: newId(), name: 'BREAK', minutes: 5 },
      { id: newId(), name: 'NOODLE', minutes: 3 },
      { id: newId(), name: 'STUDY', minutes: 50 }
    ]
  : [
      { id: newId(), name: '집중', minutes: 25 },
      { id: newId(), name: '휴식', minutes: 5 },
      { id: newId(), name: '라면', minutes: 3 },
      { id: newId(), name: '공부', minutes: 50 }
    ]

const defaultMessages = (isEn: boolean): Message[] => isEn
  ? [
      { id: newId(), lines: ['HELLO', 'WORLD'] },
      { id: newId(), lines: ['IN A', 'MEETING'] }
    ]
  : [
      { id: newId(), lines: ['공부 중', '말 걸지 마'] },
      { id: newId(), lines: ['회의 중', '조용히'] }
    ]

const VALID_MODES: BoardMode[] = ['clock', 'dday', 'timer', 'message']

let state: ReturnType<typeof createState> | null = null
// 상태와 저장·타이머 감시는 앱 전체에서 삶 (처음 부른 화면이 사라져도 멈추지 않게)
const scope = effectScope(true)

// ── 타이머 끝 알림 (어느 화면에 있든) ──

let audio: AudioContext | null = null

/** 시작 버튼을 누를 때 부름 (브라우저는 사용자가 누른 뒤에만 소리를 허락) */
export const prepareSound = () => {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
  } catch {
    audio = null
  }
}

const ring = () => {
  navigator.vibrate?.([300, 150, 300, 150, 300])
  if (!audio) return
  for (let i = 0; i < 3; i++) {
    const start = audio.currentTime + i * 0.45
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)
    osc.connect(gain).connect(audio.destination)
    osc.start(start)
    osc.stop(start + 0.32)
  }
}

/** 끝난 지 이만큼 안에 알게 되면 울림. 더 늦게(앱을 한참 뒤에 엶) 알면 조용히 "끝"만 */
const LATE_RING_MS = 60000
const LATE_BANNER_MS = 10 * 60000

/** 방금 끝난 타이머 id. 소리를 못 들었어도(무음) 어느 화면에서든 띠로 알림 (TimerDoneBanner) */
export const timerDone = ref<string | null>(null)

const watchTimerEnd = (timerRun: Ref<TimerRun | null>) => {
  let endTimer: ReturnType<typeof setTimeout> | null = null
  const schedule = (endAt: number | null | undefined) => {
    if (endTimer) clearTimeout(endTimer)
    endTimer = null
    // 조금 늦게 걸어서 check에서 확실히 끝난 것으로 보이게
    if (endAt) {
      endTimer = setTimeout(check, Math.max(0, endAt - Date.now()) + 50)
      timerDone.value = null
    }
  }
  const check = () => {
    const run = timerRun.value
    if (!run?.endAt) return
    const late = Date.now() - run.endAt
    // 일찍 깨면(기기 시계가 뒤로 바뀜 등) 다시 걸기
    if (late < 0) { schedule(run.endAt); return }
    timerRun.value = { presetId: run.presetId, endAt: null, left: 0 }
    if (late <= LATE_RING_MS) ring()
    // 화면이 꺼져 있다 늦게 알아도 잠깐 뒤면 띠는 보여 줌 (한참 뒤에 연 거면 판의 "끝"만)
    if (late <= LATE_BANNER_MS) timerDone.value = run.presetId
  }
  watch(() => timerRun.value?.endAt, schedule, { immediate: true })
  // 화면이 꺼졌다 켜지거나 탭이 다시 보이면 바로 확인
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
}

const createState = (isEn: boolean) => {
  const mode = persisted<BoardMode>('board-mode', () => 'clock')
  if (!VALID_MODES.includes(mode.value)) mode.value = 'clock'

  const ddays = persisted<Dday[]>('board-ddays', () => defaultDdays(isEn))
  const ddayId = persisted<string>('board-dday-id', () => '')
  const timers = persisted<TimerPreset[]>('board-timers', () => defaultTimers(isEn))
  const timerRun = persisted<TimerRun | null>('board-timer-run', () => null)
  const messages = persisted<Message[]>('board-messages', () => defaultMessages(isEn))
  const messageId = persisted<string>('board-message-id', () => '')
  // 공유 링크로 받은 것: 저장하지 않고 판에 미리 보여 줌 ("내 목록에 추가"를 눌러야 저장)
  const incomingDday = ref<Omit<Dday, 'id'> | null>(null)
  const incomingMessage = ref<[string, string] | null>(null)

  watchTimerEnd(timerRun)

  return { mode, ddays, ddayId, timers, timerRun, messages, messageId, incomingDday, incomingMessage }
}

/** 처음 부른 화면의 언어로 기본 목록을 만듦 */
export function useBoard(isEn = false) {
  if (!state) state = scope.run(() => createState(isEn))!
  return state
}

// ── 계산 ──

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const DAY_MS = 86400000

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** 시각 칸 값(HH:mm 또는 HH:mm:ss)을 HH:mm으로 */
export const toDdayTime = (time: string | undefined) => (time ?? '').slice(0, 5)

/** HH:mm 시각이 맞는 모양인지 */
export const isDdayTime = (time: string | undefined): time is string => !!time && TIME_RE.test(time)

const parseDate = (iso: string, time?: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const hm = time ? TIME_RE.exec(toDdayTime(time)) : null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hm ? Number(hm[1]) : 0, hm ? Number(hm[2]) : 0)
}

/** 달력 날 수 차이 (서머타임에도 하루 단위가 맞게 반올림) */
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS)

/** 하루 안의 시:분:초 (날 수는 따로 보여 줌) */
export const formatHms = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad2(Math.floor(s % 86400 / 3600))}:${pad2(Math.floor(s % 3600 / 60))}:${pad2(s % 60)}`
}

/** D-day 큰 판 한 줄 칸 수 */
export const DDAY_BOARD_WIDTH = 8

/** 판 한 줄(8칸)에 맞추기: 넘치면 띄어쓰기를 빼고, 그래도 넘치면 short */
const fitBoard = (text: string, short: string) => {
  if (text.length <= DDAY_BOARD_WIDTH) return text
  const tight = text.replace(/ /g, '')
  return tight.length <= DDAY_BOARD_WIDTH ? tight : short
}

export interface DdayView {
  /** 큰 판 윗줄: 남은 날(65일) 또는 지났으면 배지(D-DAY, D+1, 657일째) */
  top: string
  /** 큰 판 아랫줄: 날을 뺀 나머지 시:분:초 (초마다 넘어감) */
  hms: string
  /** 아래 글: D-29, D-DAY, D+12, 412일째 (달력 날 기준) */
  badge: string
  /** 기준 날짜·시각 (매년 반복이면 다가오는 날) */
  target: Date
  /** 기준 시각이 지났는지 (판이 '지난 시간'을 보여 줌) */
  past: boolean
}

export const ddayView = (item: Pick<Dday, 'date' | 'time' | 'kind' | 'yearly'>, now: Date, isEn: boolean): DdayView | null => {
  const base = parseDate(item.date, item.time)
  if (!base) return null
  let target = base
  if (item.yearly && item.kind === 'until') {
    const atYear = (y: number) => new Date(y, base.getMonth(), base.getDate(), base.getHours(), base.getMinutes())
    target = atYear(now.getFullYear())
    // 그날(달력 날)이 지나야 다음 해로. 당일엔 시각이 지나도 D-DAY
    if (dayDiff(target, now) < 0) target = atYear(now.getFullYear() + 1)
  }
  const days = dayDiff(target, now)
  const ms = target.getTime() - now.getTime()
  const past = ms <= 0
  const seconds = Math.abs(ms) / 1000
  // 다가오는 날: 남은 시간. 지난 날·당일·며칠째: 지난 시간
  const hms = formatHms(seconds)

  let badge: string
  if (item.kind === 'since') {
    const n = -days + 1
    badge = n >= 1 ? (isEn ? `Day ${n}` : `${n}일째`) : `D-${days}`
  } else if (days > 0) badge = `D-${days}`
  else if (days === 0) badge = 'D-DAY'
  else badge = `D+${-days}`

  let top: string
  if (past) {
    const n = item.kind === 'since' ? -days + 1 : 0
    top = fitBoard(badge.toUpperCase(), `${n}D`)
  } else {
    const n = Math.floor(seconds / 86400)
    top = isEn ? fitBoard(`${n} ${n === 1 ? 'DAY' : 'DAYS'}`, `${n}D`) : `${n}일`
  }
  return { top, hms, badge, target, past }
}

/** 남은 초 → 25:00 또는 1:05:00 */
export const formatTimer = (seconds: number) => {
  const s = Math.max(0, Math.ceil(seconds))
  const h = Math.floor(s / 3600)
  const mm = pad2(Math.floor(s % 3600 / 60))
  const ss = pad2(s % 60)
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 판 한 줄을 정해진 칸 수에 가운데 맞춤 (칸 수가 바뀌면 플랩이 안 넘어가서) */
export const centerPad = (text: string, width: number) => {
  const chars = Array.from(boardText(text)).slice(0, width)
  const left = Math.floor((width - chars.length) / 2)
  return ' '.repeat(left) + chars.join('') + ' '.repeat(width - chars.length - left)
}
