import { ref, computed } from 'vue'
import type { SearchEngineData, SearchEngine } from '@/types/search'

// 存储键名
const STORAGE_KEYS = {
    SEARCH_ENGINES: 'search_engines',
    ACTIVE_ENGINE_ID: 'active_engine_id',
    SUGGEST_ENABLED: 'suggest_enabled',
}

// 预设搜索引擎
const PRESET_ENGINES: SearchEngineData[] = [
    {
        id: 1,
        name: '必应',
        icon: 'https://rewards.bing.com/rewardscdn/images/rewards/membercenter/missions/Animated-Icons/bing_icon.svg',
        searchUrlTemplate: 'https://www.bing.com/search?q={keyword}',
        isCustom: false,
    },
    {
        id: 2,
        name: '谷歌',
        icon: 'https://www.google.com/favicon.ico',
        searchUrlTemplate: 'https://www.google.com/search?q={keyword}',
        isCustom: false,
    },
    {
        id: 3,
        name: '百度',
        icon: 'https://www.baidu.com/favicon.ico',
        searchUrlTemplate: 'https://www.baidu.com/s?wd={keyword}',
        isCustom: false,
    },
]

// 百度搜索建议 URL 生成函数
const BAIDU_SUGGEST_URL = (kw: string) => `https://suggestion.baidu.com/su?p=3&ie=UTF-8&wd=${encodeURIComponent(kw)}`

// 将模板字符串转换为搜索 URL 函数
function createSearchUrl(template: string): (kw: string) => string {
    return (kw: string) => template.replace('{keyword}', encodeURIComponent(kw))
}

// 将 SearchEngineData 转换为 SearchEngine
function toSearchEngine(data: SearchEngineData): SearchEngine {
    return {
        ...data,
        searchUrl: createSearchUrl(data.searchUrlTemplate),
        suggestUrl: BAIDU_SUGGEST_URL,
    }
}

// 全局状态
const searchEngines = ref<SearchEngineData[]>([])
const activeEngineId = ref<number>(1)
const suggestEnabled = ref<boolean>(true)

// 是否已初始化
let initialized = false

export function useSearchEngines() {
    // 从 localStorage 加载引擎列表
    const loadEngines = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_ENGINES)
            if (stored) {
                searchEngines.value = JSON.parse(stored)
            } else {
                // 首次使用，初始化预设引擎
                searchEngines.value = [...PRESET_ENGINES]
                saveEngines()
            }
        } catch (error) {
            console.error('加载搜索引擎失败:', error)
            searchEngines.value = [...PRESET_ENGINES]
        }
    }

    // 保存引擎列表到 localStorage
    const saveEngines = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.SEARCH_ENGINES, JSON.stringify(searchEngines.value))
        } catch (error) {
            console.error('保存搜索引擎失败:', error)
        }
    }

    // 加载当前选中的引擎 ID
    const loadActiveEngineId = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ENGINE_ID)
            if (stored) {
                activeEngineId.value = Number(stored)
            }
        } catch (error) {
            console.error('加载当前引擎 ID 失败:', error)
        }
    }

    // 保存当前选中的引擎 ID
    const saveActiveEngineId = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ENGINE_ID, String(activeEngineId.value))
        } catch (error) {
            console.error('保存当前引擎 ID 失败:', error)
        }
    }

    // 加载搜索建议开关状态
    const loadSuggestEnabled = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SUGGEST_ENABLED)
            if (stored !== null) {
                suggestEnabled.value = stored === 'true'
            }
        } catch (error) {
            console.error('加载搜索建议开关状态失败:', error)
        }
    }

    // 保存搜索建议开关状态
    const saveSuggestEnabled = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.SUGGEST_ENABLED, String(suggestEnabled.value))
        } catch (error) {
            console.error('保存搜索建议开关状态失败:', error)
        }
    }

    // 初始化（只执行一次）
    const init = () => {
        if (!initialized) {
            loadEngines()
            loadActiveEngineId()
            loadSuggestEnabled()
            initialized = true
        }
    }

    // 添加自定义引擎
    const addEngine = (data: Omit<SearchEngineData, 'id' | 'isCustom'>) => {
        const newId = Math.max(...searchEngines.value.map(e => e.id), 0) + 1
        const newEngine: SearchEngineData = {
            ...data,
            id: newId,
            isCustom: true,
        }
        searchEngines.value.push(newEngine)
        saveEngines()
        return newEngine
    }

    // 更新引擎
    const updateEngine = (id: number, data: Partial<SearchEngineData>) => {
        const index = searchEngines.value.findIndex(e => e.id === id)
        if (index !== -1) {
            searchEngines.value[index] = {
                ...searchEngines.value[index],
                ...data,
            }
            saveEngines()
        }
    }

    // 删除自定义引擎
    const deleteEngine = (id: number) => {
        const engine = searchEngines.value.find(e => e.id === id)
        if (engine && engine.isCustom) {
            searchEngines.value = searchEngines.value.filter(e => e.id !== id)

            // 如果删除的是当前选中的引擎，切换到第一个引擎
            if (activeEngineId.value === id) {
                activeEngineId.value = searchEngines.value[0]?.id || 1
                saveActiveEngineId()
            }

            saveEngines()
            return true
        }
        return false
    }

    // 设置当前激活的引擎
    const setActiveEngine = (id: number) => {
        if (searchEngines.value.some(e => e.id === id)) {
            activeEngineId.value = id
            saveActiveEngineId()
        }
    }

    // 切换搜索建议开关
    const toggleSuggest = () => {
        suggestEnabled.value = !suggestEnabled.value
        saveSuggestEnabled()
    }

    // 当前激活的引擎（运行时对象）
    const currentEngine = computed<SearchEngine>(() => {
        const engine = searchEngines.value.find(e => e.id === activeEngineId.value)
        return engine ? toSearchEngine(engine) : toSearchEngine(PRESET_ENGINES[0])
    })

    // 所有引擎（运行时对象）
    const engines = computed<SearchEngine[]>(() => {
        return searchEngines.value.map(toSearchEngine)
    })

    // 自定义引擎列表
    const customEngines = computed<SearchEngineData[]>(() => {
        return searchEngines.value.filter(e => e.isCustom)
    })

    // 预设引擎列表
    const presetEngines = computed<SearchEngineData[]>(() => {
        return searchEngines.value.filter(e => !e.isCustom)
    })

    return {
        // 状态
        searchEngines,
        activeEngineId,
        suggestEnabled,

        // 计算属性
        currentEngine,
        engines,
        customEngines,
        presetEngines,

        // 方法
        init,
        addEngine,
        updateEngine,
        deleteEngine,
        setActiveEngine,
        toggleSuggest,
    }
}
