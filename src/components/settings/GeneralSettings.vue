<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSearchEngines } from '@/composables/useSearchEngines'
import { useWallpaperSettings } from '@/composables/useWallpaperSettings'
import { STORAGE_KEYS, BACKUP_KEYS, storage } from '@/utils/storage'

const { suggestEnabled, toggleSuggest } = useSearchEngines()
const { showInfo, showDate, showControls } = useWallpaperSettings()

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
    shortcutColumns.value = storage.get<number>(STORAGE_KEYS.SHORTCUT_COLUMNS, 8)
}

// 保存布局设置
const saveLayout = () => {
    storage.set(STORAGE_KEYS.SHORTCUT_COLUMNS, shortcutColumns.value)
    // 触发自定义事件，通知 ShortcutManager 更新布局
    window.dispatchEvent(new CustomEvent('shortcut-layout-change', { detail: shortcutColumns.value }))
}

// 监听布局变化
watch(shortcutColumns, saveLayout)

// 初始化
loadLayout()

// ==================== 配置备份 ====================
// 备份键来自 storage 工具（BACKUP_KEYS），新增配置项无需在此手动同步

// 读取并解析单个配置值（解析失败时回退为原始字符串）
const readValue = (key: string): unknown => {
    const raw = storage.getRaw(key)
    if (raw === null) return undefined
    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

// 写回单个配置值
const writeValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    storage.setRaw(key, typeof value === 'string' ? value : JSON.stringify(value))
}

// 导出全部配置
const exportConfig = () => {
    const data: Record<string, unknown> = {}
    for (const key of BACKUP_KEYS) {
        const value = readValue(key)
        if (value !== undefined) data[key] = value
    }

    const config = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        data,
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simple-search-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
}

// 导入全部配置
const importConfig = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const config = JSON.parse(text)

            if (!config.data || typeof config.data !== 'object') {
                alert('配置文件格式错误')
                return
            }

            if (!confirm('导入将覆盖当前全部配置（搜索引擎、快捷方式、布局、偏好），是否继续？')) {
                return
            }

            for (const key of BACKUP_KEYS) {
                if (config.data[key] !== undefined) {
                    writeValue(key, config.data[key])
                }
            }

            alert('导入成功，页面将刷新以应用配置')
            location.reload()
        } catch (error) {
            console.error('导入失败:', error)
            alert('导入失败，请检查文件格式')
        }
    }
    input.click()
}

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

        <!-- 壁纸设置 -->
        <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-4">壁纸设置</h2>

            <!-- 壁纸详情开关 -->
            <div class="flex items-center justify-between py-3">
                <div class="flex-1 pr-4">
                    <h3 class="font-medium text-gray-800">壁纸详情</h3>
                    <p class="text-sm text-gray-500 mt-1">在左下角显示壁纸描述与版权信息</p>
                </div>
                <button @click="showInfo = !showInfo" :class="[
                    'relative w-12 h-6 rounded-full transition-colors flex-shrink-0',
                    showInfo ? 'bg-blue-500' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        showInfo ? 'left-7' : 'left-1'
                    ]" />
                </button>
            </div>

            <!-- 壁纸日期开关 -->
            <div class="flex items-center justify-between py-3">
                <div class="flex-1 pr-4">
                    <h3 class="font-medium text-gray-800">壁纸日期</h3>
                    <p class="text-sm text-gray-500 mt-1">在右下角显示当前壁纸日期</p>
                </div>
                <button @click="showDate = !showDate" :class="[
                    'relative w-12 h-6 rounded-full transition-colors flex-shrink-0',
                    showDate ? 'bg-blue-500' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        showDate ? 'left-7' : 'left-1'
                    ]" />
                </button>
            </div>

            <!-- 切换与锁定按钮开关 -->
            <div class="flex items-center justify-between py-3">
                <div class="flex-1 pr-4">
                    <h3 class="font-medium text-gray-800">切换与锁定按钮</h3>
                    <p class="text-sm text-gray-500 mt-1">显示壁纸的上一天 / 下一天与锁定按钮</p>
                </div>
                <button @click="showControls = !showControls" :class="[
                    'relative w-12 h-6 rounded-full transition-colors flex-shrink-0',
                    showControls ? 'bg-blue-500' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        showControls ? 'left-7' : 'left-1'
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

        <!-- 配置备份 -->
        <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-4">配置备份</h2>

            <div class="flex items-center justify-between py-3">
                <div class="flex-1 pr-4">
                    <h3 class="font-medium text-gray-800">导出 / 导入配置</h3>
                    <p class="text-sm text-gray-500 mt-1">备份或恢复全部设置：搜索引擎、快捷方式、布局与偏好</p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <!-- 导出按钮 -->
                    <button @click="exportConfig"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span>导出</span>
                    </button>
                    <!-- 导入按钮 -->
                    <button @click="importConfig"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>导入</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
