import { ref, watch } from 'vue'
import { STORAGE_KEYS, storage } from '@/utils/storage'

// 全局状态（模块级，多组件共享同一份响应式数据）
const showInfo = ref(storage.get<boolean>(STORAGE_KEYS.WALLPAPER_SHOW_INFO, true))
const showDate = ref(storage.get<boolean>(STORAGE_KEYS.WALLPAPER_SHOW_DATE, true))
const showControls = ref(storage.get<boolean>(STORAGE_KEYS.WALLPAPER_SHOW_CONTROLS, true))

// 变更时持久化
watch(showInfo, v => storage.set(STORAGE_KEYS.WALLPAPER_SHOW_INFO, v))
watch(showDate, v => storage.set(STORAGE_KEYS.WALLPAPER_SHOW_DATE, v))
watch(showControls, v => storage.set(STORAGE_KEYS.WALLPAPER_SHOW_CONTROLS, v))

export function useWallpaperSettings() {
    return {
        showInfo,
        showDate,
        showControls,
    }
}
