<template>
  <div class="game-card flex flex-col group cursor-pointer" @click="onClick">
    <div class="relative pt-[56.25%] w-full bg-slate-100 overflow-hidden">
      <img 
        :src="game.cover" 
        :alt="game.title" 
        class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      >
    </div>
    <div 
      class="flex justify-between items-center px-4 py-2 text-white text-xs font-semibold tracking-wider"
      :style="{ backgroundColor: game.color }"
    >
      <span class="truncate flex-1 mr-2" :title="game.verdict || game.price">{{ game.verdict || '售价 ' + game.price }}</span>
      <i class="fab fa-steam shrink-0 opacity-90 group-hover:scale-110 transition-transform"></i>
    </div>
    <div class="p-5">
      <h3 class="font-bold text-slate-800 text-lg leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">
        {{ game.title }}
      </h3>
      <p class="text-sm text-slate-500 truncate">{{ game.team }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const onClick = () => {
  emit('click')
}
</script>

<style scoped>
.game-card {
  break-inside: avoid;
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #f1f5f9;
}

.game-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
  .game-card {
    margin-bottom: 0;
  }
}
</style>
