<template>
  <div class="board-mode">
    <BoardPicker
      :items="pickerItems"
      :current-id="preset?.id"
      :label="t.pick"
      :add-label="t.add"
      :edit-label="t.edit"
      @select="choose"
      @add="openEditor(null)"
      @edit="openEditor(preset)"
    >
      <SplitFlapDisplay class="board-name" :text="centerPad(nameText, NAME_MAX)" :label="t.name" />
    </BoardPicker>

    <SplitFlapDisplay class="board-big" :text="formatTimer(remaining)" :label="t.left" />

    <p class="board-info" aria-live="polite">
      <b v-if="finished">{{ t.done(preset?.name ?? '') }}</b>
      <template v-else-if="running"><b>{{ endTime }}</b>{{ t.endsAt }}</template>
      <template v-else-if="paused">{{ t.paused(formatTimer(remaining)) }}</template>
      <template v-else-if="preset">{{ t.minutes(preset.minutes) }}</template>
    </p>

    <div v-if="preset && !draft" class="board-actions">
      <button type="button" class="timer-btn" :aria-label="t.reset" :title="t.reset" @click="reset">
        <ReloadOutlined aria-hidden="true" />
      </button>
      <button type="button" class="timer-btn timer-btn--main" :aria-label="running ? t.pause : t.start" @click="toggle">
        <PauseOutlined v-if="running" aria-hidden="true" />
        <CaretRightFilled v-else aria-hidden="true" />
      </button>
      <button type="button" class="timer-btn" :aria-label="t.plusLabel" :title="t.plusLabel" @click="addMinute">
        <span class="timer-plus">+1</span>
      </button>
    </div>

    <form v-if="draft" class="board-editor" @submit.prevent="save">
      <div class="board-field">
        <span class="board-field-label">{{ t.nameField(NAME_MAX) }}</span>
        <span class="board-field-row">
          <UiInput ref="nameInput" v-model:value="draft.name" :aria-label="t.nameField(NAME_MAX)" :maxlength="NAME_MAX" :placeholder="t.namePlaceholder" @input="error = ''" />
          <span class="board-count">{{ Array.from(draft.name).length }}/{{ NAME_MAX }}</span>
        </span>
      </div>
      <div class="board-field">
        <span class="board-field-label">{{ t.minutesField }}</span>
        <div class="board-presets">
          <button v-for="m in [1, 3, 5, 10, 15, 25, 30, 50, 60, 90]" :key="m" type="button" class="board-chip" :aria-pressed="draft.minutes === m" @click="draft.minutes = m">
            {{ t.minutes(m) }}
          </button>
        </div>
        <UiInput v-model:value="minutesText" type="number" inputmode="numeric" min="1" max="600" :aria-label="t.minutesField" />
      </div>

      <p v-if="error" class="board-error" role="alert">{{ error }}</p>

      <div class="board-editor-buttons">
        <UiButton v-if="draft.id && timers.length > 1" class="board-delete" :icon="DeleteOutlined" :aria-label="t.remove" @click="remove" />
        <UiButton @click="draft = null">{{ t.cancel }}</UiButton>
        <UiButton type="primary" @click="save">{{ t.save }}</UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ReloadOutlined, PauseOutlined, CaretRightFilled, DeleteOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import BoardPicker from '@/components/board/BoardPicker.vue'
import { useBoard, formatTimer, centerPad, newId, boardText, clipBoard, prepareSound, type TimerPreset } from '@/composables/useBoard'
import { useLocale } from '@/composables/useLocale'
import '@/components/board/board.css'

/**
 * ## 타이머 판
 *
 * 끝나는 시각을 저장해서 새로고침해도 이어짐. 끝나면 판 "끝".
 * 소리 3번·진동은 다른 모드·화면에 있어도 울리게 useBoard가 맡음.
 */
const props = defineProps<{ now: Date }>()

const NAME_MAX = 6

const { isEn, pick } = useLocale()
const { timers, timerRun } = useBoard(isEn.value)

const t = pick({
  ko: {
    pick: '타이머 고르기', add: '새 타이머', edit: '지금 타이머 고치기', name: '타이머', left: '남은 시간',
    done: (name: string) => `${name} 끝`, doneFlap: '끝', endsAt: '에 끝나요', paused: (left: string) => `멈춤 · ${left} 남음`,
    minutes: (m: number) => `${m}분`, reset: '처음으로', start: '시작', pause: '멈춤', plusLabel: '1분 더',
    nameField: (n: number) => `이름 (${n}자까지)`, namePlaceholder: '운동', minutesField: '시간 (분)',
    remove: '지우기', cancel: '취소', save: '저장', needName: '이름을 넣어 주세요', needMinutes: '1~600분 사이로 넣어 주세요',
    am: '오전', pm: '오후'
  },
  en: {
    pick: 'Choose a timer', add: 'New timer', edit: 'Edit this timer', name: 'Timer', left: 'Time left',
    done: (name: string) => `${name} done`, doneFlap: 'DONE', endsAt: '', paused: (left: string) => `Paused · ${left} left`,
    minutes: (m: number) => `${m} min`, reset: 'Reset', start: 'Start', pause: 'Pause', plusLabel: 'Add 1 minute',
    nameField: (n: number) => `Name (up to ${n})`, namePlaceholder: 'WORKOUT', minutesField: 'Minutes',
    remove: 'Delete', cancel: 'Cancel', save: 'Save', needName: 'Enter a name', needMinutes: 'Enter 1 to 600 minutes',
    am: 'AM', pm: 'PM'
  }
})

const preset = computed(() => timers.value.find(x => x.id === timerRun.value?.presetId) ?? timers.value[0])

const remaining = computed(() => {
  const run = timerRun.value
  if (!run || run.presetId !== preset.value?.id) return (preset.value?.minutes ?? 0) * 60
  if (run.endAt) return Math.max(0, (run.endAt - props.now.getTime()) / 1000)
  return run.left
})
const running = computed(() => !!timerRun.value?.endAt && remaining.value > 0)
const finished = computed(() => !!timerRun.value && timerRun.value.presetId === preset.value?.id && remaining.value <= 0)
const paused = computed(() => !running.value && !finished.value && !!preset.value && remaining.value !== preset.value.minutes * 60)

const nameText = computed(() => draft.value?.name ?? (finished.value ? t.value.doneFlap : preset.value?.name ?? ''))

const endTime = computed(() => {
  const end = timerRun.value?.endAt
  if (!end) return ''
  const d = new Date(end)
  const h = d.getHours()
  const mm = String(d.getMinutes()).padStart(2, '0')
  return isEn.value
    ? `Ends at ${(h % 12) || 12}:${mm} ${h < 12 ? t.value.am : t.value.pm}`
    : `${h < 12 ? t.value.am : t.value.pm} ${(h % 12) || 12}:${mm}`
})

const pickerItems = computed(() => timers.value.map(x => ({ id: x.id, label: x.name, meta: t.value.minutes(x.minutes) })))

// ── 조작 ──
const choose = (id: string) => {
  const p = timers.value.find(x => x.id === id)
  if (p) timerRun.value = { presetId: p.id, endAt: null, left: p.minutes * 60 }
}

const reset = () => { if (preset.value) choose(preset.value.id) }

const toggle = () => {
  const p = preset.value
  if (!p) return
  prepareSound()
  if (running.value) {
    timerRun.value = { presetId: p.id, endAt: null, left: Math.ceil(remaining.value) }
    return
  }
  const left = finished.value ? p.minutes * 60 : remaining.value
  timerRun.value = { presetId: p.id, endAt: Date.now() + left * 1000, left }
}

const addMinute = () => {
  const p = preset.value
  if (!p) return
  const run = timerRun.value
  if (running.value && run?.endAt) timerRun.value = { ...run, endAt: run.endAt + 60000 }
  else timerRun.value = { presetId: p.id, endAt: null, left: Math.ceil(remaining.value) + 60 }
}

// ── 고치기 ──
type Draft = Omit<TimerPreset, 'id'> & { id: string | null }
const draft = ref<Draft | null>(null)
const error = ref('')
const nameInput = ref<{ $el: HTMLElement } | null>(null)
const minutesText = computed({
  get: () => draft.value ? String(draft.value.minutes || '') : '',
  set: (value: string) => { if (draft.value) { draft.value.minutes = Number(value); error.value = '' } }
})

// 판에 못 띄우는 글자(이모지)는 칠 때 바로 뺌
watch(() => draft.value?.name, name => {
  if (draft.value && name !== undefined && boardText(name) !== name) draft.value.name = boardText(name)
})

const openEditor = async (item: TimerPreset | null | undefined) => {
  error.value = ''
  draft.value = item ? { ...item } : { id: null, name: '', minutes: 10 }
  await nextTick()
  nameInput.value?.$el?.querySelector('input')?.focus()
}

const save = () => {
  const d = draft.value
  if (!d) return
  const name = clipBoard(d.name, NAME_MAX)
  if (!name) { error.value = t.value.needName; return }
  const minutes = Math.round(d.minutes)
  if (!(minutes >= 1 && minutes <= 600)) { error.value = t.value.needMinutes; return }
  const item: TimerPreset = { id: d.id ?? newId(), name, minutes }
  const index = timers.value.findIndex(x => x.id === item.id)
  if (index >= 0) timers.value[index] = item
  else timers.value.push(item)
  draft.value = null
  choose(item.id)
}

const remove = () => {
  const id = draft.value?.id
  timers.value = timers.value.filter(x => x.id !== id)
  draft.value = null
  reset()
}
</script>

<style scoped>
.timer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  background: rgba(var(--color-canvas-default-rgb), 0.6);
  color: var(--color-fg-default);
  font-size: 18px;
  cursor: pointer;
}

.timer-btn--main {
  width: 64px;
  height: 64px;
  border: none;
  background: var(--color-fg-default);
  color: var(--color-canvas-default);
  font-size: 26px;
}

.timer-btn:focus-visible {
  outline: 2px solid var(--color-accent-fg);
  outline-offset: 2px;
}

.timer-plus {
  font-size: 14px;
  font-weight: 700;
}
</style>
