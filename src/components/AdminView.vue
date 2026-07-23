<template>
  <div id="admin-view" class="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div class="bg-slate-900 px-8 py-5 flex justify-between items-center"><h2 class="text-2xl font-bold text-white">内容配置后台 (CMS)</h2><button @click="emit('toggle-mode')" class="bg-rose-500 text-white px-5 py-2 rounded-lg text-sm font-bold">退出后台</button></div>
      <div class="flex border-b border-slate-200 px-8 gap-6">
        <button @click="tab = 'games'" class="py-4 font-bold" :class="tab === 'games' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'">游戏管理</button>
        <button @click="tab = 'activities'" class="py-4 font-bold" :class="tab === 'activities' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'">Tab4：活动管理</button>
      </div>

      <div v-if="tab === 'games'" class="p-8 flex flex-col lg:flex-row gap-10">
        <div class="flex-1"><h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">新增 / 编辑游戏数据</h3>
          <form @submit.prevent="handleGameSubmit" class="space-y-5">
            <div class="grid grid-cols-2 gap-5"><input v-model="gameForm.title" required placeholder="游戏名称" class="field"><input v-model="gameForm.team" required placeholder="开发团队" class="field"></div>
            <div class="grid grid-cols-3 gap-5"><input v-model="gameForm.type" required placeholder="游戏类型" class="field"><input v-model="gameForm.price" required placeholder="售价" class="field"><input v-model="gameForm.color" type="color" class="field h-11 p-1"></div>
            <input v-model="gameForm.verdict" maxlength="15" placeholder="AI 判词" class="field"><input v-model="gameForm.target_url" type="url" placeholder="详情页跳转链接" class="field"><input v-model="gameForm.cover" required placeholder="封面图片 URL" class="field"><input v-model="screenshotsInput" placeholder="游戏截图 URLs（逗号分隔）" class="field"><textarea v-model="gameForm.description" required rows="3" placeholder="游戏简介" class="field"></textarea>
            <div class="flex gap-4"><button class="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl">{{ gameForm.id ? '更新游戏' : '发布游戏' }}</button><button type="button" @click="resetGameForm" class="px-6 border rounded-xl">清空</button></div>
          </form>
        </div>
        <div class="flex-1 lg:border-l border-slate-200 lg:pl-10"><h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">已发布游戏 ({{ games.length }})</h3><div class="space-y-3 max-h-[700px] overflow-y-auto"><div v-for="game in games" :key="game.id" class="flex justify-between items-center p-3 border rounded-xl"><span class="font-bold truncate">{{ game.title }}</span><span class="flex gap-2"><button @click="editGame(game)" class="text-indigo-600">编辑</button><button @click="deleteGame(game.id)" class="text-rose-600">删除</button></span></div></div></div>
      </div>

      <div v-else class="p-8 grid lg:grid-cols-[1.1fr_.9fr] gap-10">
        <div><h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">{{ activityForm.id ? '编辑活动' : '创建活动' }}</h3>
          <form @submit.prevent="handleActivitySubmit" class="space-y-5"><input v-model="activityForm.title" required placeholder="活动名称" class="field"><input v-model="activityForm.nav_title" required placeholder="导航栏名称" class="field"><div class="grid grid-cols-2 gap-5"><input v-model.number="activityForm.sort_order" type="number" placeholder="导航排序" class="field"><label class="flex items-center gap-2 text-slate-700 font-semibold"><input v-model="activityForm.is_featured" type="checkbox">精选（热推活动）</label></div><input v-model="activityForm.banner_url" placeholder="PC Banner 图片 URL" class="field"><input v-model="activityForm.banner_link" type="url" placeholder="Banner 跳转链接" class="field">
            <div class="border rounded-xl p-4"><p class="font-bold text-slate-700 mb-3">选择参与游戏</p><label v-for="game in games" :key="game.id" class="flex items-center gap-2 py-1"><input v-model="selectedGameIds" :value="game.id" type="checkbox">{{ game.title }}</label></div>
            <div class="flex gap-4"><button class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl">{{ activityForm.id ? '保存活动' : '创建活动' }}</button><button type="button" @click="resetActivityForm" class="px-6 border rounded-xl">清空</button></div>
          </form>
        </div>
        <div class="lg:border-l border-slate-200 lg:pl-10"><h3 class="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-6">活动管理 ({{ activities.length }})</h3><div class="space-y-3"><div v-for="activity in activities" :key="activity.id" class="p-4 border rounded-xl"><div class="flex justify-between gap-3"><div><p class="font-bold text-slate-800"><i v-if="activity.is_featured" class="fas fa-star text-amber-400 mr-1"></i>{{ activity.title }}</p><p class="text-sm text-slate-500">导航：{{ activity.nav_title }} · {{ (activityGameMap[activity.id] || []).length }} 款游戏</p></div><div class="flex gap-2"><button @click="editActivity(activity)" class="text-indigo-600">编辑</button><button @click="deleteActivity(activity.id)" class="text-rose-600">删除</button></div></div></div></div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { activityService, gameService } from '../services/supabase'
const props = defineProps({ games: { type: Array, default: () => [] }, activities: { type: Array, default: () => [] }, activityGameMap: { type: Object, default: () => ({}) } })
const emit = defineEmits(['toggle-mode', 'refresh'])
const tab = ref('games')
const defaultGameForm = () => ({ id: '', title: '', team: '', type: '', price: '', verdict: '', color: '#6366f1', cover: '', screenshots: [], target_url: '', date: new Date().toISOString().slice(0, 10), description: '', zhihu_author: '', zhihu_avatar: '', zhihu_content: '' })
const defaultActivityForm = () => ({ id: '', title: '', nav_title: '', banner_url: '', banner_link: '', is_featured: false, sort_order: 0 })
const gameForm = ref(defaultGameForm()); const activityForm = ref(defaultActivityForm()); const screenshotsInput = ref(''); const selectedGameIds = ref([])
const resetGameForm = () => { gameForm.value = defaultGameForm(); screenshotsInput.value = '' }
const resetActivityForm = () => { activityForm.value = defaultActivityForm(); selectedGameIds.value = [] }
const editGame = game => { gameForm.value = { ...defaultGameForm(), ...game }; screenshotsInput.value = (game.screenshots || []).join(', '); window.scrollTo({ top: 0, behavior: 'smooth' }) }
const deleteGame = async id => { if (confirm('确定删除这个游戏吗？') && await gameService.deleteGame(id)) emit('refresh') }
const handleGameSubmit = async () => { const data = { ...gameForm.value, screenshots: screenshotsInput.value.split(',').map(item => item.trim()).filter(Boolean) }; const result = data.id ? await gameService.updateGame(data.id, data) : await gameService.createGame({ ...data, id: Date.now().toString() }); if (result) { resetGameForm(); emit('refresh') } }
const editActivity = async activity => { activityForm.value = { ...activity }; selectedGameIds.value = [...(props.activityGameMap[activity.id] || [])]; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const handleActivitySubmit = async () => { const data = { ...activityForm.value }; if (data.is_featured) await Promise.all(props.activities.filter(activity => activity.is_featured && activity.id !== data.id).map(activity => activityService.updateActivity(activity.id, { ...activity, is_featured: false }, props.activityGameMap[activity.id] || []))); const result = data.id ? await activityService.updateActivity(data.id, data, selectedGameIds.value) : await activityService.createActivity({ ...data, id: `activity-${Date.now()}` }, selectedGameIds.value); if (result) { resetActivityForm(); emit('refresh') } }
const deleteActivity = async id => { if (confirm('确定删除这个活动吗？') && await activityService.deleteActivity(id)) emit('refresh') }
</script>

<style scoped>.field { width: 100%; border: 1px solid #cbd5e1; border-radius: .5rem; padding: .65rem .75rem; background: #f8fafc; }</style>
