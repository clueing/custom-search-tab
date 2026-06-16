<script setup lang="ts">
import AddIcon from '@/assets/icon/ProiconsAdd.svg'
import EditIcon from '@/assets/icon/MaterialSymbolsEdit.svg'
import DeleteIcon from '@/assets/icon/MaterialSymbolsDeleteOutline.svg'
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Shortcut {
    id: string
    url: string
    title: string
    icon: string
    iconType: 'url' | 'text'
    bgColor: string
}

const shortcuts = ref<Shortcut[]>([])
const showEditModal = ref(false)
const editingShortcut = ref<Shortcut | null>(null)
const columns = ref<number>(8) // 默认 8 列

// 表单数据
const form = ref({
    url: '',
    title: '',
    icon: '',
    iconType: 'url' as 'url' | 'text',
    bgColor: '#3b82f6'
})

// 从本地存储加载快捷方式
const loadShortcuts = () => {
    try {
        const saved = localStorage.getItem('shortcuts')
        if (saved) {
            shortcuts.value = JSON.parse(saved)
        } else {
            shortcuts.value = [
                {
                    id: '1',
                    url: 'https://outlook.live.com',
                    title: 'Outlook',
                    icon: 'https://outlook.live.com/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '2',
                    url: 'https://www.bilibili.com',
                    title: '哔哩哔哩',
                    icon: 'https://www.bilibili.com/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '3',
                    url: 'https://www.zhihu.com',
                    title: '知乎',
                    icon: 'https://www.zhihu.com/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '4',
                    url: 'https://github.com',
                    title: 'GitHub',
                    icon: 'https://github.com/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '5',
                    url: 'https://mail.google.com',
                    title: 'Gmail',
                    icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '6',
                    url: 'https://www.kimi.com',
                    title: 'Kimi',
                    icon: 'https://www.kimi.com/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '7',
                    url: 'https://www.doubao.com',
                    title: '豆包',
                    icon: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/favicon.png',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '8',
                    url: 'https://chat.deepseek.com',
                    title: 'DeepSeek',
                    icon: 'https://chat.deepseek.com/favicon.svg',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
                {
                    id: '9',
                    url: 'https://claude.ai',
                    title: 'Claude',
                    icon: 'https://claude.ai/favicon.ico',
                    iconType: 'url',
                    bgColor: '#3b82f6'
                },
            ]
            saveShortcuts()
        }
    } catch (error) {
        console.error('加载快捷方式失败:', error)
    }
}

// 保存快捷方式到本地存储
const saveShortcuts = () => {
    try {
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts.value))
    } catch (error) {
        console.error('保存快捷方式失败:', error)
    }
}

// 获取网站图标（支持多种 favicon 格式）
const getFaviconUrl = (url: string): string => {
    try {
        const urlObj = new URL(url)
        // 优先使用 Google Favicon API（更稳定）
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
    } catch {
        return ''
    }
}

// 获取网站标题
const fetchSiteTitle = async (url: string): Promise<string> => {
    try {
        const domain = new URL(url).hostname
        return domain.replace('www.', '')
    } catch {
        return '未命名'
    }
}

// 打开编辑对话框
const openEditModal = (shortcut?: Shortcut) => {
    if (shortcut) {
        editingShortcut.value = shortcut
        form.value = {
            url: shortcut.url,
            title: shortcut.title,
            icon: shortcut.icon,
            iconType: shortcut.iconType,
            bgColor: shortcut.bgColor
        }
    } else {
        editingShortcut.value = null
        form.value = {
            url: '',
            title: '',
            icon: '',
            iconType: 'url',
            bgColor: '#3b82f6'
        }
    }
    showEditModal.value = true
}

// 自动获取网站信息
const autoFetchSiteInfo = async () => {
    if (!form.value.url) return

    try {
        let url = form.value.url
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
            form.value.url = url
        }

        const faviconUrl = getFaviconUrl(url)
        form.value.icon = faviconUrl
        form.value.iconType = 'url'

        if (!form.value.title) {
            const title = await fetchSiteTitle(url)
            form.value.title = title
        }
    } catch (error) {
        console.error('获取网站信息失败:', error)
    }
}

// 切换到文字图标
const switchToTextIcon = () => {
    form.value.iconType = 'text'
    form.value.icon = form.value.title.substring(0, 2)
}

// 保存快捷方式
const saveShortcut = () => {
    if (!form.value.url || !form.value.title) {
        alert('请填写网址和标题')
        return
    }

    if (editingShortcut.value) {
        const index = shortcuts.value.findIndex(s => s.id === editingShortcut.value!.id)
        if (index !== -1) {
            shortcuts.value[index] = {
                ...editingShortcut.value,
                ...form.value
            }
        }
    } else {
        shortcuts.value.push({
            id: Date.now().toString(),
            ...form.value
        })
    }

    saveShortcuts()
    closeEditModal()
}

// 删除快捷方式
const deleteShortcut = (id: string) => {
    if (confirm('确定要删除这个快捷方式吗？')) {
        shortcuts.value = shortcuts.value.filter(s => s.id !== id)
        saveShortcuts()
    }
}

// 关闭对话框
const closeEditModal = () => {
    showEditModal.value = false
    editingShortcut.value = null
}

// 组件挂载时添加全局点击监听
onMounted(() => {
    loadShortcuts()

    // 加载布局设置
    try {
        const stored = localStorage.getItem('shortcut_columns')
        if (stored) {
            columns.value = Number(stored)
        }
    } catch (error) {
        console.error('加载布局设置失败:', error)
    }

    // 监听布局变化事件
    const handleLayoutChange = (e: Event) => {
        const customEvent = e as CustomEvent
        columns.value = customEvent.detail
    }
    window.addEventListener('shortcut-layout-change', handleLayoutChange)

    // 保存监听器引用以便清理
    ;(window as any).__shortcutLayoutHandler = handleLayoutChange
})

// 组件卸载时移除监听
onBeforeUnmount(() => {
    const handler = (window as any).__shortcutLayoutHandler
    if (handler) {
        window.removeEventListener('shortcut-layout-change', handler)
        delete (window as any).__shortcutLayoutHandler
    }
})
</script>

<template>
    <section aria-label="快捷方式">
        <ul :class="[
            'grid gap-4',
            `grid-cols-2 sm:grid-cols-4 md:grid-cols-${columns}`
        ]">
            <!-- 快捷方式卡片 -->
            <li v-for="shortcut in shortcuts" :key="shortcut.id" class="flex flex-col items-center gap-2 group">
                <div class="relative shortcut-card">
                    <!-- 快捷方式链接 -->
                    <a :href="shortcut.url" target="_blank" rel="noopener"
                        class="w-14 h-14 rounded-2xl bg-white shadow hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200">
                        <!-- 图标类型：URL -->
                        <img v-if="shortcut.iconType === 'url'" :src="shortcut.icon" class="w-8 h-8 object-contain"
                            @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" draggable="false" />
                        <!-- 图标类型：文字 -->
                        <div v-else class="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                            :style="{ backgroundColor: shortcut.bgColor }">
                            {{ shortcut.icon }}
                        </div>
                    </a>

                    <!-- 编辑/删除按钮（hover 显示） -->
                    <div class="absolute -top-2 -right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button @click.prevent="openEditModal(shortcut)"
                            class="edit-button w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-lg transition-all hover:scale-110 active:scale-95">
                            <img class="w-4 h-4" :src="EditIcon" alt="编辑" />
                        </button>
                        <button @click.prevent="deleteShortcut(shortcut.id)"
                            class="delete-button w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg transition-all hover:scale-110 active:scale-95">
                            <img class="w-4 h-4" :src="DeleteIcon" alt="删除" />
                        </button>
                    </div>
                </div>
                <span class="text-sm text-[#dddddd] group-hover:text-white transition-colors">{{ shortcut.title }}</span>
            </li>

            <!-- 添加按钮 -->
            <li class="flex flex-col items-center gap-2 group">
                <button @click="openEditModal()"
                    class="w-14 h-14 rounded-2xl bg-white/90 shadow hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all duration-200 backdrop-blur">
                    <img class="w-5 h-5" :src="AddIcon" alt="添加" />
                </button>
                <span class="text-sm text-[#dddddd] group-hover:text-white transition-colors">添加</span>
            </li>
        </ul>

        <!-- 编辑对话框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showEditModal" class="z-200 fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                    @click.self="closeEditModal">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 class="text-xl font-bold mb-4">{{ editingShortcut ? '编辑快捷方式' : '添加快捷方式' }}</h2>

                        <div class="space-y-4">
                            <!-- 网址输入 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">网址</label>
                                <div class="flex gap-2">
                                    <input v-model="form.url" type="text" placeholder="https://example.com"
                                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button @click="autoFetchSiteInfo"
                                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap">
                                        获取
                                    </button>
                                </div>
                            </div>

                            <!-- 标题输入 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
                                <input v-model="form.title" type="text" placeholder="网站名称"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <!-- 图标类型选择 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">图标类型</label>
                                <div class="flex gap-4">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input v-model="form.iconType" type="radio" value="url" class="w-4 h-4" />
                                        <span>图标URL</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input v-model="form.iconType" type="radio" value="text" class="w-4 h-4"
                                            @change="switchToTextIcon" />
                                        <span>文字图标</span>
                                    </label>
                                </div>
                            </div>

                            <!-- 图标URL输入 -->
                            <div v-if="form.iconType === 'url'">
                                <label class="block text-sm font-medium text-gray-700 mb-1">图标URL</label>
                                <input v-model="form.icon" type="text" placeholder="https://example.com/icon.png"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <!-- 文字图标设置 -->
                            <div v-else class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">文字内容（最多2个字）</label>
                                    <input v-model="form.icon" type="text" maxlength="2" placeholder="如：掘金"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">背景颜色</label>
                                    <div class="flex gap-2">
                                        <input v-model="form.bgColor" type="color"
                                            class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                                        <input v-model="form.bgColor" type="text"
                                            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <!-- 预览 -->
                            <div class="border-t pt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">预览</label>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-14 h-14 rounded-2xl bg-white shadow flex items-center justify-center overflow-hidden">
                                        <img v-if="form.iconType === 'url' && form.icon" :src="form.icon"
                                            class="w-8 h-8 object-contain" draggable="false" />
                                        <div v-else-if="form.iconType === 'text' && form.icon"
                                            class="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                                            :style="{ backgroundColor: form.bgColor }">
                                            {{ form.icon }}
                                        </div>
                                    </div>
                                    <span class="text-sm text-gray-700">{{ form.title || '标题' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 按钮 -->
                        <div class="flex gap-3 mt-6">
                            <button @click="closeEditModal"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                取消
                            </button>
                            <button @click="saveShortcut"
                                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
    transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
    transform: scale(0.95);
}

/* 操作按钮动画 */
.action-buttons-enter-active {
    animation: action-in 0.2s ease-out;
}

.action-buttons-leave-active {
    animation: action-out 0.15s ease-in;
}

@keyframes action-in {
    from {
        opacity: 0;
        transform: scale(0.5) translateY(5px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes action-out {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    to {
        opacity: 0;
        transform: scale(0.5) translateY(5px);
    }
}

/* 确保操作按钮显示在最上层 */
.relative {
    position: relative;
}
</style>