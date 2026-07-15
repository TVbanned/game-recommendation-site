<template>
  <div id="client-view" class="min-h-screen relative w-full overflow-hidden">
    <div id="main-wrapper" :style="panelOpen ? 'width: 50%' : ''">
      <div class="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="mb-10 hidden md:flex items-baseline flex-wrap gap-4 select-none cursor-pointer" id="secret-trigger-pc" @click="handleSecretTrigger">
          <h1 class="text-5xl font-black tracking-tight text-gray-900 title-gradient">暑期「游戏浪一夏」</h1>
          <span class="text-2xl text-gray-500 font-light tracking-wide border-l-2 border-gray-300 pl-4">东方侠影游戏安利时间</span>
        </div>

        <div class="md:hidden mb-6">
          <div id="secret-trigger-mobile" class="select-none cursor-pointer mb-4" @click="handleSecretTrigger">
            <h1 class="text-3xl font-black tracking-tight text-gray-900 title-gradient mb-1">暑期「游戏浪一夏」</h1>
            <p class="text-md text-gray-500 font-light tracking-wide">东方侠影游戏安利时间</p>
          </div>
          <div class="mobile-banner w-full h-48 bg-slate-200 rounded-2xl overflow-hidden relative shadow-inner">
            <img src="https://placehold.co/800x400/e2e8f0/64748b?text=Summer+Game+Banner" class="absolute inset-0 w-full h-full object-cover" alt="Banner">
          </div>
        </div>

        <div class="game-waterfall">
          <GameCard
            v-for="game in games"
            :key="game.id"
            :game="game"
            @click="openDetail(game)"
          />
        </div>
      </div>
    </div>

    <DetailPanel
      :is-open="detailPanelOpen"
      :game="selectedGame"
      @close="closeDetail"
    />

    <div
      id="overlay"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
      :class="{ 'hidden': !detailPanelOpen }"
      @click="closeDetail"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import GameCard from './GameCard.vue'
import DetailPanel from './DetailPanel.vue'

const props = defineProps({
  games: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-admin'])

const detailPanelOpen = ref(false)
const selectedGame = ref(null)
const secretClickCount = ref(0)
let secretClickTimer = null

const panelOpen = computed(() => detailPanelOpen.value && window.innerWidth >= 768)

const openDetail = (game) => {
  selectedGame.value = game
  detailPanelOpen.value = true
}

const closeDetail = () => {
  detailPanelOpen.value = false
  selectedGame.value = null
}

const handleSecretTrigger = () => {
  secretClickCount.value++
  if (secretClickCount.value >= 5) {
    emit('toggle-admin')
    secretClickCount.value = 0
  }
  clearTimeout(secretClickTimer)
  secretClickTimer = setTimeout(() => {
    secretClickCount.value = 0
  }, 1000)
}
</script>

<style scoped>
#main-wrapper {
  width: 100%;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: width;
}

.game-waterfall {
  column-count: 2;
  column-gap: 16px;
  padding: 16px;
}

@media (min-width: 768px) {
  .mobile-banner {
    display: none;
  }

  .game-waterfall {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    padding: 32px 0;
    column-count: auto;
  }
}
</style>
