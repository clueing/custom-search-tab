/**
 * localStorage 统一封装
 * - 集中管理所有存储键，消除字符串重复
 * - 统一 JSON 序列化与异常处理
 */

// 所有 localStorage 存储键
export const STORAGE_KEYS = {
    // 壁纸
    WALLPAPER_CACHE: 'bing_wallpaper_cache',
    WALLPAPER_LOCK: 'bing_wallpaper_lock',
    WALLPAPER_SHOW_INFO: 'wallpaper_show_info',
    WALLPAPER_SHOW_DATE: 'wallpaper_show_date',
    WALLPAPER_SHOW_CONTROLS: 'wallpaper_show_controls',
    // 搜索
    SEARCH_ENGINES: 'search_engines',
    ACTIVE_ENGINE_ID: 'active_engine_id',
    SUGGEST_ENABLED: 'suggest_enabled',
    // 快捷方式
    SHORTCUTS: 'shortcuts',
    SHORTCUT_COLUMNS: 'shortcut_columns',
} as const

// 配置备份范围（不含每日壁纸临时缓存与锁定状态）
export const BACKUP_KEYS: string[] = [
    STORAGE_KEYS.SEARCH_ENGINES,
    STORAGE_KEYS.ACTIVE_ENGINE_ID,
    STORAGE_KEYS.SUGGEST_ENABLED,
    STORAGE_KEYS.SHORTCUTS,
    STORAGE_KEYS.SHORTCUT_COLUMNS,
    STORAGE_KEYS.WALLPAPER_SHOW_INFO,
    STORAGE_KEYS.WALLPAPER_SHOW_DATE,
    STORAGE_KEYS.WALLPAPER_SHOW_CONTROLS,
]

export const storage = {
    /** 读取并反序列化，不存在或解析失败时返回 fallback */
    get<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(key)
            if (raw === null) return fallback
            return JSON.parse(raw) as T
        } catch (error) {
            console.error(`读取存储项 ${key} 失败:`, error)
            return fallback
        }
    },

    /** 序列化并写入 */
    set(key: string, value: unknown): void {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`写入存储项 ${key} 失败:`, error)
        }
    },

    /** 删除 */
    remove(key: string): void {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`删除存储项 ${key} 失败:`, error)
        }
    },

    /** 读取原始字符串（不反序列化，用于配置备份原样导出） */
    getRaw(key: string): string | null {
        return localStorage.getItem(key)
    },

    /** 写入原始字符串（不序列化，用于配置备份原样导入） */
    setRaw(key: string, value: string): void {
        try {
            localStorage.setItem(key, value)
        } catch (error) {
            console.error(`写入存储项 ${key} 失败:`, error)
        }
    },
}
