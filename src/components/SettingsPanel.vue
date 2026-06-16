<script setup lang="ts">
import { ref } from 'vue'
import CloseIcon from '@/assets/icon/IonClose.svg'
import SearchEngineManager from './settings/SearchEngineManager.vue'
import GeneralSettings from './settings/GeneralSettings.vue'
import pkg from '../../package.json'

// 扩展版本号（与 package.json 同步）
const version = pkg.version

// 定义 props 和 emits
defineProps<{
    show: boolean
}>()

const emit = defineEmits<{
    'update:show': [value: boolean]
}>()

// 当前激活的 Tab
const activeTab = ref<'engines' | 'general' | 'about'>('engines')

// 关闭面板
const close = () => {
    emit('update:show', false)
}

// 切换 Tab
const switchTab = (tab: 'engines' | 'general' | 'about') => {
    activeTab.value = tab
}
</script>

<template>
    <Teleport to="body">
        <Transition name="slide">
            <div v-if="show" class="fixed inset-0 z-200">
                <!-- 半透明遮罩 -->
                <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="close"></div>

                <!-- 右侧面板 -->
                <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                    <!-- 头部 -->
                    <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h1 class="text-xl font-bold text-gray-800">设置</h1>
                        <button @click="close"
                            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <img :src="CloseIcon" class="w-5 h-5" alt="关闭" />
                        </button>
                    </header>

                    <!-- Tab 切换 -->
                    <nav class="flex gap-2 px-6 py-4">
                        <button @click="switchTab('engines')" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                            activeTab === 'engines'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]">
                            搜索引擎
                        </button>
                        <button @click="switchTab('general')" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                            activeTab === 'general'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]">
                            通用设置
                        </button>
                        <button @click="switchTab('about')" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                            activeTab === 'about'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]">
                            关于
                        </button>
                    </nav>

                    <!-- 内容区域 -->
                    <main class="flex-1 overflow-y-auto p-6">
                        <!-- 搜索引擎管理 Tab -->
                        <div v-show="activeTab === 'engines'">
                            <SearchEngineManager />
                        </div>

                        <!-- 通用设置 Tab -->
                        <div v-show="activeTab === 'general'">
                            <GeneralSettings />
                        </div>

                        <!-- 关于 Tab -->
                        <div v-show="activeTab === 'about'">
                            <div class="space-y-4">
                                <div>
                                    <h3 class="text-lg font-semibold mb-2">简单搜索</h3>
                                    <p class="text-sm text-gray-600">版本：{{ version }}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">
                                        一个简约、安全、无广告的浏览器新标签页扩展。
                                    </p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">
                                        支持快速切换搜索引擎、自定义快捷方式和必应每日壁纸。
                                    </p>
                                </div>
                                <div>
                                    <a href="https://github.com/clueing/custom-search-tab" target="_blank"
                                        rel="noopener"
                                        class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                        <span>项目地址</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* 滑入滑出动画 */
.slide-enter-active,
.slide-leave-active {
    transition: opacity 200ms ease-out;
}

.slide-enter-active .absolute.right-0,
.slide-leave-active .absolute.right-0 {
    transition: transform 200ms ease-out;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
}

.slide-enter-from .absolute.right-0,
.slide-leave-to .absolute.right-0 {
    transform: translateX(100%);
}
</style>
