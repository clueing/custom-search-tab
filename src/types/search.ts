/**
 * 搜索引擎类型定义
 */
export interface SearchEngine {
    /** 搜索引擎id */
    id: number
    /** 搜索引擎名称 */
    name: string
    /** 搜索引擎图标 */
    icon: string
    /** 搜索引擎搜索地址 */
    searchUrl: (kw: string) => string
    /** 搜索引擎建议地址 */
    suggestUrl?: (kw: string) => string
}