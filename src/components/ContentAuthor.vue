<template>
  <div class="flex items-center gap-4 mb-4">
    <img :src="avatarUrl" alt="答主头像" referrerpolicy="no-referrer" class="w-12 h-12 rounded-full shadow-sm object-cover border-2 border-white shrink-0" @error="fallback">
    <div class="min-w-0"><div class="font-bold text-slate-800 text-base truncate">{{ author || '知乎用户' }}</div><div class="text-xs text-slate-500 mt-0.5">{{ bio || '知乎用户' }}</div></div>
    <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" class="ml-auto shrink-0 text-xs text-blue-500 hover:text-blue-700 transition-colors">阅读原文 ↗</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { imageFallback, proxyImageUrl } from '../utils/frontend'

const props = defineProps({ author: { type: String, default: '' }, avatar: { type: String, default: '' }, bio: { type: String, default: '' }, url: { type: String, default: '' } })
const avatarUrl = computed(() => proxyImageUrl(props.avatar || 'https://placehold.co/100x100/3b82f6/ffffff?text=User', 100))
const fallback = event => { event.target.onerror = null; event.target.src = imageFallback('头像') }
</script>
