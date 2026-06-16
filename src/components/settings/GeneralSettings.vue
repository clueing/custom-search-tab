<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSearchEngines } from '@/composables/useSearchEngines'

const { suggestEnabled, toggleSuggest } = useSearchEngines()

// 快捷方式布局设置
const LAYOUT_OPTIONS = [
    { cols: 4, label: '4 列' },
    { cols: 6, label: '6 列' },
    { cols: 8, label: '8 列' },
    { cols: 10, label: '10 列' },
]

const shortcutColumns = ref<number>(8)

// 加载布局设置
const loadLayout = () => {
    try {
        const stored = localStorage.getItem('shortcut_columns')
        if (stored) {
            shortcutColumns.value = Number(stored)
        }
    } catch (error) {
        console.error('加载布局设置失败:', error)
    }
}

// 保存布局设置
const saveLayout = () => {
    try {
        localStorage.setItem('shortcut_columns', String(shortcutColumns.value))
        // 触发自定义事件，通知 ShortcutManager 更新布局
        window.dispatchEvent(new CustomEvent('shortcut-layout-change', { detail: shortcutColumns.value }))
    } catch (error) {
        console.error('保存布局设置失败:', error)
    }
}

// 监听布局变化
watch(shortcutColumns, saveLayout)

// 初始化
loadLayout()
</script>

<template>
    <div class="space-y-6">
        <!-- 搜索设置 -->
        <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-4">搜索设置</h2>

            <!-- 搜索建议开关 -->
            <div class="flex items-center justify-between py-3">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">搜索建议</h3>
                    <p class="text-sm text-gray-500 mt-1">由百度提供，关闭后可提升隐私保护</p>
                </div>
                <button @click="toggleSuggest" :class="[
                    'relative w-12 h-6 rounded-full transition-colors',
                    suggestEnabled ? 'bg-blue-500' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        suggestEnabled ? 'left-7' : 'left-1'
                    ]" />
                </button>
            </div>
        </div>

        <!-- 快捷方式布局设置 -->
        <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-4">快捷方式布局</h2>

            <div>
                <h3 class="font-medium text-gray-800 mb-3">每行显示列数</h3>
                <div class="grid grid-cols-4 gap-2">
                    <button v-for="option in LAYOUT_OPTIONS" :key="option.cols" @click="shortcutColumns = option.cols"
                        :class="[
                            'py-2 px-4 rounded-lg border-2 transition-all',
                            shortcutColumns === option.cols
                                ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        ]">
                        {{ option.label }}
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                    当前：每行显示 {{ shortcutColumns }} 个快捷方式
                </p>
            </div>
        </div>
    </div>
</template>
