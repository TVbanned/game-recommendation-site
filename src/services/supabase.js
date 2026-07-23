import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 默认数据
const defaultData = [
  {
    id: '1700000001',
    title: '绍宋：还我河山',
    team: '互动之星开发组',
    type: '影视互动游戏',
    price: '18.20',
    color: '#8b5cf6',
    cover: 'https://placehold.co/600x340/3f3f46/ffffff?text=Zhao+Song+Cover',
    screenshots: [
      'https://placehold.co/800x600/475569/ffffff?text=Screenshot+1',
      'https://placehold.co/800x600/334155/ffffff?text=Screenshot+2',
      'https://placehold.co/800x600/1e293b/ffffff?text=Screenshot+3'
    ],
    target_url: 'https://store.steampowered.com/',
    date: '2026.8',
    description: '这是一沉浸式真人互动历史权谋影视游戏！你将化身赵玖，魂穿南宋最具争议的皇帝赵构，每次抉择都将左右王朝气运、定夺天下兴亡！面对靖康之变后的山河破碎，你能否打破宿命再造山河？',
    zhihu_author: '李制作 (制作人)',
    zhihu_avatar: 'https://placehold.co/100x100/fbbf24/000000?text=Dev',
    zhihu_content: '开发这款游戏最大的乐趣在于历史的推演。我们在剧本上花费了数年时间，考证了大量的宋史资料。最核心的玩法是"势"，玩家不仅要在朝堂上平衡文武，还要考虑到金国的军事压力。每一次在选项前的犹豫，都是我们希望带给玩家的历史沉重感。'
  },
  {
    id: '1700000002',
    title: '隐形守护者',
    team: 'NewOne Studio',
    type: '谍战互动影像',
    price: '38.00',
    color: '#0f766e',
    cover: 'https://placehold.co/600x340/1c1917/ffffff?text=Invisible+Guardian',
    screenshots: ['https://placehold.co/800x600/000000/ffffff?text=Spy+Game+Pic+1'],
    target_url: 'https://store.steampowered.com/',
    date: '2019.1',
    description: '你叫肖途，两年前的你，还是上海一个名噪一时的爱国学生。现在，你成为了潜伏在敌后的一名谍报人员。你的每一个选择都生死攸关。',
    zhihu_author: '谍战策划组',
    zhihu_avatar: 'https://placehold.co/100x100/10b981/ffffff?text=Spy',
    zhihu_content: '为了还原那个年代的质感，所有的服装、道具都是定制的。我们希望玩家不仅是在玩游戏，更像是在经历一部能够自己主导结局的谍战大片。'
  },
  {
    id: '1700000003',
    title: '飞越13号房',
    team: 'ALT Lab',
    type: '悬疑逃生',
    price: '42.00',
    color: '#b45309',
    cover: 'https://placehold.co/600x340/451a03/ffffff?text=Room+13',
    screenshots: [
      'https://placehold.co/800x600/27272a/ffffff?text=Escape+1',
      'https://placehold.co/800x600/3f3f46/ffffff?text=Escape+2'
    ],
    target_url: 'https://store.steampowered.com/',
    date: '2023.1',
    description: '属于中国青年的悬疑互动影像作品。背景设定在21世纪初，你将扮演一名驰骋游戏世界的叛逆少年，被送入了一所行为矫正中心。',
    zhihu_author: 'ALT主策',
    zhihu_avatar: 'https://placehold.co/100x100/dc2626/ffffff?text=ALT',
    zhihu_content: '这不是一个轻松的故事。我们深入调查了许多真实的案例。游戏里最难的设计是如何在绝望中给玩家留下一线生机，以及同伴之间的羁绊和背叛。'
  }
]

// 本地存储工具函数
const getLocalGames = () => {
  try {
    const data = localStorage.getItem('gamesData')
    return data ? JSON.parse(data) : defaultData
  } catch {
    return defaultData
  }
}

const setLocalGames = (games) => {
  try {
    localStorage.setItem('gamesData', JSON.stringify(games))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

const defaultActivities = [
  {
    id: 'default-activity',
    title: '全部游戏',
    nav_title: '全部游戏',
    banner_url: '',
    banner_link: '',
    is_featured: false,
    sort_order: 999
  }
]

const getLocalActivities = () => {
  try {
    const data = localStorage.getItem('activitiesData')
    return data ? JSON.parse(data) : defaultActivities
  } catch {
    return defaultActivities
  }
}

const setLocalActivities = (activities) => {
  localStorage.setItem('activitiesData', JSON.stringify(activities))
}

const getLocalActivityGames = () => {
  try {
    const data = localStorage.getItem('activityGamesData')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const setLocalActivityGames = (relations) => {
  localStorage.setItem('activityGamesData', JSON.stringify(relations))
}

// 检查 Supabase 配置是否有效
const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseUrl !== '' && 
         supabaseAnonKey && supabaseAnonKey !== ''
}

// 创建 Supabase 客户端（仅在配置有效时）
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const activityService = {
  async getAllActivities() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('activities').select('*').order('is_featured', { ascending: false }).order('sort_order')
      if (!error) return data
    }
    return getLocalActivities()
  },

  async createActivity(activityData, gameIds = []) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('activities').insert([activityData]).select()
      if (!error) {
        await this.setActivityGames(activityData.id, gameIds)
        return data[0]
      }
    }
    const activities = getLocalActivities()
    activities.push(activityData)
    setLocalActivities(activities)
    await this.setActivityGames(activityData.id, gameIds)
    return activityData
  },

  async updateActivity(id, activityData, gameIds = []) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('activities').update(activityData).eq('id', id).select()
      if (!error) {
        await this.setActivityGames(id, gameIds)
        return data[0]
      }
    }
    const activities = getLocalActivities()
    const index = activities.findIndex(activity => activity.id === id)
    if (index === -1) return null
    activities[index] = { ...activities[index], ...activityData }
    setLocalActivities(activities)
    await this.setActivityGames(id, gameIds)
    return activities[index]
  },

  async deleteActivity(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (!error) return true
    }
    setLocalActivities(getLocalActivities().filter(activity => activity.id !== id))
    setLocalActivityGames(getLocalActivityGames().filter(relation => relation.activity_id !== id))
    return true
  },

  async getActivityGameIds(activityId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('activity_games').select('game_id').eq('activity_id', activityId).order('sort_order')
      if (!error) return data.map(relation => relation.game_id)
    }
    return getLocalActivityGames().filter(relation => relation.activity_id === activityId).sort((a, b) => a.sort_order - b.sort_order).map(relation => relation.game_id)
  },

  async setActivityGames(activityId, gameIds) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('activity_games').delete().eq('activity_id', activityId)
      if (!error && gameIds.length) {
        await supabase.from('activity_games').insert(gameIds.map((gameId, index) => ({ activity_id: activityId, game_id: gameId, sort_order: index })))
      }
      if (!error) return true
    }
    const relations = getLocalActivityGames().filter(relation => relation.activity_id !== activityId)
    relations.push(...gameIds.map((gameId, index) => ({ activity_id: activityId, game_id: gameId, sort_order: index })))
    setLocalActivityGames(relations)
    return true
  }
}

export const gameService = {
  async getAllGames() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error) {
          return data
        }
        console.log('Supabase failed, falling back to localStorage:', error)
      } catch (e) {
        console.log('Supabase connection failed, falling back to localStorage:', e)
      }
    }
    return getLocalGames()
  },

  async getGameById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .single()
        
        if (!error) {
          return data
        }
      } catch (e) {
        console.log('Supabase connection failed, falling back to localStorage')
      }
    }
    const games = getLocalGames()
    return games.find(g => g.id === id) || null
  },

  async createGame(gameData) {
    // 检查 ID 是否已存在，防止重复创建
    const existing = await this.getGameById(gameData.id)
    if (existing) {
      console.warn('Game with id ' + gameData.id + ' already exists, skipping creation')
      return existing
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('games')
          .insert([gameData])
          .select()
        
        if (!error) {
          return data[0]
        }
      } catch (e) {
        console.log('Supabase connection failed, falling back to localStorage')
      }
    }
    const games = getLocalGames()
    // 再次确认本地没有重复 ID
    if (games.find(g => g.id === gameData.id)) {
      return gameData
    }
    const newGame = { ...gameData, created_at: new Date().toISOString() }
    games.unshift(newGame)
    setLocalGames(games)
    return newGame
  },

  async updateGame(id, gameData) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', id)
          .select()
        
        if (!error) {
          return data[0]
        }
      } catch (e) {
        console.log('Supabase connection failed, falling back to localStorage')
      }
    }
    const games = getLocalGames()
    const index = games.findIndex(g => g.id === id)
    if (index > -1) {
      games[index] = { ...games[index], ...gameData, updated_at: new Date().toISOString() }
      setLocalGames(games)
      return games[index]
    }
    return null
  },

  async deleteGame(id) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', id)
        
        if (!error) {
          return true
        }
      } catch (e) {
        console.log('Supabase connection failed, falling back to localStorage')
      }
    }
    const games = getLocalGames()
    const filteredGames = games.filter(g => g.id !== id)
    setLocalGames(filteredGames)
    return true
  },

  async migrateFromLocalStorage(localGames) {
    const results = []
    for (const game of localGames) {
      const gameData = {
        id: game.id,
        title: game.title,
        team: game.team,
        type: game.type,
        price: game.price,
        color: game.color,
        cover: game.cover,
        screenshots: game.screenshots || [],
        target_url: game.targetUrl,
        date: game.date,
        description: game.desc,
        zhihu_author: game.zhihuAuthor,
        zhihu_avatar: game.zhihuAvatar,
        zhihu_content: game.zhihuContent
      }
      
      const result = await this.createGame(gameData)
      if (result) results.push(result)
    }
    return results
  }
}
