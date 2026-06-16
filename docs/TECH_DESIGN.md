# 技术设计文档 - 搜索引擎管理与设置面板

> 更新时间：2026-06-16  
> 状态：设计阶段

---

## 1. 概述

### 1.1 目标
为"简单搜索"浏览器扩展添加以下功能：
1. 用户可自定义添加搜索引擎
2. 独立的设置面板（侧滑形式）
3. 搜索建议开关

### 1.2 设计原则
- **简约优先**：UI 保持简洁，不增加学习成本
- **渐进增强**：核心功能优先，高级功能可选
- **数据安全**：本地存储，无服务器依赖

---

## 2. 数据结构设计

### 2.1 搜索引擎数据模型

#### 存储层（localStorage）
```typescript
interface SearchEngineData {
    id: number                    // 唯一标识
    name: string                  // 引擎名称，如 "必应"
    icon: string                  // 图标 URL
    searchUrlTemplate: string     // 搜索 URL 模板，如 "https://bing.com/search?q={keyword}"
    isCustom: boolean             // true=用户自定义, false=预设
}
```

#### 运行时层（组件使用）
```typescript
interface SearchEngine extends SearchEngineData {
    searchUrl: (kw: string) => string     // 根据模板生成实际 URL
    suggestUrl?: (kw: string) => string   // 搜索建议 API（统一用百度）
}
```

### 2.2 数据转换

**模板 → 函数**
```typescript
function createSearchUrl(template: string): (kw: string) => string {
    return (kw: string) => template.replace('{keyword}', encodeURIComponent(kw))
}
```

**存储键名**
```typescript
const STORAGE_KEYS = {
    SEARCH_ENGINES: 'search_engines',        // 搜索引擎列表
    ACTIVE_ENGINE_ID: 'active_engine_id',    // 当前选中的引擎 ID
    SUGGEST_ENABLED: 'suggest_enabled',      // 搜索建议开关，默认 true
}
```

---

## 3. 组件架构

### 3.1 新增组件

```
src/
├── components/
│   ├── SearchBar.vue              # 现有组件（需改造）
│   ├── ShortcutManager.vue        # 现有组件
│   ├── SettingsPanel.vue          # 新增：设置面板容器
│   └── settings/
│       ├── SearchEngineManager.vue  # 搜索引擎管理
│       ├── SearchEngineForm.vue     # 添加/编辑引擎表单
│       └── GeneralSettings.vue      # 通用设置（搜索建议开关等）
├── newtab/
│   └── App.vue                    # 需改造：添加设置入口
```

### 3.2 组件职责

#### `SettingsPanel.vue`
- 侧滑面板容器（从右侧滑出）
- Tab 切换（搜索引擎管理 / 通用设置 / 关于）
- 打开/关闭动画

#### `SearchEngineManager.vue`
- 展示预设 + 自定义搜索引擎列表
- 编辑/删除自定义引擎
- 打开"添加引擎"表单

#### `SearchEngineForm.vue`
- 添加/编辑搜索引擎表单
- 常用引擎模板库
- 自动获取 favicon
- 表单验证

#### `GeneralSettings.vue`
- 搜索建议开关
- 未来扩展：壁纸设置、布局设置等

---

## 4. 状态管理

### 4.1 搜索引擎状态

**方案：使用 Composable（推荐）**

```typescript
// src/composables/useSearchEngines.ts
import { ref, computed } from 'vue'

const PRESET_ENGINES: SearchEngineData[] = [
    { id: 1, name: '必应', icon: '...', searchUrlTemplate: '...', isCustom: false },
    { id: 2, name: '谷歌', icon: '...', searchUrlTemplate: '...', isCustom: false },
    { id: 3, name: '百度', icon: '...', searchUrlTemplate: '...', isCustom: false },
]

const searchEngines = ref<SearchEngineData[]>([])
const activeEngineId = ref<number>(1)
const suggestEnabled = ref<boolean>(true)

export function useSearchEngines() {
    // 加载引擎列表
    const loadEngines = () => { /* ... */ }
    
    // 保存到 localStorage
    const saveEngines = () => { /* ... */ }
    
    // 添加自定义引擎
    const addEngine = (engine: Omit<SearchEngineData, 'id' | 'isCustom'>) => { /* ... */ }
    
    // 删除自定义引擎
    const deleteEngine = (id: number) => { /* ... */ }
    
    // 获取当前激活的引擎
    const currentEngine = computed(() => { /* ... */ })
    
    return {
        searchEngines,
        activeEngineId,
        suggestEnabled,
        loadEngines,
        addEngine,
        deleteEngine,
        currentEngine,
    }
}
```

**优势：**
- 跨组件共享状态（SearchBar、SettingsPanel 都能用）
- 避免 prop drilling
- 不需要引入 Pinia/Vuex

---

## 5. UI/UX 设计

### 5.1 设置面板入口

**位置：新标签页右上角**
```vue
<!-- newtab/App.vue -->
<template>
  <div class="relative min-h-screen ...">
    <!-- 右上角齿轮按钮 -->
    <button 
      @click="showSettings = true"
      class="fixed top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:shadow-lg transition-all"
    >
      <span class="i-carbon-settings text-gray-600 text-xl" />
    </button>
    
    <!-- 原有内容 -->
    <header>...</header>
    <main>...</main>
    
    <!-- 设置面板 -->
    <SettingsPanel v-model:show="showSettings" />
  </div>
</template>
```

### 5.2 侧滑面板

**布局：**
```
┌──────────────────────────────────────┐
│ [背景内容]              │            │
│                         │  设置面板   │ ← 400px 宽
│                         │            │
│                         │  [内容]    │
│                         │            │
└──────────────────────────────────────┘
  ↑ 半透明黑色遮罩          ↑ 白色面板
```

**动画：**
- 遮罩淡入：`opacity 0 → 0.3`
- 面板滑入：`translateX(100%) → 0`
- 动画时长：`200ms ease-out`

---

## 6. 关键功能实现

### 6.1 添加自定义搜索引擎

#### 表单字段
```typescript
interface SearchEngineFormData {
    name: string              // 引擎名称
    searchUrlTemplate: string // 搜索 URL 模板
    icon: string              // 图标 URL（可选）
}
```

#### 模板库（快速添加）
```typescript
const ENGINE_TEMPLATES = [
    { name: 'DuckDuckGo', template: 'https://duckduckgo.com/?q={keyword}', icon: '...' },
    { name: '搜狗', template: 'https://www.sogou.com/web?query={keyword}', icon: '...' },
    { name: '360搜索', template: 'https://www.so.com/s?q={keyword}', icon: '...' },
    { name: 'Yandex', template: 'https://yandex.com/search/?text={keyword}', icon: '...' },
]
```

#### 表单验证规则
1. **名称**：必填，1-20 字符
2. **URL 模板**：
   - 必填
   - 必须是有效 URL
   - 必须包含 `{keyword}` 占位符
   - 正则：`/^https?:\/\/.+\{keyword\}.*/`
3. **图标**：可选，必须是有效 URL

#### 自动获取 favicon
```typescript
function getFaviconUrl(searchUrl: string): string {
    try {
        const url = new URL(searchUrl)
        return `${url.origin}/favicon.ico`
    } catch {
        return ''  // 降级为空
    }
}
```

### 6.2 搜索建议开关

**交互：**
- 位置：`GeneralSettings.vue` 中
- 形式：Toggle 开关
- 默认：开启
- 关闭后：搜索栏不再请求百度建议 API

**实现：**
```vue
<!-- GeneralSettings.vue -->
<div class="flex items-center justify-between py-3">
    <div>
        <h3 class="font-medium">搜索建议</h3>
        <p class="text-sm text-gray-500">由百度提供，关闭后可提升隐私</p>
    </div>
    <button 
        @click="toggleSuggest"
        :class="suggestEnabled ? 'bg-blue-500' : 'bg-gray-300'"
        class="relative w-12 h-6 rounded-full transition"
    >
        <span :class="suggestEnabled ? 'translate-x-6' : 'translate-x-1'" 
              class="absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition" />
    </button>
</div>
```

---

## 7. 数据迁移方案

### 7.1 首次加载逻辑

```typescript
function initSearchEngines() {
    const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_ENGINES)
    
    if (stored) {
        // 已有数据，加载
        searchEngines.value = JSON.parse(stored)
    } else {
        // 首次使用，初始化预设引擎
        searchEngines.value = [...PRESET_ENGINES]
        saveEngines()
    }
}
```

### 7.2 版本升级兼容

**假设未来修改了数据结构，需要迁移旧数据：**

```typescript
const DATA_VERSION = 1

interface StorageData {
    version: number
    engines: SearchEngineData[]
}

function migrateData(oldData: any): SearchEngineData[] {
    // 从旧格式迁移到新格式
    if (!oldData.version) {
        // v0 → v1: 添加 isCustom 字段
        return oldData.map((engine: any) => ({
            ...engine,
            isCustom: engine.id > 3,  // 假设 id>3 是自定义的
        }))
    }
    return oldData.engines
}
```

---

## 8. 性能优化

### 8.1 防抖处理
- 搜索建议请求：已实现（300ms）
- 表单验证：实时验证，无需防抖

### 8.2 图标加载优化
- 使用 `<img>` 的 `loading="lazy"`（虽然图标很小，但养成习惯）
- 图标加载失败时显示默认图标

### 8.3 localStorage 优化
- 只在数据变化时保存
- 使用 `watch` 监听状态变化，自动保存

---

## 9. 错误处理

### 9.1 用户输入错误
- URL 格式错误：表单验证提示
- 缺少 `{keyword}`：提示"URL 中必须包含 {keyword}"
- 重复名称：提示"该搜索引擎已存在"

### 9.2 网络错误
- Favicon 加载失败：显示默认图标（🔍）
- 搜索建议 API 失败：静默失败，不影响搜索

### 9.3 数据错误
- localStorage 读取失败：重新初始化为预设引擎
- 数据格式错误：尝试迁移，失败则重置

---

## 10. 未来扩展

### 10.1 短期（1-2 周）
- [ ] 搜索引擎排序（拖拽调整顺序）
- [ ] 导入/导出配置（JSON 文件）
- [ ] 快捷键支持（Ctrl+K 打开搜索）

### 10.2 中期（1-2 月）
- [ ] 壁纸设置（切换壁纸源、手动上传）
- [ ] 快捷方式布局（网格列数调整）
- [ ] 搜索历史记录（可选开启）

### 10.3 长期（3+ 月）
- [ ] 数据同步（WebDAV / Chrome Storage Sync）
- [ ] 主题切换（暗色模式）
- [ ] 插件市场（社区分享搜索引擎配置）

---

## 11. 开发检查清单

### Phase 1: 数据层重构
- [ ] 定义 `SearchEngineData` 接口
- [ ] 创建 `useSearchEngines` composable
- [ ] 实现 localStorage 读写逻辑
- [ ] 实现模板 → 函数转换
- [ ] 编写单元测试（可选）

### Phase 2: UI 组件
- [ ] 创建 `SettingsPanel.vue` 框架
- [ ] 实现侧滑动画
- [ ] 创建 Tab 切换逻辑
- [ ] 新标签页添加齿轮按钮

### Phase 3: 搜索引擎管理
- [ ] 创建 `SearchEngineManager.vue`
- [ ] 创建 `SearchEngineForm.vue`
- [ ] 实现模板库
- [ ] 实现添加/编辑/删除功能
- [ ] 表单验证

### Phase 4: 集成与优化
- [ ] 修改 `SearchBar.vue` 使用新的 composable
- [ ] 实现搜索建议开关
- [ ] 图标加载优化
- [ ] 错误处理
- [ ] 测试所有功能

### Phase 5: 文档与发布
- [ ] 更新 README.md
- [ ] 更新 CLAUDE.md
- [ ] 创建 CHANGELOG.md
- [ ] 截图演示
- [ ] 打包发布

---

## 12. API 清单

### Composable API: `useSearchEngines()`

```typescript
{
    // 状态
    searchEngines: Ref<SearchEngineData[]>
    activeEngineId: Ref<number>
    suggestEnabled: Ref<boolean>
    
    // 计算属性
    currentEngine: ComputedRef<SearchEngine>
    customEngines: ComputedRef<SearchEngineData[]>
    
    // 方法
    loadEngines: () => void
    addEngine: (data: Omit<SearchEngineData, 'id' | 'isCustom'>) => void
    updateEngine: (id: number, data: Partial<SearchEngineData>) => void
    deleteEngine: (id: number) => void
    setActiveEngine: (id: number) => void
    toggleSuggest: () => void
}
```

---

## 附录 A：文件清单

**新增文件：**
- `src/composables/useSearchEngines.ts` - 搜索引擎状态管理
- `src/components/SettingsPanel.vue` - 设置面板容器
- `src/components/settings/SearchEngineManager.vue` - 搜索引擎管理
- `src/components/settings/SearchEngineForm.vue` - 添加/编辑表单
- `src/components/settings/GeneralSettings.vue` - 通用设置
- `docs/TECH_DESIGN.md` - 本文档

**修改文件：**
- `src/newtab/App.vue` - 添加设置入口
- `src/components/SearchBar.vue` - 使用 composable
- `src/types/search.ts` - 更新接口定义

**可选删除：**
- `src/sidepanel/*` - 如果不使用 Chrome 原生侧边栏

---

**文档结束**
