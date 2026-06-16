<script setup lang="ts">
import { ref } from 'vue'
import { useSearchEngines } from '@/composables/useSearchEngines'
import EditIcon from '@/assets/icon/MaterialSymbolsEdit.svg'
import DeleteIcon from '@/assets/icon/MaterialSymbolsDeleteOutline.svg'
import SearchEngineForm from './SearchEngineForm.vue'

const { engines, customEngines, deleteEngine, activeEngineId, setActiveEngine } = useSearchEngines()

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
</script>

<template>
    <div class="space-y-6">
        <!-- 当前引擎列表 -->
        <div>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">搜索引擎</h2>
                <div class="flex gap-2">
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
