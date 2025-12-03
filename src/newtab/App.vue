<script setup lang="ts">
import { getBingWallpaper } from 'bing-wallpaper-api';
import { onMounted, ref } from 'vue';

// 背景图片 URL
const backgroundImageUrl = ref('')

onMounted(async () => {
  // 异步获取今日壁纸
  const todayWallpaper = await getBingWallpaper();
  backgroundImageUrl.value = todayWallpaper.url;
  console.log('今日壁纸链接:', todayWallpaper.url);
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-80" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 搜索区域 -->
    <header class="w-full max-w-2xl px-6">
      <form role="search" class="flex items-center gap-3" onsubmit="return false">
        <label class="sr-only" for="search">搜索</label>
        <input id="search" type="search" placeholder="请输入关键词"
          class="flex-1 h-12 px-4 rounded-full border-1 border-#ddd bg-white shadow-sm focus:outline-none focus:border-blue-500" />
        <button type="submit"
          class="h-12 px-6 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800">
          搜索
        </button>
      </form>
    </header>

    <!-- 快捷方式 -->
    <main class="w-full max-w-5xl px-6 mt-12">
      <section aria-label="快捷方式">
        <ul class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          <!-- 单个快捷卡片 -->
          <li class="flex flex-col items-center gap-2">
            <a href="https://juejin.cn" target="_blank" rel="noopener"
              class="w-14 h-14 rounded-2xl bg-white shadow hover:shadow-md flex items-center justify-center">
              <span class="i-carbon-logo-github text-2xl"></span>
            </a>
            <span class="text-sm text-#666">掘金</span>
          </li>

          <li class="flex flex-col items-center gap-2">
            <a href="https://github.com" target="_blank" rel="noopener"
              class="w-14 h-14 rounded-2xl bg-white shadow hover:shadow-md flex items-center justify-center">
              <span class="i-carbon-logo-github text-2xl"></span>
            </a>
            <span class="text-sm text-#666">GitHub</span>
          </li>

          <!-- 复制 <li> 可继续添加 -->
        </ul>
      </section>
    </main>

    <!-- 页脚（可选） -->
    <footer class="mt-auto py-6 text-3 text-#999">
      © 2025 My Simple Search
    </footer>
  </div>
</template>

<style scoped></style>
