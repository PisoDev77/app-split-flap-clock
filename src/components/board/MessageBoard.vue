<template>
  <div class="board-mode">
    <div class="board-lines">
      <SplitFlapDisplay class="board-big" :text="centerPad(shownLines[0], MESSAGE_LINE_MAX)" :label="t.line1" />
      <SplitFlapDisplay class="board-big" :text="centerPad(shownLines[1], MESSAGE_LINE_MAX)" :label="t.line2" />
    </div>

    <div v-if="incomingMessage && !draft" class="board-actions">
      <UiButton @click="incomingMessage = null">{{ t.close }}</UiButton>
      <UiButton type="primary" :icon="PlusOutlined" @click="addIncoming">{{ t.addShared }}</UiButton>
    </div>

    <div v-else-if="!draft" class="board-actions">
      <BoardPicker
        :items="pickerItems"
        :current-id="current?.id"
        :label="t.pick"
        :add-label="t.add"
        @select="id => { messageId = id; incomingMessage = null }"
        @add="openEditor(null)"
      >
        <span class="board-list-trigger"><UnorderedListOutlined aria-hidden="true" /> {{ t.saved }}</span>
      </BoardPicker>
      <UiButton :icon="EditOutlined" class="board-edit-btn" @click="openEditor(current)">{{ current ? t.edit : t.add }}</UiButton>
    </div>

    <form v-if="draft" ref="form" class="board-editor" @submit.prevent="save">
      <div class="board-field">
        <span class="board-field-label">{{ t.quick }}</span>
        <div class="board-presets">
          <button v-for="preset in t.presets" :key="preset.join('/')" type="button" class="board-chip" @click="draft.lines = [...preset]">
            {{ preset[0] }}
          </button>
        </div>
      </div>
      <div v-for="(_, i) in draft.lines" :key="i" class="board-field">
        <span class="board-field-label">{{ i === 0 ? t.line1 : t.line2 }}</span>
        <span class="board-field-row">
          <UiInput
            v-model:value="draft.lines[i]"
            :aria-label="i === 0 ? t.line1 : t.line2"
            :maxlength="MESSAGE_LINE_MAX"
            :placeholder="i === 0 ? t.placeholder1 : t.placeholder2"
            @input="error = ''"
          />
          <span class="board-count">{{ Array.from(draft.lines[i]).length }}/{{ MESSAGE_LINE_MAX }}</span>
        </span>
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
import { computed, nextTick, ref, watch } from 'vue'
import { EditOutlined, DeleteOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons-vue'
import SplitFlapDisplay from '@/components/SplitFlapDisplay.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import BoardPicker from '@/components/board/BoardPicker.vue'
import { useBoard, centerPad, newId, boardText, clipBoard, MESSAGE_LINE_MAX, type Message } from '@/composables/useBoard'
import { useLocale } from '@/composables/useLocale'
import { message } from '@/composables/useToast'
import '@/components/board/board.css'

/**
 * ## 문구 판
 *
 * 두 줄 × 8자. 고치는 동안 치는 대로 판이 넘어감.
 */
const { isEn, pick } = useLocale()
const { messages, messageId, incomingMessage } = useBoard(isEn.value)

const t = pick({
  ko: {
    pick: '저장한 문구', saved: '저장한 문구', add: '새 문구', edit: '고치기', quick: '빨리 고르기',
    line1: '첫 줄', line2: '둘째 줄', placeholder1: '공부 중', placeholder2: '말 걸지 마',
    addShared: '내 문구에 추가', close: '닫기', added: '내 문구에 추가했어요',
    remove: '지우기', cancel: '취소', save: '저장', needText: '한 줄은 넣어 주세요',
    presets: [['공부 중', '말 걸지 마'], ['퇴근', 'HAPPY'], ['사랑해', '♥♥♥'], ['OPEN', '어서 오세요']] as [string, string][]
  },
  en: {
    pick: 'Saved messages', saved: 'Saved', add: 'New message', edit: 'Edit', quick: 'Quick pick',
    line1: 'Line 1', line2: 'Line 2', placeholder1: 'DO NOT', placeholder2: 'DISTURB',
    addShared: 'Add to my messages', close: 'Close', added: 'Added to your messages',
    remove: 'Delete', cancel: 'Cancel', save: 'Save', needText: 'Write at least one line',
    presets: [['DO NOT', 'DISTURB'], ['WELCOME', 'HOME'], ['I LOVE', 'YOU'], ['WE ARE', 'OPEN']] as [string, string][]
  }
})

const draft = ref<{ id: string | null, lines: [string, string] } | null>(null)
const error = ref('')
const form = ref<HTMLFormElement | null>(null)

const current = computed(() => messages.value.find(m => m.id === messageId.value) ?? messages.value[0])
// 판은 대문자 (공항 안내판처럼)
const shownLines = computed(() => (draft.value?.lines ?? incomingMessage.value ?? current.value?.lines ?? ['', '']).map(line => line.toUpperCase()))

const pickerItems = computed(() => messages.value.map(m => ({ id: m.id, label: m.lines.filter(Boolean).join(' / ') })))

const addIncoming = () => {
  if (!incomingMessage.value) return
  const item: Message = { id: newId(), lines: [...incomingMessage.value] }
  messages.value.push(item)
  messageId.value = item.id
  incomingMessage.value = null
  message.success(t.value.added)
}

// 판에 못 띄우는 글자(이모지)는 칠 때 바로 뺌
watch(() => draft.value?.lines, lines => {
  lines?.forEach((line, i) => { if (boardText(line) !== line) lines[i] = boardText(line) })
}, { deep: true })

const openEditor = async (item: Message | undefined | null) => {
  incomingMessage.value = null
  error.value = ''
  draft.value = item ? { id: item.id, lines: [...item.lines] } : { id: null, lines: ['', ''] }
  await nextTick()
  form.value?.querySelector('input')?.focus()
}

const save = () => {
  const d = draft.value
  if (!d) return
  const lines = d.lines.map(line => clipBoard(line, MESSAGE_LINE_MAX)) as [string, string]
  if (!lines[0] && !lines[1]) { error.value = t.value.needText; return }
  const item: Message = { id: d.id ?? newId(), lines }
  const index = messages.value.findIndex(m => m.id === item.id)
  if (index >= 0) messages.value[index] = item
  else messages.value.push(item)
  messageId.value = item.id
  draft.value = null
}

const remove = () => {
  const id = draft.value?.id
  messages.value = messages.value.filter(m => m.id !== id)
  messageId.value = messages.value[0]?.id ?? ''
  draft.value = null
}
</script>
