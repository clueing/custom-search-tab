<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSearchEngines } from '@/composables/useSearchEngines'
import type { SearchEngineData } from '@/types/search'

const props = defineProps<{
    editingId: number | null
}>()

const emit = defineEmits<{
    close: []
}>()

const { searchEngines, addEngine, updateEngine } = useSearchEngines()

// 常用引擎模板
const ENGINE_TEMPLATES = [
    { name: 'DuckDuckGo', template: 'https://duckduckgo.com/?q={keyword}', icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=128' },
    { name: '搜狗', template: 'https://www.sogou.com/web?query={keyword}', icon: 'https://www.google.com/s2/favicons?domain=sogou.com&sz=128' },
    { name: '360搜索', template: 'https://www.so.com/s?q={keyword}', icon: 'https://www.google.com/s2/favicons?domain=so.com&sz=128' },
    { name: 'Yandex', template: 'https://yandex.com/search/?text={keyword}', icon: 'https://www.google.com/s2/favicons?domain=yandex.com&sz=128' },
]

// 表单数据
const form = ref({
    name: '',
    searchUrlTemplate: '',
    icon: '',
})

// 表单错误
const errors = ref({
    name: '',
    searchUrlTemplate: '',
})

// 是否为编辑模式
const isEditing = computed(() => props.editingId !== null)

// 如果是编辑模式，加载现有数据
if (isEditing.value) {
    const engine = searchEngines.value.find(e => e.id === props.editingId)
    if (engine) {
        form.value = {
            name: engine.name,
            searchUrlTemplate: engine.searchUrlTemplate,
            icon: engine.icon,
        }
    }
}

// 从模板快速添加
const useTemplate = (template: typeof ENGINE_TEMPLATES[0]) => {
    form.value.name = template.name
    form.value.searchUrlTemplate = template.template
    form.value.icon = template.icon
}

// 自动获取 favicon
const autoFetchIcon = () => {
    if (!form.value.searchUrlTemplate) return

    try {
        // 从模板 URL 中提取域名
        const urlMatch = form.value.searchUrlTemplate.match(/^https?:\/\/([^\/]+)/)
        if (urlMatch) {
            const hostname = urlMatch[1]
            // 使用 Google Favicon API 获取更清晰的图标
            form.value.icon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
        }
    } catch (error) {
        console.error('获取图标失败:', error)
    }
}

// 验证表单
const validate = (): boolean => {
    errors.value = {
        name: '',
        searchUrlTemplate: '',
    }

    let isValid = true

    // 验证名称
    if (!form.value.name.trim()) {
        errors.value.name = '请输入搜索引擎名称'
        isValid = false
    } else if (form.value.name.length > 20) {
        errors.value.name = '名称不能超过 20 个字符'
        isValid = false
    }

    // 验证 URL 模板
    if (!form.value.searchUrlTemplate.trim()) {
        errors.value.searchUrlTemplate = '请输入搜索 URL 模板'
        isValid = false
    } else if (!form.value.searchUrlTemplate.includes('{keyword}')) {
        errors.value.searchUrlTemplate = 'URL 模板中必须包含 {keyword} 占位符'
        isValid = false
    } else if (!/^https?:\/\/.+/.test(form.value.searchUrlTemplate)) {
        errors.value.searchUrlTemplate = 'URL 必须以 http:// 或 https:// 开头'
        isValid = false
    }

    return isValid
}

// 保存
const save = () => {
    if (!validate()) return

    const data: Omit<SearchEngineData, 'id' | 'isCustom'> = {
        name: form.value.name.trim(),
        searchUrlTemplate: form.value.searchUrlTemplate.trim(),
        icon: form.value.icon.trim() || 'https://www.google.com/favicon.ico', // 默认图标
    }

    if (isEditing.value && props.editingId !== null) {
        updateEngine(props.editingId, data)
    } else {
        addEngine(data)
    }

    emit('close')
}

// 取消
const cancel = () => {
    emit('close')
}

// 监听模板变化，自动提示
watch(() => form.value.searchUrlTemplate, () => {
    if (form.value.searchUrlTemplate && !form.value.icon) {
        autoFetchIcon()
    }
})
</script>

<template>
    <Teleport to="body">
        <div class="fixed inset-0 bg-black/50 z-300 flex items-center justify-center p-4" @click.self="cancel">
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl font-bold mb-4">{{ isEditing ? '编辑搜索引擎' : '添加搜索引擎' }}</h2>

                <!-- 模板库（仅添加模式显示） -->
                <div v-if="!isEditing" class="mb-6">
                    <h3 class="text-sm font-medium text-gray-700 mb-2">快速添加</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <button v-for="template in ENGINE_TEMPLATES" :key="template.name" @click="useTemplate(template)"
                            class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <img :src="template.icon" class="w-5 h-5 object-contain" draggable="false" />
                            <span class="text-sm">{{ template.name }}</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- 名称 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            名称 <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.name" type="text" placeholder="如：DuckDuckGo"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :class="errors.name ? 'border-red-500' : 'border-gray-300'" />
                        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
                    </div>

                    <!-- 搜索 URL 模板 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            搜索 URL 模板 <span class="text-red-500">*</span>
                        </label>
                        <input v-model="form.searchUrlTemplate" type="text"
                            placeholder="https://example.com/search?q={keyword}"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :class="errors.searchUrlTemplate ? 'border-red-500' : 'border-gray-300'" />
                        <p v-if="errors.searchUrlTemplate" class="text-xs text-red-500 mt-1">{{ errors.searchUrlTemplate }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                            用 {keyword} 表示搜索词，例如：https://duckduckgo.com/?q={keyword}
                        </p>
                    </div>

                    <!-- 图标 URL -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">图标 URL（可选）</label>
                        <div class="flex gap-2">
                            <input v-model="form.icon" type="text" placeholder="https://example.com/favicon.ico"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button @click="autoFetchIcon"
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                                自动获取
                            </button>
                        </div>
                    </div>

                    <!-- 预览 -->
                    <div class="border-t pt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">预览</label>
                        <div class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <img v-if="form.icon" :src="form.icon" class="w-8 h-8 object-contain" draggable="false"
                                @error="(e) => (e.target as HTMLImageElement).src = 'https://www.google.com/favicon.ico'" />
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-800">{{ form.name || '搜索引擎名称' }}</h3>
                                <p class="text-xs text-gray-500 truncate">{{ form.searchUrlTemplate || 'URL 模板' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 按钮 -->
                <div class="flex gap-3 mt-6">
                    <button @click="cancel"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        取消
                    </button>
                    <button @click="save"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        保存
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
