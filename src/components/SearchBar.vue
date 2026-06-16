<script setup lang="ts">
import CloseIcon from '@/assets/icon/IonClose.svg'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useSearchEngines } from '@/composables/useSearchEngines'

// 使用搜索引擎状态管理
const { engines, currentEngine, activeEngineId, setActiveEngine, suggestEnabled, init } = useSearchEngines()

// 初始化
init()

const keyword = ref('')
const showDrop = ref(false)
const showSuggestions = ref(false)
const suggestions = ref<string[]>([])
const selectedIndex = ref(-1)

// 获取搜索建议
const fetchSuggestions = async (kw: string) => {
    // 检查搜索建议开关
    if (!suggestEnabled.value) {
        suggestions.value = []
        showSuggestions.value = false
        return
    }

    if (!kw.trim() || !currentEngine.value.suggestUrl) {
        suggestions.value = []
        showSuggestions.value = false
        return
    }

    try {
        const url = currentEngine.value.suggestUrl(kw)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
            }
        })

        const text = await response.text()

        // 检查请求返回时输入框是否已被清空
        if (!keyword.value.trim()) {
            suggestions.value = []
            showSuggestions.value = false
            return
        }

        // 百度返回的是 JSONP 格式，需要解析
        // 格式类似: window.baidu.sug({q:"测试",p:false,s:["测试","测试网速","测试一下"]});
        const match = text.match(/\{[^}]*\}/)
        if (match) {
            try {
                const data = JSON.parse(match[0])
                suggestions.value = (data.s || []).slice(0, 8)
                showSuggestions.value = suggestions.value.length > 0
                selectedIndex.value = -1
            } catch (parseError) {
                // 如果 JSON 解析失败，尝试手动提取数组
                const arrayMatch = text.match(/s:\s*\[(.*?)\]/)
                if (arrayMatch) {
                    const items = arrayMatch[1].split(',').map(item =>
                        item.trim().replace(/^["']|["']$/g, '')
                    )
                    suggestions.value = items.filter(item => item.length > 0).slice(0, 8)
                    showSuggestions.value = suggestions.value.length > 0
                    selectedIndex.value = -1
                }
            }
        }
    } catch (error) {
        console.error('获取搜索建议失败:', error)
        suggestions.value = []
        showSuggestions.value = false
    }
}

// 使用防抖优化搜索建议请求
const debouncedFetchSuggestions = useDebounceFn(fetchSuggestions, 300)

// 监听关键词变化
watch(keyword, (newVal) => {
    if (newVal.trim()) {
        debouncedFetchSuggestions(newVal)
    } else {
        suggestions.value = []
        showSuggestions.value = false
        selectedIndex.value = -1
    }
})

// 执行搜索
const doSearch = (searchWord?: string) => {
    const searchKeyword = searchWord || keyword.value
    if (!searchKeyword.trim()) return
    window.open(currentEngine.value.searchUrl(searchKeyword), '_blank')
    showSuggestions.value = false
}

// 选择建议项
const selectSuggestion = (suggestion: string) => {
    keyword.value = suggestion
    showSuggestions.value = false
    doSearch(suggestion)
}

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
    if (!showSuggestions.value || suggestions.value.length === 0) return

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
            break
        case 'ArrowUp':
            e.preventDefault()
            selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
            break
        case 'Enter':
            if (selectedIndex.value >= 0) {
                e.preventDefault()
                selectSuggestion(suggestions.value[selectedIndex.value])
            }
            break
        case 'Escape':
            showSuggestions.value = false
            selectedIndex.value = -1
            break
    }
}

// 切换引擎时清空建议
watch(activeEngineId, () => {
    suggestions.value = []
    showSuggestions.value = false
    selectedIndex.value = -1
})

// 点击外部关闭下拉
const searchFormRef = ref<HTMLElement | null>(null)

const handleClickOutside = (e: MouseEvent) => {
    if (searchFormRef.value && !searchFormRef.value.contains(e.target as Node)) {
        showDrop.value = false
        showSuggestions.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <section class="w-full max-w-2xl mx-auto">
        <!-- 搜索框 -->
        <form ref="searchFormRef" @submit.prevent="doSearch()"
            class="relative flex items-center h-14 px-4 rounded-2xl bg-white shadow-lg">
            <!-- 引擎选择 -->
            <button type="button" @click="showDrop = !showDrop"
                class="flex items-center gap-2 mr-3 outline-none bg-white hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <img :src="currentEngine.icon" class="w-6 h-6 object-contain" draggable="false" />
                <svg :class="['w-4 h-4 text-gray-500 transition-transform duration-200', showDrop ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- 输入 -->
            <div class="flex-1 relative h-full">
                <input v-model="keyword" type="text" placeholder="输入并搜索" @keydown="handleKeydown"
                    @focus="keyword.trim() && suggestions.length > 0 && (showSuggestions = true)"
                    class="w-full h-full outline-none bg-transparent" />
                <button v-if="keyword" type="button"
                    @click="keyword = ''; suggestions = []; showSuggestions = false; selectedIndex = -1"
                    class="bg-white absolute right-0 top-0 h-full px-2 text-gray-400 hover:text-gray-700">
                    <img class="w-5 h-5" :src="CloseIcon" alt="×" />
                </button>
            </div>

            <!-- 引擎选择下拉列表 -->
            <Transition name="dropdown">
                <div v-if="showDrop"
                    class="z-99 absolute top-16 left-0 w-full max-h-60 overflow-y-auto rounded-2xl bg-white shadow-xl p-3 grid grid-cols-4 gap-3">
                    <div v-for="e in engines" :key="e.id" @click="setActiveEngine(e.id); showDrop = false"
                        :class="[
                            'flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all',
                            activeEngineId === e.id
                                ? 'bg-blue-50 ring-2 ring-blue-500'
                                : 'hover:bg-gray-100 hover:scale-105'
                        ]">
                        <img :src="e.icon" class="w-8 h-8 object-contain" draggable="false" />
                        <span class="text-xs text-gray-700">{{ e.name }}</span>
                    </div>
                </div>
            </Transition>

            <!-- 搜索建议列表 -->
            <Transition name="fade">
                <div v-if="showSuggestions && suggestions.length > 0"
                    class="z-100 overflow-hidden absolute top-16 left-0 w-full rounded-2xl bg-white shadow-xl py-2">
                    <div v-for="(suggestion, index) in suggestions" :key="index" @click="selectSuggestion(suggestion)"
                        @mouseenter="selectedIndex = index" :class="[
                            'px-4 py-2.5 cursor-pointer transition-colors flex items-center gap-3',
                            selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                        ]">
                        <span class="i-carbon-search text-gray-400 text-lg" />
                        <span class="text-sm text-gray-700">{{ suggestion }}</span>
                    </div>
                </div>
            </Transition>
        </form>
    </section>
</template>

<style scoped>
/* 下拉框动画 */
.dropdown-enter-active {
    animation: dropdown-in 0.2s ease-out;
}

.dropdown-leave-active {
    animation: dropdown-out 0.15s ease-in;
}

@keyframes dropdown-in {
    from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes dropdown-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
    }
}

/* 搜索建议淡入淡出 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>