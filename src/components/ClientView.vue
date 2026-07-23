<template>
  <div id="client-view" class="min-h-screen relative w-full overflow-hidden">
    <header class="mobile-sticky-header md:hidden" :class="{ 'is-visible': mobileHeaderVisible }">
      <div class="mobile-sticky-inner">
        <span class="mobile-sticky-title">暑期「游戏浪一夏」</span>
        <nav class="activity-nav flex overflow-x-auto">
          <button v-for="activity in activities" :key="activity.id" @click="selectActivity(activity.id)" class="px-4 py-2 text-sm whitespace-nowrap transition-colors" :class="selectedActivityId === activity.id ? 'bg-rose-500 text-white' : 'text-white'">
            {{ activity.nav_title || activity.title }}
          </button>
        </nav>
      </div>
    </header>

    <div id="main-wrapper" :style="panelOpen ? 'width: 50%' : ''">
      <div class="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="mb-6 hidden md:flex items-baseline flex-wrap gap-4 select-none cursor-pointer" @click="handleSecretTrigger">
          <h1 class="text-5xl font-black tracking-tight text-gray-900 title-gradient">暑期「游戏浪一夏」</h1>
          <span class="text-2xl text-gray-500 font-light tracking-wide border-l-2 border-gray-300 pl-4">东方侠影游戏安利时间</span>
        </div>

        <div class="hidden md:block mb-8">
          <nav class="activity-nav flex overflow-x-auto bg-indigo-800">
            <button v-for="activity in activities" :key="activity.id" @click="selectActivity(activity.id)" class="px-6 py-2.5 text-base whitespace-nowrap transition-colors" :class="selectedActivityId === activity.id ? 'bg-rose-500 text-white' : 'text-white hover:bg-indigo-700'">
              <i v-if="activity.is_featured" class="fas fa-star text-amber-300 mr-1"></i>{{ activity.nav_title || activity.title }}
            </button>
          </nav>
          <a v-if="activeActivity?.banner_url" :href="activeActivity.banner_link || '#'" class="desktop-banner block mt-2 bg-slate-200 overflow-hidden" :target="activeActivity.banner_link ? '_blank' : null">
            <img :src="activeActivity.banner_url" :alt="activeActivity.title" class="w-full h-auto object-contain">
          </a>
          <div v-else class="h-44 mt-2 bg-slate-200"></div>
        </div>

        <section ref="mobileHero" class="md:hidden mb-6">
          <a v-if="activeActivity?.banner_url" :href="activeActivity.banner_link || '#'" class="mobile-banner block mb-4 bg-slate-200 overflow-hidden" :target="activeActivity.banner_link ? '_blank' : null">
            <img :src="activeActivity.banner_url" :alt="activeActivity.title" class="block w-full h-auto object-contain">
          </a>
          <div class="select-none cursor-pointer mb-4" @click="handleSecretTrigger">
            <h1 class="text-3xl font-black tracking-tight text-gray-900 title-gradient mb-1">暑期「游戏浪一夏」</h1>
            <p class="text-md text-gray-500 font-light tracking-wide">东方侠影游戏安利时间</p>
          </div>
          <nav class="activity-nav flex overflow-x-auto bg-indigo-800">
            <button v-for="activity in activities" :key="activity.id" @click="selectActivity(activity.id)" class="px-4 py-2 text-sm whitespace-nowrap transition-colors" :class="selectedActivityId === activity.id ? 'bg-rose-500 text-white' : 'text-white'">
              {{ activity.nav_title || activity.title }}
            </button>
          </nav>
        </section>

        <div class="flex flex-wrap gap-3 items-center mb-2">
          <button @click="toggleSort" class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 font-medium"><i class="fas fa-sync-alt mr-2"></i>当前为{{ sortMode === 'default' ? '默认' : '发售时间' }}排序</button>
          <button v-for="tag in visibleTags" :key="tag" @click="selectedTag = tag" class="px-6 py-2 rounded-full font-semibold transition-colors" :class="selectedTag === tag ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">{{ tag }}</button>
        </div>

        <div class="game-waterfall">
          <GameCard v-for="(game, index) in displayedGames" :key="game.id" :game="game" :priority="index < 6 ? 'high' : 'auto'" @click="openDetail(game)" />
        </div>
        <div v-if="isMobile && displayedGames.length < sortedGames.length" ref="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>
      </div>
    </div>

    <DetailPanel :is-open="detailPanelOpen" :game="selectedGame" @close="closeDetail" />
    <div id="overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity" :class="{ hidden: !detailPanelOpen }" @click="closeDetail"></div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import GameCard from './GameCard.vue'
import DetailPanel from './DetailPanel.vue'

const props = defineProps({
  games: { type: Array, default: () => [] },
  activities: { type: Array, default: () => [] },
  activityGameMap: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['toggle-admin'])
const mobileBatchSize = 12
const mobileInitialCount = 24
const detailPanelOpen = ref(false)
const selectedGame = ref(null)
const selectedActivityId = ref('')
const selectedTag = ref('全部')
const sortMode = ref('default')
const secretClickCount = ref(0)
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth < 768)
const mobileGameCount = ref(mobileInitialCount)
const mobileHeaderVisible = ref(false)
const mobileHero = ref(null)
const loadMoreSentinel = ref(null)
let secretClickTimer = null
let heroObserver = null
let loadMoreObserver = null

const activeActivity = computed(() => props.activities.find(activity => activity.id === selectedActivityId.value) || props.activities[0])
const activityGames = computed(() => {
  if (!activeActivity.value) return props.games
  const gameIds = props.activityGameMap[activeActivity.value.id] || []
  if (!gameIds.length && activeActivity.value.id === 'default-activity') return props.games
  return gameIds.map(id => props.games.find(game => game.id === id)).filter(Boolean)
})
const visibleTags = computed(() => ['全部', ...new Set(activityGames.value.flatMap(game => Array.isArray(game.tags) ? game.tags : []))])
const sortedGames = computed(() => {
  const games = selectedTag.value === '全部' ? [...activityGames.value] : activityGames.value.filter(game => game.tags?.includes(selectedTag.value))
  return games.sort((a, b) => {
    if (sortMode.value === 'default') return (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0)
    return new Date(b.releaseDate || b.date || 0) - new Date(a.releaseDate || a.date || 0)
  })
})
const displayedGames = computed(() => isMobile.value ? sortedGames.value.slice(0, mobileGameCount.value) : sortedGames.value)
const panelOpen = computed(() => detailPanelOpen.value && window.innerWidth >= 768)

const observeLoadMore = () => {
  loadMoreObserver?.disconnect()
  if (!isMobile.value || !loadMoreSentinel.value) return
  loadMoreObserver = new IntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) mobileGameCount.value += mobileBatchSize
  }, { rootMargin: '600px 0px' })
  loadMoreObserver.observe(loadMoreSentinel.value)
}
const resetMobileGames = () => { mobileGameCount.value = mobileInitialCount; nextTick(observeLoadMore) }
const updateViewport = () => { isMobile.value = window.innerWidth < 768; if (!isMobile.value) mobileHeaderVisible.value = false; nextTick(observeLoadMore) }

watch(() => props.activities, activities => {
  if (activities.length && !activities.some(activity => activity.id === selectedActivityId.value)) selectedActivityId.value = activities[0].id
}, { immediate: true })
watch(selectedActivityId, () => { selectedTag.value = '全部'; resetMobileGames() })
watch([selectedTag, sortMode, () => props.games, () => props.activityGameMap], resetMobileGames)
watch(displayedGames, () => nextTick(observeLoadMore))

const selectActivity = id => { selectedActivityId.value = id }
const toggleSort = () => { sortMode.value = sortMode.value === 'default' ? 'release' : 'default' }
const openDetail = game => { selectedGame.value = game; detailPanelOpen.value = true }
const closeDetail = () => { detailPanelOpen.value = false; selectedGame.value = null }
const handleSecretTrigger = () => {
  secretClickCount.value++
  if (secretClickCount.value >= 5) { emit('toggle-admin'); secretClickCount.value = 0 }
  clearTimeout(secretClickTimer)
  secretClickTimer = setTimeout(() => { secretClickCount.value = 0 }, 1000)
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport, { passive: true })
  heroObserver = new IntersectionObserver(entries => { mobileHeaderVisible.value = !entries[0]?.isIntersecting }, { threshold: 0 })
  if (mobileHero.value) heroObserver.observe(mobileHero.value)
})
onUnmounted(() => {
  clearTimeout(secretClickTimer)
  heroObserver?.disconnect()
  loadMoreObserver?.disconnect()
  window.removeEventListener('resize', updateViewport)
})
</script>

<style scoped>
#main-wrapper { width: 100%; transition: width .5s cubic-bezier(.16,1,.3,1); will-change: width; }
.activity-nav::-webkit-scrollbar { display: none; }
.desktop-banner { max-height: 18rem; }
.game-waterfall { column-count: 2; column-gap: 16px; padding: 16px; }
.load-more-sentinel { height: 1px; }
.mobile-sticky-header { position: fixed; top: 0; right: 0; left: 0; z-index: 30; padding-top: env(safe-area-inset-top); background: #312e81; opacity: 0; pointer-events: none; transform: translateY(calc(-100% - env(safe-area-inset-top))); transition: opacity .2s ease, transform .2s ease; }
.mobile-sticky-header.is-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
.mobile-sticky-inner { display: flex; align-items: center; min-height: 48px; background: #312e81; }
.mobile-sticky-title { flex: 0 0 auto; max-width: 10rem; padding: 0 12px; overflow: hidden; color: #fff; font-size: .875rem; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.mobile-sticky-inner .activity-nav { flex: 1 1 auto; }
@media (min-width: 768px) { .game-waterfall { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; padding: 32px 0; column-count: auto; } }
</style>
