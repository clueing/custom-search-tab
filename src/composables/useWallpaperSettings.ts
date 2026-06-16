import { ref, watch } from 'vue'

// 壁纸显示设置存储键
const STORAGE_KEYS = {
    SHOW_INFO: 'wallpaper_show_info',         // 壁纸详情（描述/版权）
    SHOW_DATE: 'wallpaper_show_date',         // 壁纸日期
    SHOW_CONTROLS: 'wallpaper_show_controls', // 切换与锁定按钮
}

// 读取布尔设置（缺省回退）
const readBool = (key: string, fallback: boolean) => {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === 'true'
}

// 全局状态（模块级，多组件共享同一份响应式数据）
const showInfo = ref(readBool(STORAGE_KEYS.SHOW_INFO, true))
const showDate = ref(readBool(STORAGE_KEYS.SHOW_DATE, true))
const showControls = ref(readBool(STORAGE_KEYS.SHOW_CONTROLS, true))

// 变更时持久化
watch(showInfo, v => localStorage.setItem(STORAGE_KEYS.SHOW_INFO, String(v)))
watch(showDate, v => localStorage.setItem(STORAGE_KEYS.SHOW_DATE, String(v)))
watch(showControls, v => localStorage.setItem(STORAGE_KEYS.SHOW_CONTROLS, String(v)))

export function useWallpaperSettings() {
    return {
        showInfo,
        showDate,
        showControls,
    }
}
