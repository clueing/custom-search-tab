<script setup lang="ts">
import pkg from '../../package.json'

const version = pkg.version
const logoUrl = chrome.runtime.getURL('public/logo.png')
</script>

<template>
  <div class="p-5 text-gray-800">
    <!-- 头部 -->
    <div class="flex items-center gap-3 mb-4">
      <img :src="logoUrl" class="w-12 h-12 rounded-xl" alt="简单搜索" />
      <div>
        <h1 class="text-base font-bold leading-tight">简单搜索</h1>
        <p class="text-xs text-gray-500">版本 {{ version }}</p>
      </div>
    </div>

    <!-- 简介 -->
    <p class="text-sm text-gray-600 leading-relaxed mb-2">
      一个简约、安全、无广告的浏览器新标签页扩展。
    </p>
    <p class="text-sm text-gray-600 leading-relaxed mb-4">
      支持快速切换搜索引擎、自定义快捷方式和必应每日壁纸。
    </p>

    <!-- 项目地址 -->
    <a href="https://github.com/clueing/custom-search-tab" target="_blank" rel="noopener"
      class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      <span>项目地址</span>
    </a>
  </div>
</template>
