<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
import ShortcutManager from '@/components/ShortcutManager.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { useWallpaperSettings } from '@/composables/useWallpaperSettings'
import { STORAGE_KEYS, storage } from '@/utils/storage'
import { onMounted, ref, computed } from 'vue'

// 设置面板显示状态
const showSettings = ref(false)

// 壁纸显示设置
const { showInfo, showDate, showControls } = useWallpaperSettings()

// const currentYear = ref(new Date().getFullYear())

// 壁纸数据结构
interface Wallpaper {
  url: string
  date: string // YYYY-MM-DD
  title?: string // 标题
  copyright?: string // 描述 / 版权
}

// 已获取的壁纸列表（最新在前，index 0 为今日）
const wallpapers = ref<Wallpaper[]>([])
const currentIndex = ref(0)

// 当前显示的壁纸
const current = ref<Wallpaper | null>(null)
const backgroundImageUrl = computed(() => current.value?.url || '')
const currentDate = computed(() => current.value?.date || '')
const currentInfo = computed(() => current.value?.title || current.value?.copyright || '')

// 锁定状态：锁定后固定显示某天壁纸，打开时不再自动获取最新
const locked = ref(false)

// 必应壁纸 API（idx=0 起、n=8 取最近 8 天）
const BING_API_OPTIONS = {
  official: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN',
  china: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8',
  proxy: 'https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN'
}

// 默认壁纸（所有获取方式都失败时使用）
const DEFAULT_WALLPAPER = 'https://www.bing.com/th?id=OHR.CopanRuins_ZH-CN2157795324_1920x1080.jpg'

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDateString = () => new Date().toISOString().split('T')[0]

// 必应 startdate (YYYYMMDD) -> YYYY-MM-DD
const formatBingDate = (s: string) =>
  s && s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : getTodayDateString()

// 壁纸列表缓存结构
interface WallpaperCache {
  date: string
  timestamp: number
  wallpapers: Wallpaper[]
}

// 读取 / 保存壁纸列表缓存
const getWallpaperCache = () => storage.get<WallpaperCache | null>(STORAGE_KEYS.WALLPAPER_CACHE, null)
const saveWallpaperCache = (date: string, list: Wallpaper[]) =>
  storage.set(STORAGE_KEYS.WALLPAPER_CACHE, { date, timestamp: Date.now(), wallpapers: list })

// 读取 / 保存 / 清除锁定信息
const getLock = () => storage.get<Wallpaper | null>(STORAGE_KEYS.WALLPAPER_LOCK, null)
const saveLock = (wallpaper: Wallpaper) => storage.set(STORAGE_KEYS.WALLPAPER_LOCK, wallpaper)
const clearLock = () => storage.remove(STORAGE_KEYS.WALLPAPER_LOCK)

// 从必应 API 获取最近多天壁纸
const fetchBingWallpapers = async (): Promise<Wallpaper[]> => {
  // 官方 API
  try {
    const res = await fetch(BING_API_OPTIONS.official)
    const data = await res.json()
    return data.images.map((img: any) => ({
      url: img.url.startsWith('http') ? img.url : `https://www.bing.com${img.url}`,
      date: formatBingDate(img.startdate),
      title: img.title,
      copyright: img.copyright,
    }))
  } catch (error) {
    console.error('必应官方API失败，尝试备用API:', error)

    // 备用方案1：中国区 API
    try {
      const res = await fetch(BING_API_OPTIONS.china)
      const data = await res.json()
      return data.images.map((img: any) => ({
        url: img.url.startsWith('http') ? img.url : `https://cn.bing.com${img.url}`,
        date: formatBingDate(img.startdate),
        title: img.title,
        copyright: img.copyright,
      }))
    } catch (error2) {
      console.error('中国区API也失败，尝试代理API:', error2)

      // 备用方案2：代理 API（仅当天一张，不支持往日切换）
      const res = await fetch(BING_API_OPTIONS.proxy)
      const data = await res.json()
      return [{ url: data.url, date: getTodayDateString(), copyright: data.copyright }]
    }
  }
}

// 应用指定索引的壁纸
const applyWallpaper = (index: number) => {
  const wp = wallpapers.value[index]
  if (!wp) return
  currentIndex.value = index
  current.value = wp
}

// 加载壁纸列表（带当天缓存）并显示最新
const loadWallpapers = async () => {
  const today = getTodayDateString()
  const cache = getWallpaperCache()

  // 命中当天缓存，直接使用
  if (cache && cache.date === today && Array.isArray(cache.wallpapers) && cache.wallpapers.length) {
    wallpapers.value = cache.wallpapers
    applyWallpaper(0)
    return
  }

  try {
    const list = await fetchBingWallpapers()
    wallpapers.value = list
    saveWallpaperCache(today, list)
    applyWallpaper(0)
  } catch (error) {
    console.error('获取壁纸失败:', error)

    // 获取失败，回退到旧缓存
    if (cache && Array.isArray(cache.wallpapers) && cache.wallpapers.length) {
      wallpapers.value = cache.wallpapers
      applyWallpaper(0)
    } else {
      current.value = { url: DEFAULT_WALLPAPER, date: getTodayDateString() }
    }
  }
}

// 是否可切换到上一天（更早）/ 下一天（更新）——锁定时禁用
const canPrev = computed(() => !locked.value && currentIndex.value < wallpapers.value.length - 1)
const canNext = computed(() => !locked.value && currentIndex.value > 0)

// 上一天（更早的壁纸）
const prevDay = () => {
  if (canPrev.value) applyWallpaper(currentIndex.value + 1)
}

// 下一天（更新的壁纸）
const nextDay = () => {
  if (canNext.value) applyWallpaper(currentIndex.value - 1)
}

// 锁定 / 解锁壁纸
const toggleLock = async () => {
  if (locked.value) {
    // 解锁：恢复自动获取最新
    locked.value = false
    clearLock()
    if (!wallpapers.value.length) {
      await loadWallpapers()
    }
  } else {
    // 锁定当前壁纸
    if (!current.value) return
    locked.value = true
    saveLock(current.value)
  }
}

// 校验图片 URL 是否可加载（必应旧壁纸 URL 可能已失效）
const verifyImageLoadable = (url: string) =>
  new Promise<boolean>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })

onMounted(async () => {
  document.title = '简单搜索'

  const lock = getLock()
  if (lock && lock.url) {
    // 已锁定：固定显示锁定壁纸，不自动获取最新
    locked.value = true
    current.value = lock

    // 校验锁定壁纸是否仍可访问，失效则回退默认壁纸（仍保持锁定状态）
    const ok = await verifyImageLoadable(lock.url)
    if (!ok) {
      console.warn('锁定壁纸已失效，回退默认壁纸')
      current.value = { ...lock, url: DEFAULT_WALLPAPER }
    }
    return
  }

  await loadWallpapers()
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-60 bg-cover bg-center relative"
    :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 暗色遮罩层 -->
    <div class="absolute inset-0 bg-black/25 z-10"></div>

    <!-- 右上角设置按钮 -->
    <button @click="showSettings = true" title="设置" aria-label="设置"
      class="fixed top-6 right-6 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:shadow-lg hover:scale-110 transition-all flex items-center justify-center group">
      <svg class="w-5 h-5 text-gray-600 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- 搜索区域 -->
    <header class="w-full max-w-2xl px-6 z-30">
      <!-- 搜索 -->
      <SearchBar class="w-full" />
    </header>

    <!-- 快捷方式 -->
    <main class="w-full max-w-5xl px-6 mt-12 z-20">
      <ShortcutManager />
    </main>

    <!-- 设置面板 -->
    <SettingsPanel v-model:show="showSettings" />

    <!-- 壁纸详情（描述 / 版权） -->
    <div v-if="showInfo && currentInfo" class="fixed bottom-6 left-6 z-30 max-w-md">
      <p class="px-4 py-2 rounded-xl bg-black/30 backdrop-blur text-white text-sm shadow select-none">
        {{ currentInfo }}
      </p>
    </div>

    <!-- 壁纸控制条 -->
    <div v-if="(showDate && currentDate) || showControls" class="fixed bottom-6 right-6 z-30 flex items-center gap-2">
      <!-- 当前壁纸日期 -->
      <span v-if="showDate && currentDate"
        class="px-3 h-9 flex items-center rounded-full bg-white/80 backdrop-blur shadow text-xs text-gray-600 select-none">
        {{ currentDate }}
      </span>

      <!-- 切换按钮（锁定时隐藏） -->
      <template v-if="showControls && !locked">
        <button @click="prevDay" :disabled="!canPrev" title="上一天" aria-label="上一天"
          class="w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center text-gray-600 transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button @click="nextDay" :disabled="!canNext" title="下一天" aria-label="下一天"
          class="w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center text-gray-600 transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </template>

      <!-- 锁定 / 解锁 -->
      <button v-if="showControls" @click="toggleLock" :title="locked ? '解锁壁纸（恢复自动更新）' : '锁定当前壁纸'"
        :aria-label="locked ? '解锁壁纸' : '锁定壁纸'"
        class="w-9 h-9 rounded-full backdrop-blur shadow flex items-center justify-center transition-all hover:scale-110"
        :class="locked ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-600'">
        <!-- 已锁定图标 -->
        <svg v-if="locked" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <!-- 未锁定图标 -->
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 11V7a4 4 0 018 0m-4 8v-2m-6 9h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      </button>
    </div>

    <!-- 页脚（可选） -->
    <!-- <footer class="mt-auto py-6 text-3 text-[#dddddd]">
      © {{ currentYear }} 简单搜索
    </footer> -->
  </div>
</template>

<style scoped></style>