<template>
  <div 
    class="carousel-container relative w-full h-64 md:h-72 bg-slate-900" @mousedown="handleTouchStart" @touchstart="handleTouchStart">
    <div 
      class="carousel-track" :style="{ transform: `translateX(${currentTranslate}px`, transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }">
      <div v-for="(image, index) in images" :key="index" class="carousel-slide">
        <img :src="image" class="w-full h-full object-cover" alt="截图">
      </div>
    </div>
    <div class="absolute bottom-4 w-full flex justify-center gap-2 z-10">
      <div
        v-for="(_, index) in images"
        :key="index"
        class="w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 shadow-sm"
        :class="index === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'"
        @click="goToSlide(index)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const currentSlide = ref(0)
const currentTranslate = ref(0)
const prevTranslate = ref(0)
const isDragging = ref(false)
const startPos = ref(0)
const carouselInterval = ref(null)

const getContainerWidth = () => {
  const container = document.querySelector('.carousel-container')
  return container ? container.offsetWidth : 0
}

const updateCarousel = () => {
  const containerWidth = getContainerWidth()
  currentTranslate.value = currentSlide.value * -containerWidth
  prevTranslate.value = currentTranslate.value
}

const startAutoSlide = () => {
  if (props.images.length <= 1) return
  clearInterval(carouselInterval.value)
  carouselInterval.value = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % props.images.length
    updateCarousel()
  }, 3000)
}

const stopAutoSlide = () => {
  clearInterval(carouselInterval.value)
}

const goToSlide = (index) => {
  currentSlide.value = index
  updateCarousel()
  startAutoSlide()
}

const getPositionX = (event) => {
  return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
}

const handleTouchStart = (event) => {
  if (props.images.length <= 1) return
  isDragging.value = true
  startPos.value = getPositionX(event)
  stopAutoSlide()
}

const handleTouchMove = (event) => {
  if (!isDragging.value) return
  if (event.type === 'touchmove') {
    event.preventDefault()
  }
  const currentPosition = getPositionX(event)
  const diff = currentPosition - startPos.value
  currentTranslate.value = prevTranslate.value + diff
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  
  const movedBy = currentTranslate.value - prevTranslate.value
  const threshold = getContainerWidth() * 0.2
  
  if (movedBy < -threshold) {
    currentSlide.value = (currentSlide.value + 1) % props.images.length
  } else if (movedBy > threshold) {
    currentSlide.value = (currentSlide.value - 1 + props.images.length) % props.images.length
  }
  
  updateCarousel()
  startAutoSlide()
}

watch(() => props.images, () => {
  currentSlide.value = 0
  nextTick(() => {
    updateCarousel()
    startAutoSlide()
  })
}, { immediate: true })

onMounted(() => {
  window.addEventListener('mousemove', handleTouchMove)
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('mouseup', handleTouchEnd)
  window.addEventListener('touchend', handleTouchEnd)
  startAutoSlide()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleTouchMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('mouseup', handleTouchEnd)
  window.removeEventListener('touchend', handleTouchEnd)
  stopAutoSlide()
})
</script>

<style scoped>
.carousel-container {
  overflow: hidden;
  position: relative;
  touch-action: pan-y;
}

.carousel-track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-drag: none;
}

.carousel-slide img {
  pointer-events: none;
}
</style>
