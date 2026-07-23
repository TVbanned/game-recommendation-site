<template>
  <div class="rounded-xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
    <div class="flex flex-wrap items-center gap-2 border-b border-indigo-100 bg-indigo-50/70 px-3 py-3">
      <button
        v-for="action in basicActions"
        :key="action.label"
        type="button"
        class="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50"
        @mousedown.prevent
        @click="applyCommand(action.command, action.value)"
      >
        <i :class="action.icon" class="mr-1"></i>{{ action.label }}
      </button>

      <button
        type="button"
        class="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50"
        @mousedown.prevent
        @click="insertDivider"
      >
        <i class="fas fa-minus mr-1"></i>分割线
      </button>

      <button
        type="button"
        class="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50"
        @mousedown.prevent
        @click="triggerImageUpload"
      >
        <i class="fas fa-image mr-1"></i>上传图片
      </button>

      <div class="flex items-center gap-2 ml-auto w-full md:w-auto">
        <input
          v-model="linkUrl"
          type="url"
          placeholder="https:// 链接地址"
          class="min-w-0 flex-1 md:w-64 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
          @focus="saveSelection"
        >
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          @mousedown.prevent
          @click="insertLink"
        >
          插入链接
        </button>
      </div>
    </div>

    <div
      ref="editorRef"
      class="rich-editor min-h-[260px] max-h-[560px] overflow-y-auto px-4 py-3 text-sm leading-7 text-slate-700 focus:outline-none"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
      @blur="saveSelection"
      @keyup="saveSelection"
      @mouseup="saveSelection"
      @paste="handlePaste"
    ></div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
const fileInputRef = ref(null)
const linkUrl = ref('')
let savedRange = null

const basicActions = [
  { label: '加粗', icon: 'fas fa-bold', command: 'bold' },
  { label: '斜体', icon: 'fas fa-italic', command: 'italic' },
  { label: '标题', icon: 'fas fa-heading', command: 'formatBlock', value: 'h3' },
  { label: '引用', icon: 'fas fa-quote-left', command: 'formatBlock', value: 'blockquote' },
  { label: '无序列表', icon: 'fas fa-list-ul', command: 'insertUnorderedList' },
  { label: '有序列表', icon: 'fas fa-list-ol', command: 'insertOrderedList' }
]

const normalizeLinks = () => {
  if (!editorRef.value) return
  editorRef.value.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })
}

const emitValue = () => {
  if (!editorRef.value) return
  normalizeLinks()
  emit('update:modelValue', editorRef.value.innerHTML)
}

const saveSelection = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !editorRef.value) return
  const range = selection.getRangeAt(0)
  if (editorRef.value.contains(range.commonAncestorContainer)) {
    savedRange = range.cloneRange()
  }
}

const restoreSelection = () => {
  if (!savedRange) return
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  selection.addRange(savedRange)
}

const focusEditor = () => {
  editorRef.value?.focus()
}

const applyCommand = (command, value = null) => {
  focusEditor()
  restoreSelection()
  document.execCommand(command, false, value)
  emitValue()
  nextTick(saveSelection)
}

const insertHtml = (html) => {
  focusEditor()
  restoreSelection()
  document.execCommand('insertHTML', false, html)
  emitValue()
  nextTick(saveSelection)
}

const insertDivider = () => {
  insertHtml('<hr>')
}

const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

const insertImages = async (files) => {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    insertHtml(`<p><img src="${dataUrl}" alt="${file.name}" /></p>`)
  }
}

const handleFileChange = async (event) => {
  const files = Array.from(event.target.files || [])
  await insertImages(files)
  event.target.value = ''
}

const handlePaste = async (event) => {
  const items = Array.from(event.clipboardData?.items || [])
  const imageFiles = items
    .filter(item => item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean)

  if (imageFiles.length > 0) {
    event.preventDefault()
    await insertImages(imageFiles)
  }
}

const insertLink = () => {
  const url = linkUrl.value.trim()
  if (!url) return

  focusEditor()
  restoreSelection()

  const selection = window.getSelection()
  const hasSelection = selection && !selection.isCollapsed

  if (hasSelection) {
    document.execCommand('createLink', false, url)
    normalizeLinks()
  } else {
    insertHtml(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
  }

  emitValue()
  linkUrl.value = ''
  nextTick(saveSelection)
}

const handleInput = () => {
  emitValue()
  saveSelection()
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editorRef.value) return
    const nextValue = value || ''
    if (editorRef.value.innerHTML !== nextValue) {
      editorRef.value.innerHTML = nextValue
      normalizeLinks()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (editorRef.value && editorRef.value.innerHTML !== props.modelValue) {
    editorRef.value.innerHTML = props.modelValue || ''
    normalizeLinks()
  }
})
</script>

<style scoped>
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
}

.rich-editor :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 1rem 0 0.75rem;
}

.rich-editor :deep(blockquote) {
  border-left: 4px solid #818cf8;
  padding-left: 1rem;
  color: #475569;
  margin: 1rem 0;
}

.rich-editor :deep(ul),
.rich-editor :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.75rem 0;
}

.rich-editor :deep(hr) {
  border: 0;
  border-top: 1px solid #cbd5e1;
  margin: 1rem 0;
}

.rich-editor :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}

.rich-editor :deep(img) {
  max-width: 100%;
  border-radius: 0.75rem;
  margin: 0.75rem 0;
  display: inline-block;
}
</style>
