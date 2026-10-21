<template>
  <div ref="root" class="board-mode">
    <BoardPicker
      :items="pickerItems"
      :current-id="current?.id"
      :label="t.pick"
      :add-label="t.add"
      :edit-label="t.edit"
      @select="id => { ddayId = id; draft = null; incomingDday = null }"
      @add="openEditor(null)"
      @edit="openEditor(current)"
    >
      <SplitFlapDisplay class="board-name" :text="centerPad(shown?.name ?? '', DDAY_NAME_MAX)" :label="t.name" />
    </BoardPicker>

    <!-- 윗줄 남은 날(65일) 또는 지난 배지(D-DAY), 아랫줄 나머지 시:분:초 -->
    <div class="board-lines">
      <SplitFlapDisplay class="board-big" :text="centerPad(view?.top ?? '', DDAY_BOARD_WIDTH)" :label="view?.past ? t.badgeLabel : t.daysLeft" />
      <SplitFlapDisplay class="board-big" :text="view?.hms ?? '--:--:--'" :label="view?.past ? t.timePast : t.time" />
    </div>

    <p class="board-info">
      <template v-if="view"><b>{{ view.badge }}</b> · {{ dateLabel(view.target) }}<template v-if="isDdayTime(toDdayTime(shown?.time))">{{ ' ' + timeLabel(view.target) }}</template></template>
      <template v-else-if="!draft">{{ t.empty }}</template>
    </p>

    <div v-if="incomingDday && !draft" class="board-actions">
      <UiButton @click="incomingDday = null">{{ t.close }}</UiButton>
      <UiButton type="primary" :icon="PlusOutlined" @click="addIncoming">{{ t.addShared }}</UiButton>
    </div>

    <div v-else-if="!draft && !current" class="board-actions">
      <UiButton type="primary" :icon="PlusOutlined" @click="openEditor(null)">{{ t.add }}</UiButton>
    </div>

    <div v-else-if="!draft" class="board-actions">
      <BoardPicker
        :items="pickerItems"
        :current-id="current?.id"
        :label="t.pick"
        :add-label="t.add"
        @select="id => { ddayId = id; incomingDday = null }"
        @add="openEditor(null)"
      >
        <span class="board-list-trigger"><UnorderedListOutlined aria-hidden="true" /> {{ t.mine }}</span>
      </BoardPicker>
      <UiButton :icon="EditOutlined" class="board-edit-btn" @click="openEditor(current)">{{ t.editShort }}</UiButton>
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

      <div class="board-field-pair">
        <div class="board-field">
          <span class="board-field-label">{{ t.dateField }}</span>
          <UiInput ref="dateInput" v-model:value="draft.date" :aria-label="t.dateField" type="date" @input="error = ''" />
        </div>
        <div class="board-field">
          <span class="board-field-label">{{ t.timeField }}</span>
          <UiInput v-model:value="draft.time" :aria-label="t.timeField" type="time" />
          <button v-if="draft.time" type="button" class="board-time-clear" @click="draft.time = ''">{{ t.timeClear }}</button>
        </div>
      </div>

      <div class="board-field">
        <span class="board-field-label">{{ t.kindField }}</span>
        <div class="board-seg">
          <button type="button" :aria-pressed="draft.kind === 'until'" @click="draft.kind = 'until'">{{ t.until }}</button>
          <button type="button" :aria-pressed="draft.kind === 'since'" @click="draft.kind = 'since'">{{ t.since }}</button>
        </div>
      </div>

      <!-- 줄 전체가 스위치 (label 안 버튼이라 글자를 눌러도 켜짐) -->
      <label v-if="draft.kind === 'until'" class="board-switch-row">
        <span>{{ t.yearly }}<small>{{ t.yearlyHint }}</small></span>
        <UiSwitch v-model:checked="draft.yearly" :aria-label="t.yearly" />
      </label>

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
import { computed, nextTick, ref, watch } from 'vue'
import { PlusOutlined, DeleteOutlined, EditOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiSwitch from '@/components/ui/UiSwitch.vue'
import BoardPicker from '@/components/board/BoardPicker.vue'
import { useBoard, ddayView, centerPad, newId, boardText, clipBoard, isDdayTime, toDdayTime, DDAY_NAME_MAX, DDAY_BOARD_WIDTH, type Dday } from '@/composables/useBoard'
import { useSettings } from '@/composables/useSettings'
import { useLocale } from '@/composables/useLocale'
import { message } from '@/composables/useToast'
import '@/components/board/board.css'

/**
 * ## D-day 판
 *
 * 이름 / 큰 판 두 줄(남은 날 · 나머지 시:분:초)을 판에, D-29 배지는 아래 한 줄에.
 * 시각(선택)이 없으면 그날 0시 기준.
 */
const props = defineProps<{ now: Date }>()

const { isEn, pick } = useLocale()
const { ddays, ddayId, incomingDday } = useBoard(isEn.value)
const { settings } = useSettings()

const t = pick({
  ko: {
    pick: 'D-day 고르기', add: '새 D-day', edit: '지금 D-day 고치기', name: 'D-day', time: '남은 시간',
    mine: '내 D-day', editShort: '고치기', daysLeft: '남은 날', badgeLabel: 'D-day', timePast: '지난 시간',
    timeField: '시각 (선택)', timeClear: '시각 빼기', am: '오전', pm: '오후',
    empty: 'D-day를 추가해 보세요', quick: '빨리 고르기', nameField: (n: number) => `이름 (${n}자까지)`, namePlaceholder: '여행',
    dateField: '날짜', kindField: '세는 방법', until: '남은 날 (D-29)', since: '며칠째 (412일째)',
    yearly: '매년 반복', yearlyHint: '생일·기념일처럼 해마다 다음 그날까지',
    addShared: '내 D-day에 추가', close: '닫기', added: '내 D-day에 추가했어요',
    remove: '지우기', cancel: '취소', save: '저장', needName: '이름을 넣어 주세요', needDate: '날짜를 골라 주세요',
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
    presets: { newYear: '새해', xmas: '크리스마스', birthday: '생일', met: '만난 날' }
  },
  en: {
    pick: 'Choose a D-day', add: 'New D-day', edit: 'Edit this D-day', name: 'D-day', time: 'Time left',
    mine: 'My D-days', editShort: 'Edit', daysLeft: 'Days left', badgeLabel: 'D-day', timePast: 'Time since',
    timeField: 'Time (optional)', timeClear: 'Remove time', am: 'AM', pm: 'PM',
    empty: 'Add your first D-day', quick: 'Quick pick', nameField: (n: number) => `Name (up to ${n})`, namePlaceholder: 'TRIP',
    dateField: 'Date', kindField: 'Count', until: 'Days left (D-29)', since: 'Day count (Day 412)',
    yearly: 'Every year', yearlyHint: 'Birthdays and anniversaries count to the next one',
    addShared: 'Add to my D-days', close: 'Close', added: 'Added to your D-days',
    remove: 'Delete', cancel: 'Cancel', save: 'Save', needName: 'Enter a name', needDate: 'Choose a date',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    presets: { newYear: 'NEWYR', xmas: 'XMAS', birthday: 'BDAY', met: 'US' }
  }
})

// 편집 중 시각은 빈 문자열 = 없음
type Draft = Omit<Dday, 'id' | 'time'> & { id: string | null, time: string }
const draft = ref<Draft | null>(null)
// 고치기를 닫으면(저장·취소·지우기) 화면을 맨 위로: 편집 때 내려간 채라 ☰·⚙가 반쯤 가려졌음
watch(() => !!draft.value, (open, wasOpen) => {
  if (wasOpen && !open) window.scrollTo({ top: 0, behavior: 'smooth' })
})
const error = ref('')
const root = ref<HTMLElement | null>(null)
const nameInput = ref<{ $el: HTMLElement } | null>(null)
const dateInput = ref<{ $el: HTMLElement } | null>(null)

const current = computed(() => ddays.value.find(d => d.id === ddayId.value) ?? ddays.value[0])
// 고치는 중이면 고치는 내용, 공유받은 게 있으면 그것을 판에 미리 보여 줌
const shown = computed<Omit<Dday, 'id'> | undefined>(() => draft.value ?? incomingDday.value ?? current.value)
const view = computed(() => shown.value ? ddayView(shown.value, props.now, isEn.value) : null)

const pickerItems = computed(() => ddays.value.map(d => ({
  id: d.id,
  label: d.name,
  meta: ddayView(d, props.now, isEn.value)?.badge
})))

const dateLabel = (d: Date) => isEn.value
  ? `${t.value.weekdays[d.getDay()]}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  : `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${t.value.weekdays[d.getDay()]})`

// 시각은 설정(12/24시간)을 따름
const timeLabel = (d: Date) => {
  const h = d.getHours()
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (settings.value.timeFormat !== '12h') return `${String(h).padStart(2, '0')}:${mm}`
  const ampm = h < 12 ? t.value.am : t.value.pm
  return isEn.value ? `${(h % 12) || 12}:${mm} ${ampm}` : `${ampm} ${(h % 12) || 12}:${mm}`
}

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

const addIncoming = () => {
  if (!incomingDday.value) return
  const item: Dday = { id: newId(), ...incomingDday.value }
  ddays.value.push(item)
  ddayId.value = item.id
  incomingDday.value = null
  message.success(t.value.added)
}

// 판에 못 띄우는 글자(이모지)는 칠 때 바로 뺌
watch(() => draft.value?.name, name => {
  if (draft.value && name !== undefined && boardText(name) !== name) draft.value.name = boardText(name)
})

const openEditor = async (item: Dday | null | undefined) => {
  incomingDday.value = null
  error.value = ''
  draft.value = item
    ? { ...item, time: item.time ?? '' }
    : { id: null, name: '', date: '', time: '', kind: 'until', yearly: false }
  await nextTick()
  // 판(미리보기)이 화면 위에 남게
  root.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  // 새로 만들 때만 이름에 커서 (고치기는 키보드가 판을 밀어 올리지 않게)
  if (!item) focusEl(nameInput.value)
}

const save = () => {
  const d = draft.value
  if (!d) return
  const name = clipBoard(d.name, DDAY_NAME_MAX)
  if (!name) { error.value = t.value.needName; focusEl(nameInput.value); return }
  if (!d.date) { error.value = t.value.needDate; focusEl(dateInput.value); return }
  const item: Dday = { id: d.id ?? newId(), name, date: d.date, kind: d.kind, yearly: d.kind === 'until' && d.yearly }
  // 시각이 없으면 칸을 아예 안 씀 (옛 데이터와 같은 모양)
  const time = toDdayTime(d.time)
  if (isDdayTime(time)) item.time = time
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
