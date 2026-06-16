<script setup lang="ts">
import { ref } from 'vue'
import { useSearchEngines } from '@/composables/useSearchEngines'
import EditIcon from '@/assets/icon/MaterialSymbolsEdit.svg'
import DeleteIcon from '@/assets/icon/MaterialSymbolsDeleteOutline.svg'
import SearchEngineForm from './SearchEngineForm.vue'

const { engines, customEngines, deleteEngine, activeEngineId, setActiveEngine, searchEngines, addEngine } = useSearchEngines()

// 表单相关状态
const showForm = ref(false)
const editingEngineId = ref<number | null>(null)

// 打开添加引擎表单
const openAddForm = () => {
    editingEngineId.value = null
    showForm.value = true
}

// 打开编辑引擎表单
const openEditForm = (id: number) => {
    editingEngineId.value = id
    showForm.value = true
}

// 关闭表单
const closeForm = () => {
    showForm.value = false
    editingEngineId.value = null
}

// 删除自定义引擎
const handleDelete = (id: number) => {
    const engine = engines.value.find(e => e.id === id)
    if (engine && confirm(`确定要删除"${engine.name}"吗？`)) {
        deleteEngine(id)
    }
}

// 导出配置
const exportConfig = () => {
    const config = {
        engines: searchEngines.value,
        activeEngineId: activeEngineId.value,
        exportTime: new Date().toISOString(),
        version: '1.0'
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-engines-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
}

// 导入配置
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

            if (!config.engines || !Array.isArray(config.engines)) {
                alert('配置文件格式错误')
                return
            }

            if (!confirm('导入配置将覆盖当前所有自定义引擎，是否继续？')) {
                return
            }

            // 导入引擎（仅导入自定义引擎）
            const customImported = config.engines.filter((e: any) => e.isCustom)
            customImported.forEach((e: any) => {
                addEngine({
                    name: e.name,
                    searchUrlTemplate: e.searchUrlTemplate,
                    icon: e.icon
                })
            })

            alert(`成功导入 ${customImported.length} 个自定义搜索引擎`)
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
        <!-- 当前引擎列表 -->
        <div>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">搜索引擎</h2>
                <div class="flex gap-2">
                    <!-- 导入按钮 -->
                    <button @click="importConfig"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>导入</span>
                    </button>
                    <!-- 导出按钮 -->
                    <button @click="exportConfig"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span>导出</span>
                    </button>
                    <!-- 添加按钮 -->
                    <button @click="openAddForm"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 4v16m8-8H4" />
                        </svg>
                        <span>添加引擎</span>
                    </button>
                </div>
            </div>

            <!-- 引擎列表 -->
            <div class="space-y-2">
                <div v-for="engine in engines" :key="engine.id" :class="[
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    activeEngineId === engine.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                ]">
                    <!-- 图标 -->
                    <img :src="engine.icon" class="w-8 h-8 object-contain flex-shrink-0" draggable="false" />

                    <!-- 名称和 URL -->
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-800">{{ engine.name }}</h3>
                        <p class="text-xs text-gray-500 truncate" :title="engine.searchUrlTemplate">{{ engine.searchUrlTemplate }}</p>
                    </div>

                    <!-- 当前使用标记 -->
                    <span v-if="activeEngineId === engine.id"
                        class="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100 rounded flex-shrink-0">
                        当前使用
                    </span>

                    <!-- 操作按钮 -->
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <!-- 切换为当前引擎 -->
                        <button v-if="activeEngineId !== engine.id" @click="setActiveEngine(engine.id)"
                            class="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            使用
                        </button>

                        <!-- 编辑按钮（仅自定义引擎） -->
                        <button v-if="engine.isCustom" @click="openEditForm(engine.id)"
                            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <img :src="EditIcon" class="w-4 h-4" alt="编辑" />
                        </button>

                        <!-- 删除按钮（仅自定义引擎） -->
                        <button v-if="engine.isCustom" @click="handleDelete(engine.id)"
                            class="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                            <img :src="DeleteIcon" class="w-4 h-4" alt="删除" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- 提示信息 -->
            <div v-if="customEngines.length === 0" class="mt-4 text-sm text-gray-500 text-center py-4">
                暂无自定义搜索引擎，点击上方"添加引擎"按钮添加
            </div>
        </div>

        <!-- 添加/编辑表单 -->
        <SearchEngineForm v-if="showForm" :editing-id="editingEngineId" @close="closeForm" />
    </div>
</template>
