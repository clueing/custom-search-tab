/**
 * 搜索引擎数据结构（用于存储）
 */
export interface SearchEngineData {
    /** 搜索引擎 ID */
    id: number
    /** 搜索引擎名称 */
    name: string
    /** 搜索引擎图标 URL */
    icon: string
    /** 搜索 URL 模板，使用 {keyword} 作为关键词占位符 */
    searchUrlTemplate: string
    /** 是否为用户自定义引擎 */
    isCustom: boolean
}

/**
 * 搜索引擎类型（运行时使用）
 */
export interface SearchEngine extends SearchEngineData {
    /** 搜索引擎搜索地址 */
    searchUrl: (kw: string) => string
    /** 搜索引擎建议地址 */
    suggestUrl?: (kw: string) => string
}