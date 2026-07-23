import { computed, ref } from 'vue'

const parseDate = date => {
  const matched = String(date || '').match(/(\d{4})\s*[年.\-/]\s*(\d{1,2})(?:\s*[月.\-/]\s*(\d{1,2}))?/)
  return matched ? new Date(matched[1], Number(matched[2]) - 1, matched[3] || 1).getTime() : 0
}

export const useGameCatalog = (games, gameTags) => {
  const selectedTag = ref('全部')
  const sortMode = ref('default')

  const visibleTags = computed(() => [
    '全部',
    ...gameTags.value.filter(tag => games.value.some(game => Array.isArray(game.tags) && game.tags.includes(tag)))
  ])

  const displayedGames = computed(() => {
    const filtered = selectedTag.value === '全部'
      ? [...games.value]
      : games.value.filter(game => Array.isArray(game.tags) && game.tags.includes(selectedTag.value))

    if (sortMode.value === 'default') {
      return filtered.sort((a, b) => (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0))
    }

    const now = Date.now()
    return filtered.sort((a, b) => {
      const aDate = parseDate(a.releaseDate || a.date)
      const bDate = parseDate(b.releaseDate || b.date)
      const aReleased = a.released !== false && aDate <= now
      const bReleased = b.released !== false && bDate <= now
      if (aReleased !== bReleased) return aReleased ? 1 : -1
      return aReleased ? bDate - aDate : aDate - bDate
    })
  })

  const toggleSort = () => {
    sortMode.value = sortMode.value === 'default' ? 'release' : 'default'
  }

  return { selectedTag, sortMode, visibleTags, displayedGames, toggleSort }
}
