<template>
  <div class="rich-editor">
    <div class="rich-toolbar">
      <button v-for="[name, text] in commands" :key="name" type="button" class="editor-toolbar-btn" @mousedown.prevent @click="command(name)">{{ text }}</button>
      <button type="button" class="editor-toolbar-btn" @mousedown.prevent @click="link">超链接</button>
    </div>
    <div class="px-3 pt-3 text-xs font-semibold text-indigo-700">{{ label }}</div>
    <div ref="editor" contenteditable="true" class="min-h-[180px] p-3 text-sm leading-relaxed outline-none prose-zhihu" :innerHTML="modelValue" @input="emit('update:modelValue', $event.target.innerHTML)"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const editor = ref(null)
const commands = [['bold', '加粗'], ['italic', '斜体'], ['formatBlock', '标题'], ['insertUnorderedList', '无序列表'], ['insertOrderedList', '有序列表']]
const command = name => { editor.value?.focus(); document.execCommand(name, false); emit('update:modelValue', editor.value?.innerHTML || '') }
const link = () => { const url = prompt('输入链接 URL'); if (url) { editor.value?.focus(); document.execCommand('createLink', false, url); emit('update:modelValue', editor.value?.innerHTML || '') } }
</script>

<style scoped>
.rich-editor{margin-top:.75rem;overflow:hidden;border:1px solid #c7d2fe;border-radius:.75rem;background:#fff}.rich-toolbar{display:flex;gap:.5rem;overflow-x:auto;border-bottom:1px solid #e0e7ff;background:rgba(238,242,255,.7);padding:.75rem}.editor-toolbar-btn{flex:0 0 auto;white-space:nowrap;border:1px solid #c7d2fe;border-radius:.625rem;background:#fff;padding:.5rem .75rem;font-size:.875rem;font-weight:600;color:#334155}.editor-toolbar-btn:hover{background:#eef2ff}.prose-zhihu :deep(a){color:#4f46e5;text-decoration:underline}.prose-zhihu :deep(ul),.prose-zhihu :deep(ol){margin:0 0 1rem;padding-left:1.5rem;list-style:revert}
</style>
