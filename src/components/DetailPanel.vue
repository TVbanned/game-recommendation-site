<template>
  <div class="detail-panel" :class="{ active: isOpen }" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <button class="absolute top-5 right-5 z-20 w-10 h-10 bg-white/50 backdrop-blur-md hover:bg-white/80 text-gray-800 rounded-full flex items-center justify-center transition-all shadow-sm border border-white/60 focus:outline-none" @click="closePanel"><i class="fas fa-times text-xl"></i></button>
    <div v-if="game" class="pb-12">
      <ImageCarousel :images="carouselImages" />
      <div class="p-4 md:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
          <h2 class="text-3xl font-black text-slate-800 leading-tight detail-title">{{ game.title }}</h2>
          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <button v-if="steamWishlistEnabled" class="h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-colors shadow-md group" @click="openSteam"><i class="fas fa-heart text-base text-white group-hover:text-red-400 transition-colors"></i>一键加愿望单</button>
            <a :href="steamUrl" target="_blank" rel="noopener noreferrer" class="h-11 bg-slate-800 text-white px-5 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-md">去Steam页面瞅瞅! <i class="fab fa-steam text-lg"></i></a>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-5 md:gap-6 mb-3 md:mb-5">
          <div class="grid grid-cols-2 md:flex md:flex-col gap-y-3 md:gap-y-4 gap-x-3 shrink-0 md:w-1/3">
            <div class="info-tag overflow-hidden"><i class="fas fa-gamepad shrink-0"></i><span class="truncate">{{ game.type || '未设置' }}</span></div>
            <div class="info-tag overflow-hidden"><i class="far fa-calendar-alt shrink-0"></i><span class="truncate">{{ game.releaseDate || game.date || '待定' }}</span></div>
            <div class="info-tag overflow-hidden"><i class="fas fa-tag shrink-0"></i><span class="truncate">{{ priceDisplay }}</span></div>
            <div class="info-tag overflow-hidden"><i class="fas fa-users shrink-0"></i><span class="truncate">{{ game.team || '未设置' }}</span></div>
          </div>
          <div class="flex-1 min-w-0 md:w-2/3"><h3 class="section-title">游戏介绍</h3><p class="text-slate-600 text-sm md:text-base leading-relaxed md:leading-loose text-justify font-normal description">{{ game.desc || game.description || '暂无介绍' }}</p></div>
        </div>
        <div class="zhihu-box">
          <div class="flex flex-wrap items-center gap-1.5 md:gap-2 mb-5 pb-4 border-b border-slate-200">
            <div class="hidden md:flex rounded-lg w-9 h-9 items-center justify-center mr-1 shrink-0 zhihu-icon"><i class="fab fa-zhihu text-lg"></i></div>
            <button v-for="tab in tabs" :key="tab.id" class="tab-button" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
          </div>
          <section v-if="activeTab === 'developer'"><p class="question"><i class="fas fa-quote-left text-indigo-300 mr-1.5"></i>{{ game.developerQuestion || game.developer_question || defaultDeveloperQuestion }}</p><ContentAuthor :author="game.zhihuAuthor || game.zhihu_author" :avatar="game.zhihuAvatar || game.zhihu_avatar" :bio="game.developerBio || game.developer_bio" :url="game.zhihuUrl || game.zhihu_url" /><div class="prose-zhihu" v-html="developerContent"></div></section>
          <section v-else-if="activeTab === 'player'"><p class="question"><i class="fas fa-quote-left text-indigo-300 mr-1.5"></i>{{ game.playerQuestion || game.player_question || `如何评价游戏《${game.title}》？体验过后你觉得它好玩吗？` }}</p><ContentAuthor :author="game.playerExperienceAuthor || game.player_experience_author" :avatar="game.playerExperienceAvatar || game.player_experience_avatar" :bio="game.playerBio || game.player_bio" :url="game.playerExperienceZhihuUrl || game.player_experience_zhihu_url" /><div class="prose-zhihu" v-html="playerContent"></div><template v-for="(answer, index) in extraAnswers" :key="index"><hr class="my-6 border-slate-200"><ContentAuthor :author="answer.author" :avatar="answer.avatar" :bio="answer.bio" :url="answer.url || answer.zhihuUrl" /><div class="prose-zhihu" v-html="safeHtml(answer.content)"></div></template></section>
          <section v-else class="text-slate-400 text-center py-12">{{ game.discussion || game.discussion_content || '游戏综合讨论内容即将上线，敬请期待。' }}</section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ImageCarousel from './ImageCarousel.vue'
import ContentAuthor from './ContentAuthor.vue'
import { proxyImageUrl, sanitizeHtml } from '../utils/frontend'
const props = defineProps({ isOpen: { type: Boolean, default: false }, game: { type: Object, default: null }, steamWishlistEnabled: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const activeTab = ref('developer')
const tabs = [{ id: 'developer', label: '游戏开发者说' }, { id: 'player', label: '答主游戏评价' }, { id: 'discussion', label: '游戏综合讨论' }]
const defaultDeveloperQuestion = '请说出至少一个理由，为什么玩家要体验你开发的这款游戏，最好玩的点在哪里？'
const carouselImages = computed(() => { const game = props.game; if (!game) return []; const images = Array.isArray(game.screenshots) && game.screenshots.length ? game.screenshots : (game.screenshot ? [game.screenshot] : [game.cover]); return images.filter(Boolean).map(image => proxyImageUrl(image, 800)) })
const steamUrl = computed(() => props.game?.targetUrl || props.game?.target_url || '#')
const priceDisplay = computed(() => { if (props.game?.released === false) return '未发售'; const value = Number(props.game?.price); return !props.game?.price || Number.isNaN(value) || value === 0 ? '免费开玩' : `¥${props.game.price}` })
const safeHtml = sanitizeHtml
const developerContent = computed(() => safeHtml(props.game?.zhihuContent || props.game?.zhihu_content || '暂无内容。'))
const playerContent = computed(() => safeHtml(props.game?.playerExperienceContent || props.game?.player_experience_content || '暂未添加答主游戏体验。'))
const extraAnswers = computed(() => props.game?.playerExtraAnswers || props.game?.player_extra_answers || [])
watch(() => props.game, game => { const hasDeveloperContent = Boolean((game?.zhihuContent || game?.zhihu_content || '').replace(/<[^>]*>/g, '').trim()); activeTab.value = hasDeveloperContent ? 'developer' : 'player' }, { immediate: true })
const openSteam = () => { if (steamUrl.value !== '#') window.open(steamUrl.value, '_blank', 'noopener,noreferrer') }
const closePanel = () => emit('close')
let panelStartX = 0
const handleTouchStart = event => { if (event.target.closest('.carousel-container')) return; panelStartX = event.touches[0].clientX }
const handleTouchEnd = event => { if (event.target.closest('.carousel-container')) return; if (event.changedTouches[0].clientX - panelStartX > 100 && window.innerWidth < 768) closePanel() }
</script>

<style scoped>
.detail-panel { position: fixed; top: 0; right: 0; z-index: 50; width: 100%; height: 100%; overflow-y: scroll; scrollbar-gutter: stable; background: #fff; box-shadow: -20px 0 50px rgba(0,0,0,.1); transform: translateX(100%); transition: transform .5s cubic-bezier(.16,1,.3,1); }.detail-panel.active { transform: translateX(0); }.detail-panel::-webkit-scrollbar { width: 6px; }.detail-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.detail-title { flex: 1 1 auto; min-width: 200px; }.info-tag { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 12px; background: #f1f5f9; color: #475569; font-size: .875rem; font-weight: 500; transition: background-color .2s; }.info-tag:hover { background: #e2e8f0; }.info-tag i { color: #64748b; font-size: 1rem; }
.section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: #1e293b; font-size: 1.125rem; font-weight: 700; }.section-title::before { width: 8px; height: 24px; border-radius: 999px; background: #6366f1; content: ''; }.description { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 5; }
.zhihu-box { position: relative; overflow: hidden; padding: 24px 24px 24px 32px; border-radius: 16px; background: #f8fafc; box-shadow: inset 0 2px 4px rgba(0,0,0,.02); }.zhihu-box::before { position: absolute; top: 24px; bottom: 24px; left: 0; width: 7px; border-radius: 0 999px 999px 0; background: linear-gradient(180deg,#ef4444 0%,#f97316 50%,#ef4444 100%); background-size: 100% 200%; box-shadow: 3px 0 14px rgba(239,68,68,.22); content: ''; animation: zhihu-bar-flow 2.8s linear infinite; }.zhihu-box::after { position: absolute; top: var(--highlight-top,24px); left: 0; z-index: 1; width: 7px; height: 80px; border-radius: 0 999px 999px 0; background: linear-gradient(180deg,transparent,rgba(255,255,255,.55) 35%,rgba(255,255,255,.55) 65%,transparent); content: ''; pointer-events: none; }@keyframes zhihu-bar-flow { from { background-position: 0 0; } to { background-position: 0 200%; } }
.zhihu-icon { background: #0767fb; color: #fff; }.tab-button { display: flex; align-items: center; height: 28px; padding: 0 8px; border-radius: 8px; background: #fff; color: #64748b; font-size: 12px; font-weight: 700; white-space: nowrap; transition: color .2s, background .2s; }.tab-button:hover { background: #f1f5f9; }.tab-button.active { background: #6b42e8; color: #fff; }.question { margin-bottom: 20px; color: #1e293b; font-size: 1.125rem; font-weight: 700; line-height: 1.625; }.prose-zhihu { color: #475569; font-size: 1rem; line-height: 1.9; }.prose-zhihu :deep(> p), .prose-zhihu :deep(> div) { margin: 0 0 24px; font-size: 1rem !important; line-height: 1.9 !important; }.prose-zhihu :deep(> p:last-child), .prose-zhihu :deep(> div:last-child) { margin-bottom: 0; }.prose-zhihu :deep(> p *), .prose-zhihu :deep(> div *) { font-size: inherit !important; line-height: inherit !important; }.prose-zhihu :deep(img) { display: block; max-width: 100%; margin: 18px 0; border-radius: 12px; }.prose-zhihu :deep(h2), .prose-zhihu :deep(h3) { margin: 24px 0 10px; color: #1e293b; font-weight: 700; }.prose-zhihu :deep(blockquote) { margin: 16px 0; padding: 4px 0 4px 16px; border-left: 3px solid #cbd5e1; color: #64748b; }.prose-zhihu :deep(ul), .prose-zhihu :deep(ol) { margin: 0 0 16px; padding-left: 1.5em; }.prose-zhihu :deep(li) { margin-bottom: 5px; }.prose-zhihu :deep(a) { color: #4f46e5; text-decoration: underline; }
@media (max-width: 767px) { .zhihu-box { padding: 20px 16px 20px 24px; }.zhihu-box::before { top: 20px; bottom: 20px; } }
@media (min-width: 768px) { .detail-panel { width: 50%; border-left: 1px solid #e2e8f0; }.tab-button { height: 36px; padding: 0 12px; font-size: 1rem; }.section-title { margin-bottom: 12px; }.description { min-height: 160px; } }
</style>