<template>
  <div
    class="detail-panel"
    :class="{ 'detail-panel-active': isOpen }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <button class="absolute top-5 right-5 z-20 w-10 h-10 bg-white/50 backdrop-blur-md hover:bg-white/80 text-gray-800 rounded-full flex items-center justify-center transition-all shadow-sm border border-white/60 focus:outline-none" @click="closePanel">
      <i class="fas fa-times text-xl"></i>
    </button>

    <div class="pb-12" v-if="game">
      <ImageCarousel :images="carouselImages" />

      <div class="p-6 md:p-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
          <h2 class="text-3xl font-black text-slate-800 leading-tight">{{ game.title }}</h2>
          <a
            :href="game.target_url || '#'"
            target="_blank"
            class="shrink-0 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-md"
          >
            去Steam页面瞅瞅! <i class="fab fa-steam text-lg"></i>
          </a>
        </div>

        <div class="grid grid-cols-2 gap-y-4 gap-x-3 mb-10">
          <div class="info-tag"><i class="fas fa-gamepad"></i> {{ game.type || '未设置' }}</div>
          <div class="info-tag"><i class="far fa-calendar-alt"></i> {{ game.date || '待定' }}</div>
          <div class="info-tag"><i class="fas fa-tag"></i> {{ game.price ? '¥' + game.price : '免费' }}</div>
          <div class="info-tag truncate"><i class="fas fa-users"></i> {{ game.team }}</div>
        </div>

        <div class="mb-12">
          <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            <span class="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>游戏介绍
          </h3>
          <p class="text-slate-600 text-base leading-loose text-justify font-light">
            {{ game.description }}
          </p>
        </div>

        <div class="mb-4">
          <div class="zhihu-box">
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-blue-100 text-blue-600 rounded-full p-1.5 flex items-center justify-center">
                <i class="fab fa-zhihu text-xl"></i>
              </div>
              <span class="font-bold text-slate-700 text-lg">开发者手记</span>
            </div>

            <p class="font-bold text-slate-900 text-lg mb-6 leading-snug">
              "请说出一个理由，为什么玩家要体验你开发的这款游戏，最好玩的点在哪里？"
            </p>

            <div class="flex items-center gap-4 mb-4">
              <img :src="game.zhihu_avatar || 'https://placehold.co/100x100/3b82f6/ffffff?text=User'" class="w-12 h-12 rounded-full shadow-sm object-cover border-2 border-white" alt="Avatar">
              <div>
                <div class="font-bold text-slate-800">{{ game.zhihu_author || '知乎用户' }}</div>
              </div>
            </div>

            <div class="text-slate-600 text-base leading-relaxed mt-2 italic">
              {{ game.zhihu_content || '暂无内容...' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ImageCarousel from './ImageCarousel.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  game: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const carouselImages = computed(() => {
  if (!props.game) return []
  
  let images = []
  if (Array.isArray(props.game.screenshots) && props.game.screenshots.length > 0) {
    images = props.game.screenshots
  } else if (props.game.screenshot) {
    images = [props.game.screenshot]
  } else {
    images = [props.game.cover]
  }
  return images
})

const closePanel = () => {
  emit('close')
}

let panelStartX = 0

const handleTouchStart = (e) => {
  if (e.target.closest('.carousel-container')) return
  panelStartX = e.touches[0].clientX
}

const handleTouchEnd = (e) => {
  if (e.target.closest('.carousel-container')) return
  const endX = e.changedTouches[0].clientX
  if (endX - panelStartX > 100 && window.innerWidth < 768) {
    closePanel()
  }
}
</script>

<style scoped>
.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 50;
  transform: translateX(100%);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.1);
}

.detail-panel-active {
  transform: translateX(0);
}

.detail-panel::-webkit-scrollbar {
  width: 6px;
}

.detail-panel::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.info-tag {
  background-color: #f1f5f9;
  color: #475569;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.info-tag:hover {
  background-color: #e2e8f0;
}

.info-tag i {
  color: #64748b;
  font-size: 1rem;
}

.zhihu-box {
  background-color: #f8fafc;
  border-left: 4px solid #ef4444;
  border-radius: 0 16px 16px 0;
  padding: 24px;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  position: relative;
}

@media (min-width: 768px) {
  .detail-panel {
    width: 50%;
    border-left: 1px solid #e2e8f0;
  }
}
</style>
