<template>
  <div :class="{ 'admin-active': isAdminMode }">
    <ClientView
      v-if="!isAdminMode"
      :games="games"
      :activities="activities"
      :activity-game-map="activityGameMap"
      @toggle-admin="toggleAdminMode"
    />
    <AdminView
      v-else
      :games="games"
      :activities="activities"
      :activity-game-map="activityGameMap"
      @toggle-mode="toggleAdminMode"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ClientView from './components/ClientView.vue'
import AdminView from './components/AdminView.vue'
import { activityService, gameService } from './services/supabase'

const isAdminMode = ref(false)
const games = ref([])
const activities = ref([])
const activityGameMap = ref({})

const loadData = async () => {
  const [loadedGames, loadedActivities] = await Promise.all([
    gameService.getAllGames(),
    activityService.getAllActivities()
  ])
  games.value = loadedGames
  activities.value = loadedActivities
  activityGameMap.value = Object.fromEntries(await Promise.all(
    loadedActivities.map(async activity => [activity.id, await activityService.getActivityGameIds(activity.id)])
  ))
}

const toggleAdminMode = () => {
  isAdminMode.value = !isAdminMode.value
  if (!isAdminMode.value) window.scrollTo(0, 0)
}

onMounted(loadData)
</script>

<style>
#admin-view { display: none; }
.admin-active #client-view { display: none; }
.admin-active #admin-view { display: block; }
body { margin: 0; padding: 0; }
</style>
