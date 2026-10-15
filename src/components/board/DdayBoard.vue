<template>
  <div class="board-mode">
    <BoardPicker
      :items="pickerItems"
      :current-id="current?.id"
      :label="t.pick"
      :add-label="t.add"
      :edit-label="t.edit"
      @select="id => { ddayId = id; draft = null }"
      @add="openEditor(null)"
      @edit="openEditor(current)"
    >
      <SplitFlapDisplay class="board-name" :text="centerPad(shown?.name ?? '', DDAY_NAME_MAX)" :label="t.name" />
    </BoardPicker>

    <SplitFlapDisplay class="board-big" :text="view?.hms ?? '--:--:--'" :label="t.time" />

    <p class="board-info">
      <template v-if="view"><b>{{ view.badge }}</b> · {{ dateLabel(view.target) }}</template>
      <template v-else-if="!draft">{{ t.empty }}</template>
    </p>

    <div v-if="!draft && !current" class="board-actions">
      <UiButton type="primary" :icon="PlusOutlined" @click="openEditor(null)">{{ t.add }}</UiButton>
    </div>

    <form v-if="draft" class="board-editor" @submit.prevent="save">
      <div class="board-field">
        <span class="board-field-label">{{ t.quick }}</span>
        <div class="board-presets">
          <button v-for="preset in presets" :key="preset.label" type="button" class="board-chip" @click="applyPreset(preset)">
            {{ preset.label }}
          </button>
        </div>
      </div>

      <div class="board-field">
        <span class="board-field-label">{{ t.nameField(DDAY_NAME_MAX) }}</span>
        <span class="board-field-row">
          <UiInput ref="nameInput" v-model:value="draft.name" :aria-label="t.nameField(DDAY_NAME_MAX)" :maxlength="DDAY_NAME_MAX" :placeholder="t.namePlaceholder" @input="error = ''" />
          <span class="board-count">{{ Array.from(draft.name).length }}/{{ DDAY_NAME_MAX }}</span>
        </span>
      </div>

      <div class="board-field">
        <span class="board-field-label">{{ t.dateField }}</span>
        <UiInput ref="dateInput" v-model:value="draft.date" :aria-label="t.dateField" type="date" @input="error = ''" />
      </div>

      <div class="board-field">
        <span class="board-field-label">{{ t.kindField }}</span>
        <div class="board-seg">
          <button type="button" :aria-pressed="draft.kind === 'until'" @click="draft.kind = 'until'">{{ t.until }}</button>
          <button type="button" :aria-pressed="draft.kind === 'since'" @click="draft.kind = 'since'">{{ t.since }}</button>
        </div>
      </div>

      <div v-if="draft.kind === 'until'" class="board-switch-row">
        <span>{{ t.yearly }}<small>{{ t.yearlyHint }}</small></span>
        <UiSwitch v-model:checked="draft.yearly" :aria-label="t.yearly" />
      </div>

      <p v-if="error" class="board-error" role="alert">{{ error }}</p>

      <div class="board-editor-buttons">
        <UiButton v-if="draft.id" class="board-delete" :icon="DeleteOutlined" :aria-label="t.remove" @click="remove" />
        <UiButton @click="draft = null">{{ t.cancel }}</UiButton>
        <UiButton type="primary" @click="save">{{ t.save }}</UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiSwitch from '@/components/ui/UiSwitch.vue'
import BoardPicker from '@/components/board/BoardPicker.vue'
import { useBoard, ddayView, centerPad, newId, DDAY_NAME_MAX, type Dday } from '@/composables/useBoard'
import { useLocale } from '@/composables/useLocale'
import '@/components/board/board.css'

/**
 * ## D-day 판
 *
 * 이름 / 남은(지난) 시:분:초를 판에, 날 수는 아래 한 줄에.
 */
const props = defineProps<{ now: Date }>()

const { isEn, pick } = useLocale()
const { ddays, ddayId } = useBoard(isEn.value)

const t = pick({
  ko: {
    pick: 'D-day 고르기', add: '새 D-day', edit: '지금 D-day 고치기', name: 'D-day', time: '남은 시간',
    empty: 'D-day를 추가해 보세요', quick: '빨리 고르기', nameField: (n: number) => `이름 (${n}자까지)`, namePlaceholder: '여행',
    dateField: '날짜', kindField: '세는 방법', until: '남은 날 (D-29)', since: '며칠째 (412일째)',
    yearly: '매년 반복', yearlyHint: '생일·기념일처럼 해마다 다음 그날까지',
    remove: '지우기', cancel: '취소', save: '저장', needName: '이름을 넣어 주세요', needDate: '날짜를 골라 주세요',
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
    presets: { newYear: '새해', xmas: '크리스마스', birthday: '생일', met: '만난 날' }
  },
  en: {
    pick: 'Choose a D-day', add: 'New D-day', edit: 'Edit this D-day', name: 'D-day', time: 'Time left',
    empty: 'Add your first D-day', quick: 'Quick pick', nameField: (n: number) => `Name (up to ${n})`, namePlaceholder: 'TRIP',
    dateField: 'Date', kindField: 'Count', until: 'Days left (D-29)', since: 'Day count (Day 412)',
    yearly: 'Every year', yearlyHint: 'Birthdays and anniversaries count to the next one',
    remove: 'Delete', cancel: 'Cancel', save: 'Save', needName: 'Enter a name', needDate: 'Choose a date',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    presets: { newYear: 'NEWYR', xmas: 'XMAS', birthday: 'BDAY', met: 'US' }
  }
})

type Draft = Omit<Dday, 'id'> & { id: string | null }
const draft = ref<Draft | null>(null)
const error = ref('')
const nameInput = ref<{ $el: HTMLElement } | null>(null)
const dateInput = ref<{ $el: HTMLElement } | null>(null)

const current = computed(() => ddays.value.find(d => d.id === ddayId.value) ?? ddays.value[0])
// 고치는 중이면 판이 고치는 내용을 미리 보여 줌
const shown = computed<Omit<Dday, 'id'> | undefined>(() => draft.value ?? current.value)
const view = computed(() => shown.value ? ddayView(shown.value, props.now, isEn.value) : null)

const pickerItems = computed(() => ddays.value.map(d => ({
  id: d.id,
  label: d.name,
  meta: ddayView(d, props.now, isEn.value)?.badge
})))

const dateLabel = (d: Date) => isEn.value
  ? `${t.value.weekdays[d.getDay()]}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  : `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${t.value.weekdays[d.getDay()]})`

const year = new Date().getFullYear()
const presets = computed(() => [
  { label: t.value.presets.newYear, name: t.value.presets.newYear, date: `${year + 1}-01-01`, kind: 'until' as const, yearly: true },
  { label: t.value.presets.xmas, name: t.value.presets.xmas, date: `${year}-12-25`, kind: 'until' as const, yearly: true },
  { label: t.value.presets.birthday, name: t.value.presets.birthday, date: '', kind: 'until' as const, yearly: true },
  { label: t.value.presets.met, name: t.value.presets.met, date: '', kind: 'since' as const, yearly: false }
])

const focusEl = (target: { $el: HTMLElement } | null) => target?.$el?.querySelector('input')?.focus()

const applyPreset = async (preset: typeof presets.value[number]) => {
  if (!draft.value) return
  draft.value.name = preset.name
  draft.value.kind = preset.kind
  draft.value.yearly = preset.yearly
  if (preset.date) draft.value.date = preset.date
  error.value = ''
  await nextTick()
  if (!preset.date) focusEl(dateInput.value)
}

const openEditor = async (item: Dday | null | undefined) => {
  error.value = ''
  draft.value = item
    ? { ...item }
    : { id: null, name: '', date: '', kind: 'until', yearly: false }
  await nextTick()
  focusEl(nameInput.value)
}

const save = () => {
  const d = draft.value
  if (!d) return
  const name = d.name.trim()
  if (!name) { error.value = t.value.needName; focusEl(nameInput.value); return }
  if (!d.date) { error.value = t.value.needDate; focusEl(dateInput.value); return }
  const item: Dday = { id: d.id ?? newId(), name, date: d.date, kind: d.kind, yearly: d.kind === 'until' && d.yearly }
  const index = ddays.value.findIndex(x => x.id === item.id)
  if (index >= 0) ddays.value[index] = item
  else ddays.value.push(item)
  ddayId.value = item.id
  draft.value = null
}

const remove = () => {
  const id = draft.value?.id
  ddays.value = ddays.value.filter(x => x.id !== id)
  ddayId.value = ddays.value[0]?.id ?? ''
  draft.value = null
}
</script>
