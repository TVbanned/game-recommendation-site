<template>
  <div ref="container" class="carousel-container relative w-full detail-carousel bg-slate-900" @mousedown="startDrag" @touchstart="startDrag">
    <div class="carousel-track" :style="{ transform: `translateX(${translate}px)`, transition: dragging ? 'none' : 'transform .3s cubic-bezier(.25,.46,.45,.94)' }">
      <div v-for="(image, index) in images" :key="`${image}-${index}`" class="carousel-slide bg-slate-200">
        <a v-if="links[index]" :href="links[index]" target="_blank" rel="noopener noreferrer" class="block h-full"><img :src="imageUrl(image)" :alt="`${altPrefix} ${index + 1}`" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="w-full h-full object-cover" @error="onImageError"></a>
        <img v-else :src="imageUrl(image)" :alt="`${altPrefix} ${index + 1}`" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="w-full h-full object-cover" @error="onImageError">
      </div>
    </div>
    <div v-if="images.length > 1" class="absolute bottom-4 w-full flex justify-center gap-2 z-10"><button v-for="(_, index) in images" :key="index" class="w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm" :class="index === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'" @click="goToSlide(index)"></button></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { imageFallback, proxyImageUrl } from '../utils/frontend'
const props = defineProps({ images: { type: Array, default: () => [] }, links: { type: Array, default: () => [] }, altPrefix: { type: String, default: '截图' } })
const container = ref(null); const currentSlide = ref(0); const translate = ref(0); const previousTranslate = ref(0); const dragging = ref(false); const startPosition = ref(0)
let interval = null
const width = () => container.value?.offsetWidth || 0
const update = () => { translate.value = -currentSlide.value * width(); previousTranslate.value = translate.value }
const stopAuto = () => clearInterval(interval)
const startAuto = () => { stopAuto(); if (props.images.length > 1) interval = setInterval(() => { currentSlide.value = (currentSlide.value + 1) % props.images.length; update() }, 3000) }
const goToSlide = index => { currentSlide.value = index; update(); startAuto() }
const position = event => event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
const startDrag = event => { if (props.images.length < 2) return; dragging.value = true; startPosition.value = position(event); stopAuto() }
const moveDrag = event => { if (!dragging.value) return; if (event.type === 'touchmove') event.preventDefault(); translate.value = previousTranslate.value + position(event) - startPosition.value }
const endDrag = () => { if (!dragging.value) return; dragging.value = false; const delta = translate.value - previousTranslate.value; if (delta < -width() * .2) currentSlide.value = (currentSlide.value + 1) % props.images.length; if (delta > width() * .2) currentSlide.value = (currentSlide.value - 1 + props.images.length) % props.images.length; update(); startAuto() }
const imageUrl = image => proxyImageUrl(image, 800)
const onImageError = event => { event.target.onerror = null; event.target.src = imageFallback(props.altPrefix) }
watch(() => props.images, () => { currentSlide.value = 0; nextTick(() => { update(); startAuto() }) }, { immediate: true })
onMounted(() => { window.addEventListener('resize', update); window.addEventListener('mousemove', moveDrag); window.addEventListener('touchmove', moveDrag, { passive: false }); window.addEventListener('mouseup', endDrag); window.addEventListener('touchend', endDrag); startAuto() })
onUnmounted(() => { window.removeEventListener('resize', update); window.removeEventListener('mousemove', moveDrag); window.removeEventListener('touchmove', moveDrag); window.removeEventListener('mouseup', endDrag); window.removeEventListener('touchend', endDrag); stopAuto() })
</script>

<style scoped>
.carousel-container { overflow: hidden; touch-action: pan-y; }.carousel-track { display: flex; height: 100%; will-change: transform; }.carousel-slide { flex: 0 0 100%; width: 100%; height: 100%; user-select: none; -webkit-user-drag: none; }.carousel-slide img { pointer-events: none; }
.detail-carousel { aspect-ratio: 2 / 1; }
@media (min-width: 768px) { .detail-carousel { aspect-ratio: auto; height: 18rem; } }
.mobile-banner.carousel-container { height: 12rem; border: 1px solid rgba(255,255,255,.4); border-radius: 1rem; background: linear-gradient(135deg,rgba(255,255,255,.45) 0%,rgba(255,255,255,.15) 40%,rgba(255,255,255,.25) 100%); box-shadow: 0 8px 32px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); touch-action: manipulation; }.mobile-banner :deep(.carousel-track) { height: 100%; }.mobile-banner :deep(.carousel-slide) { height: 100%; }.mobile-banner :deep(.absolute.bottom-4) { bottom: .75rem; }
</style>