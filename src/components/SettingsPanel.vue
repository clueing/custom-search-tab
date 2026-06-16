<script setup lang="ts">
import { ref } from 'vue'
import CloseIcon from '@/assets/icon/IonClose.svg'
import SearchEngineManager from './settings/SearchEngineManager.vue'
import GeneralSettings from './settings/GeneralSettings.vue'

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
                                    <p class="text-sm text-gray-600">版本：1.0.0</p>
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
