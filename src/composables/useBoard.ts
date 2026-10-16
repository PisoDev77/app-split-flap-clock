import { ref, watch, type Ref } from 'vue'

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
  /** YYYY-MM-DD (기기 시간 자정 기준) */
  date: string
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

  return { mode, ddays, ddayId, timers, timerRun, messages, messageId, incomingDday, incomingMessage }
}

/** 처음 부른 화면의 언어로 기본 목록을 만듦 */
export function useBoard(isEn = false) {
  if (!state) state = createState(isEn)
  return state
}

// ── 계산 ──

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const DAY_MS = 86400000

const parseDate = (iso: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** 달력 날 수 차이 (서머타임에도 하루 단위가 맞게 반올림) */
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS)

export const formatHms = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad2(Math.floor(s % 86400 / 3600))}:${pad2(Math.floor(s % 3600 / 60))}:${pad2(s % 60)}`
}

export interface DdayView {
  /** 판에 넘어가는 시:분:초 */
  hms: string
  /** D-29, D-DAY, D+12, 412일째 */
  badge: string
  /** 기준 날짜 (매년 반복이면 다가오는 날) */
  target: Date
}

export const ddayView = (item: Pick<Dday, 'date' | 'kind' | 'yearly'>, now: Date, isEn: boolean): DdayView | null => {
  const base = parseDate(item.date)
  if (!base) return null
  let target = base
  if (item.yearly && item.kind === 'until') {
    target = new Date(now.getFullYear(), base.getMonth(), base.getDate())
    if (dayDiff(target, now) < 0) target = new Date(now.getFullYear() + 1, base.getMonth(), base.getDate())
  }
  const days = dayDiff(target, now)
  const ms = target.getTime() - now.getTime()
  // 다가오는 날: 남은 시간. 지난 날·당일·며칠째: 지난 시간(오늘 몇 시간째)
  const hms = formatHms(Math.abs(ms) / 1000)

  if (item.kind === 'since') {
    const n = -days + 1
    return { hms, target, badge: n >= 1 ? (isEn ? `Day ${n}` : `${n}일째`) : `D-${days}` }
  }
  if (days > 0) return { hms, target, badge: `D-${days}` }
  if (days === 0) return { hms, target, badge: 'D-DAY' }
  return { hms, target, badge: `D+${-days}` }
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
  const chars = Array.from(text).slice(0, width)
  const left = Math.floor((width - chars.length) / 2)
  return ' '.repeat(left) + chars.join('') + ' '.repeat(width - chars.length - left)
}
