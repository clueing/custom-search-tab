<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
import ShortcutManager from '@/components/ShortcutManager.vue'
import { onMounted, ref } from 'vue';

// const currentYear = ref(new Date().getFullYear())

// 背景图片 URL
const backgroundImageUrl = ref('')

// 必应壁纸API地址（可选其中一个）
const BING_API_OPTIONS = {
  official: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
  china: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
  proxy: 'https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN'
}

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDateString = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 从本地存储获取壁纸缓存
const getWallpaperCache = () => {
  try {
    const cache = localStorage.getItem('bing_wallpaper_cache')
    return cache ? JSON.parse(cache) : null
  } catch (error) {
    console.error('读取壁纸缓存失败:', error)
    return null
  }
}

// 保存壁纸到本地存储
const saveWallpaperCache = (url: string, date: string) => {
  try {
    const cache = {
      url,
      date,
      timestamp: Date.now()
    }
    localStorage.setItem('bing_wallpaper_cache', JSON.stringify(cache))
  } catch (error) {
    console.error('保存壁纸缓存失败:', error)
  }
}

// 从必应API获取壁纸
const fetchBingWallpaper = async () => {
  try {
    // 优先使用官方API
    const response = await fetch(BING_API_OPTIONS.official)
    const data = await response.json()

    // 拼接完整URL
    let imageUrl = data.images[0].url
    if (!imageUrl.startsWith('http')) {
      imageUrl = `https://www.bing.com${imageUrl}`
    }

    return imageUrl
  } catch (error) {
    console.error('必应官方API失败，尝试备用API:', error)

    // 备用方案1：中国区API
    try {
      const response = await fetch(BING_API_OPTIONS.china)
      const data = await response.json()
      let imageUrl = data.images[0].url
      if (!imageUrl.startsWith('http')) {
        imageUrl = `https://cn.bing.com${imageUrl}`
      }
      return imageUrl
    } catch (error2) {
      console.error('中国区API也失败，尝试代理API:', error2)

      // 备用方案2：代理API
      try {
        const response = await fetch(BING_API_OPTIONS.proxy)
        const data = await response.json()
        return data.url
      } catch (error3) {
        console.error('所有API都失败了:', error3)
        throw new Error('无法获取壁纸')
      }
    }
  }
}

// 获取并更新壁纸
const fetchAndUpdateWallpaper = async () => {
  try {
    const wallpaperUrl = await fetchBingWallpaper()
    const today = getTodayDateString()

    backgroundImageUrl.value = wallpaperUrl
    saveWallpaperCache(wallpaperUrl, today)

    console.log('今日壁纸链接:', wallpaperUrl)
  } catch (error) {
    console.error('获取今日壁纸失败:', error)

    // 获取失败，尝试使用缓存的壁纸
    const cache = getWallpaperCache()
    if (cache && cache.url) {
      backgroundImageUrl.value = cache.url
      console.log('使用缓存壁纸:', cache.url, '日期:', cache.date)
    } else {
      console.warn('没有可用的壁纸缓存')
      // 可以设置一个默认壁纸
      backgroundImageUrl.value = 'https://source.unsplash.com/random/1920x1080'
    }
  }
}

onMounted(async () => {
  document.title = '简单搜索'
  const today = getTodayDateString()
  const cache = getWallpaperCache()

  // 检查是否有今天的缓存
  if (cache && cache.date === today && cache.url) {
    // 使用今天的缓存
    backgroundImageUrl.value = cache.url
    console.log('使用今日缓存壁纸:', cache.url)
  } else {
    // 没有今天的缓存，获取最新壁纸
    console.log('获取今日最新壁纸...')
    await fetchAndUpdateWallpaper()
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-60 bg-cover bg-center relative"
    :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 暗色遮罩层 -->
    <div class="absolute inset-0 bg-black/25 z-10"></div>
    <!-- 搜索区域 -->
    <header class="w-full max-w-2xl px-6 z-30">
      <!-- 搜索 -->
      <SearchBar class="w-full" />
    </header>

    <!-- 快捷方式 -->
    <main class="w-full max-w-5xl px-6 mt-12 z-20">
      <ShortcutManager />
    </main>

    <!-- 页脚（可选） -->
    <!-- <footer class="mt-auto py-6 text-3 text-[#dddddd]">
      © {{ currentYear }} 简单搜索
    </footer> -->
  </div>
</template>

<style scoped></style>