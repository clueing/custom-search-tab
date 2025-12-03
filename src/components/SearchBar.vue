<script setup lang="ts">
import type { SearchEngine } from '@/types/search'
import CloseIcon from '@/assets/icon/IonClose.svg'
import { ref, computed } from 'vue'

const searchEngines: SearchEngine[] = [
    {
        id: 1,
        name: '百度',
        icon: 'https://www.baidu.com/favicon.ico',
        searchUrl: (kw: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(kw)}`,
        suggestUrl: (kw: string) => `https://suggestion.baidu.com/su?wd=${encodeURIComponent(kw)}`,
    },
    {
        id: 2,
        name: '必应',
        icon: 'https://infinity-permanent.infinitynewtab.com/infinity/search-add/bing_new.png?imageMogr2/thumbnail/240x/format/webp/blur/1x0/quality/100|imageslim',
        searchUrl: (kw: string) => `https://www.bing.com/search?q=${encodeURIComponent(kw)}`,
    },
    {
        id: 3,
        name: '谷歌',
        icon: 'https://www.google.com/favicon.ico',
        searchUrl: (kw: string) => `https://www.google.com/search?q=${encodeURIComponent(kw)}`,
    },
]

const keyword = ref('')
const showDrop = ref(false)
const activeId = ref(1)          // 默认百度

const currentEngine = computed<SearchEngine>(
    () => searchEngines.find(e => e.id === activeId.value) || searchEngines[0]
)

const doSearch = () => {
    if (!keyword.value.trim()) return
    window.open(currentEngine.value.searchUrl(keyword.value), '_blank')
}
</script>

<template>
    <section class="w-full max-w-2xl mx-auto">
        <!-- 搜索框 -->
        <form @submit.prevent="doSearch" class="relative flex items-center h-14 px-4 rounded-2xl bg-white shadow-lg">
            <!-- 引擎选择 -->
            <button type="button" @click="showDrop = !showDrop"
                class="flex items-center gap-2 mr-3 outline-none bg-white">
                <img :src="currentEngine.icon" class="w-6 h-6 object-contain" draggable="false" />
                <span class="i-carbon-chevron-down text-gray-500" />
            </button>

            <!-- 输入 -->
            <div class="flex-1 relative h-full">
                <input v-model="keyword" type="text" placeholder="输入并搜索"
                    class="w-full h-full outline-none bg-transparent" />
                <button v-if="keyword" type="button" @click="keyword = ''"
                    class="bg-white absolute right-0 top-0 h-full px-2 text-gray-400 hover:text-gray-700">
                    <img class="w-5 h-5" :src="CloseIcon" alt="×" />
                </button>
            </div>

            <!-- 下拉引擎列表 -->
            <Transition name="fade">
                <div v-if="showDrop" @click="() => (showDrop = false)"
                    class="absolute top-16 left-0 w-full max-h-60 overflow-y-auto rounded-2xl bg-white shadow-xl p-3 grid grid-cols-4 gap-3">
                    <div v-for="e in searchEngines" :key="e.id" @click="activeId = e.id; showDrop = false"
                        class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <img :src="e.icon" class="w-8 h-8 object-contain" draggable="false" />
                        <span class="text-xs text-gray-700">{{ e.name }}</span>
                    </div>
                </div>
            </Transition>
        </form>
    </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>