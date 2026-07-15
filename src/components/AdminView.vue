<template>
  <div id="admin-view" class="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div class="bg-slate-900 px-8 py-5 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-white tracking-wide">内容配置后台 (CMS)</h2>
        <div class="flex items-center gap-4">
          <span class="text-slate-400 text-sm hidden sm:inline"><i class="fas fa-database mr-1"></i>数据存储于 Supabase</span>
          <button @click="onToggleMode" class="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">退出后台</button>
        </div>
      </div>

      <div class="p-8 flex flex-col lg:flex-row gap-10">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">新增 / 编辑游戏数据</h3>
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">游戏名称</label>
                <input v-model="form.title" type="text" required class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">开发团队</label>
                <input v-model="form.team" type="text" required class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">游戏类型</label>
                <input v-model="form.type" type="text" placeholder="如：悬疑逃生" required class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">售价 (元)</label>
                <input v-model="form.price" type="text" required class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">主题色 (底边条)</label>
                <input v-model="form.color" type="color" class="w-full h-11 rounded-lg border-slate-300 shadow-sm border p-1 cursor-pointer bg-slate-50">
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">详情页跳转链接 (URL)</label>
              <input v-model="form.target_url" type="url" placeholder="https://store.steampowered.com/..." class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">封面图片 URL</label>
              <input v-model="form.cover" type="text" required placeholder="https://..." class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 bg-slate-50">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">游戏截图 URLs (多图逗号分隔)</label>
              <input v-model="screenshotsInput" type="text" placeholder="https://img1.jpg, https://img2.jpg" class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 bg-slate-50">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">游戏简介</label>
              <textarea v-model="form.description" rows="3" required class="w-full rounded-lg border-slate-300 shadow-sm border p-2.5 bg-slate-50"></textarea>
            </div>

            <div class="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
              <h4 class="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <i class="fab fa-zhihu text-blue-500 text-lg"></i>开发者手记
              </h4>
              <p class="text-xs text-indigo-600 mb-3">填写知乎作者和内容</p>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <input v-model="form.zhihu_author" type="text" placeholder="作者名称" class="flex-1 rounded-lg border-indigo-200 shadow-sm border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <input v-model="form.zhihu_avatar" type="text" placeholder="头像URL" class="flex-1 rounded-lg border-indigo-200 shadow-sm border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <textarea v-model="form.zhihu_content" rows="3" placeholder="内容" class="w-full rounded-lg border-indigo-200 shadow-sm border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <div class="pt-6 flex gap-4">
              <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform active:scale-95">
                {{ form.id ? '更新游戏' : '发布数据至 H5' }}
              </button>
              <button type="button" @click="resetForm" class="bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-50 transition-colors">清空</button>
            </div>
          </form>
        </div>

        <div class="flex-1 lg:border-l border-slate-200 lg:pl-10 mt-10 lg:mt-0">
          <h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">已发布游戏管理 ({{ games.length }})</h3>
          <div class="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            <div v-for="game in games" :key="game.id" class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4 overflow-hidden">
                <img :src="game.cover" class="w-16 h-12 object-cover rounded shadow-sm border">
                <div class="truncate">
                  <div class="font-bold text-slate-800 truncate">{{ game.title }}</div>
                  <div class="text-sm text-slate-500">{{ game.type || '未分类' }} | ¥{{ game.price }}</div>
                </div>
              </div>
              <div class="flex gap-3 shrink-0 ml-4">
                <button @click="editGame(game)" class="text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"><i class="fas fa-edit mr-1"></i>编辑</button>
                <button @click="deleteGame(game.id)" class="text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gameService } from '../services/supabase'

const props = defineProps({
  games: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-mode', 'refresh'])

const defaultForm = () => ({
  id: '',
  title: '',
  team: '',
  type: '',
  price: '',
  color: '#6366f1',
  cover: '',
  screenshots: [],
  target_url: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  zhihu_author: '',
  zhihu_avatar: 'https://placehold.co/100x100/3b82f6/ffffff?text=User',
  zhihu_content: ''
})

const form = ref(defaultForm())
const screenshotsInput = ref('')

const resetForm = () => {
  form.value = defaultForm()
  screenshotsInput.value = ''
}

const editGame = (game) => {
  form.value = { 
    ...game,
    description: game.description || game.desc || ''
  }
  screenshotsInput.value = Array.isArray(game.screenshots) ? game.screenshots.join(', ') : ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteGame = async (id) => {
  if (confirm('确定要删除这个游戏吗？')) {
    const success = await gameService.deleteGame(id)
    if (success) {
      emit('refresh')
    }
  }
}

const handleSubmit = async () => {
  const gameData = {
    ...form.value,
    screenshots: screenshotsInput.value ? screenshotsInput.value.split(',').map(s => s.trim()).filter(s => s) : []
  }
  
  let result
  if (gameData.id) {
    result = await gameService.updateGame(gameData.id, gameData)
  } else {
    gameData.id = Date.now().toString()
    result = await gameService.createGame(gameData)
  }
  
  if (result) {
    alert('发布成功！数据已更新。')
    resetForm()
    emit('refresh')
  }
}

const onToggleMode = () => {
  emit('toggle-mode')
}
</script>
