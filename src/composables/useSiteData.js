import { ref } from 'vue'
import { gameService, siteSettingsService } from '../services/supabase'

const emptySiteSettings = () => ({ mobileBannerUrls: [], steamWishlistEnabled: false, gameTags: [] })

export const useSiteData = () => {
  const games = ref([])
  const siteSettings = ref(emptySiteSettings())

  const loadGames = async () => {
    games.value = await gameService.getAllGames()
  }

  const loadSiteSettings = async () => {
    const [mobileBannerUrls, steamWishlistEnabled, gameTags] = await Promise.all([
      siteSettingsService.getMobileBannerUrls(),
      siteSettingsService.getSteamWishlistEnabled(),
      siteSettingsService.getGameTags()
    ])
    siteSettings.value = { mobileBannerUrls, steamWishlistEnabled, gameTags }
  }

  const refreshSiteData = async () => {
    await Promise.all([loadGames(), loadSiteSettings()])
  }

  return { games, siteSettings, refreshSiteData }
}
