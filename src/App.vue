<template>
  <div :class="{ 'admin-active': isAdminMode }">
    <ClientView
      v-if="!isAdminMode"
      :games="games"
      @toggle-admin="toggleAdminMode"
    />
    <AdminView
      v-else
      :games="games"
      @toggle-mode="toggleAdminMode"
      @refresh="loadGames"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ClientView from './components/ClientView.vue'
import AdminView from './components/AdminView.vue'
import { gameService } from './services/supabase'

const isAdminMode = ref(false)
const games = ref([])

const loadGames = async () => {
  games.value = await gameService.getAllGames()
}

const toggleAdminMode = () => {
  isAdminMode.value = !isAdminMode.value
  if (!isAdminMode.value) {
    window.scrollTo(0, 0)
  }
}

onMounted(() => {
  loadGames()
})
</script>

<style>
#admin-view {
  display: none;
}

.admin-active #client-view {
  display: none;
}

.admin-active #admin-view {
  display: block;
}

body {
  margin: 0;
  padding: 0;
}
</style>
