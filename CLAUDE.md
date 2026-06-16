# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Chrome Manifest V3 的新标签页扩展，提供必应每日壁纸、多搜索引擎支持和快捷方式管理功能。

## Commands

**Development:**
```bash
pnpm install        # 安装依赖
pnpm run dev        # 启动开发服务器（开发时实时编译）
pnpm run build      # 生产环境构建（TypeScript 类型检查 + Vite 构建）
```

**Chrome 扩展加载:**
1. 运行 `pnpm run dev` 后，在 Chrome 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"，选择项目中的 `dist` 目录

**生产环境构建:**
- 运行 `pnpm run build` 会生成 `dist/` 目录（扩展文件）和 `release/` 目录（包含 `.zip` 打包文件）

## Architecture

### 技术栈
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** - 严格类型检查
- **Vite** - 构建工具
- **CRXJS Vite Plugin** - Chrome 扩展开发集成（处理 manifest、HMR 等）
- **UnoCSS** - 原子化 CSS 框架
- **VueUse** - Vue 组合式工具库

### 项目结构

**关键配置文件:**
- `manifest.config.ts` - Chrome 扩展 manifest 配置（导出为 manifest.json）
- `vite.config.ts` - Vite 构建配置，包含 CRXJS、Vue、UnoCSS 插件
- `uno.config.ts` - UnoCSS 配置
- `tsconfig.json` - TypeScript 配置，路径别名 `@/*` 映射到 `src/*`

**源码目录 (`src/`):**
- `newtab/` - **新标签页入口**（主要功能页面）
  - `App.vue` - 主组件，包含必应壁纸获取、缓存逻辑、设置入口
  - `index.html` - HTML 入口
  - `main.ts` - Vue 应用挂载
- `components/` - 共享组件
  - `SearchBar.vue` - 搜索栏组件（多引擎切换、搜索建议、键盘导航）
  - `ShortcutManager.vue` - 快捷方式管理（增删改查、右键编辑、localStorage 持久化）
  - `SettingsPanel.vue` - 设置面板容器（侧滑动画、Tab 切换）
  - `settings/` - 设置相关组件
    - `SearchEngineManager.vue` - 搜索引擎管理
    - `SearchEngineForm.vue` - 添加/编辑引擎表单
    - `GeneralSettings.vue` - 通用设置（搜索建议开关、快捷方式布局、壁纸设置、配置备份）
- `composables/` - 状态管理
  - `useSearchEngines.ts` - 搜索引擎状态管理（增删改查、localStorage 持久化）
  - `useWallpaperSettings.ts` - 壁纸显示设置（详情/日期/控制按钮开关，模块级响应式共享 + localStorage 持久化）
- `popup/` - 工具栏点击弹出面板（当前已注释，未启用）
- `sidepanel/` - 侧边栏面板（未使用）
- `content/` - 内容脚本（页面悬浮球，当前已注释，未启用）
- `types/` - TypeScript 类型定义
  - `search.ts` - `SearchEngine` 和 `SearchEngineData` 接口定义
- `assets/` - 静态资源（图标、SVG）

**扩展页面映射（manifest.config.ts）:**
- `chrome_url_overrides.newtab` → `src/newtab/index.html` - 覆盖 Chrome 默认新标签页
- `side_panel` → `src/sidepanel/index.html` - 侧边栏面板
- ~~`action.default_popup`~~ - 工具栏弹出面板（已注释）
- ~~`content_scripts`~~ - 内容脚本（已注释）

### 核心功能逻辑

**必应壁纸 (`newtab/App.vue`):**
- 一次获取最近 8 天壁纸（API 参数 `idx=0&n=8`），支持按天切换上一天 / 下一天
- 多 API 降级策略：官方 API → 中国区 API → 代理 API（代理仅返回当天一张，不支持往日切换）
- 壁纸对象结构：`{ url, date, title?, copyright? }`
- localStorage 缓存当天列表（key: `bing_wallpaper_cache`，结构 `{ date, timestamp, wallpapers: [] }`），避免重复请求
- **锁定功能**：锁定后固定显示当前壁纸（key: `bing_wallpaper_lock`），打开页面不再自动获取最新；解锁后恢复自动更新
- **壁纸详情**：左下角显示壁纸标题 / 版权（`currentInfo`）
- 右下角控制条：日期、上一天 / 下一天、锁定 / 解锁；各元素显隐由 `useWallpaperSettings` 控制
- 注意：必应 API 不返回 CORS 头，需在 `manifest.config.ts` 的 `host_permissions` 声明必应域名以绕过 CORS

**搜索功能 (`SearchBar.vue` + `useSearchEngines.ts`):**
- 使用 Composable 模式管理搜索引擎状态
- 支持预设引擎（必应、谷歌、百度）+ 用户自定义引擎
- 搜索引擎数据结构：`SearchEngineData`（存储层，使用模板字符串）和 `SearchEngine`（运行时层，带函数）
- localStorage 持久化（key: `search_engines`, `active_engine_id`, `suggest_enabled`）
- 搜索建议使用百度 JSONP API，300ms 防抖优化
- 支持搜索建议开关（关闭后可提升隐私）
- 键盘导航：上下箭头选择建议、Enter 确认、Escape 关闭
- 点击外部自动关闭下拉菜单和建议列表

**设置面板 (`SettingsPanel.vue`):**
- 右上角齿轮按钮触发
- 侧边滑出动画（从右侧滑入，200ms ease-out）
- 三个 Tab：搜索引擎管理、通用设置、关于
- 关于 Tab 含项目地址链接（GitHub）
- 半透明遮罩 + 白色面板

**通用设置 (`GeneralSettings.vue`):**
- 搜索建议开关（`suggest_enabled`）
- 快捷方式布局列数（`shortcut_columns`，通过 `shortcut-layout-change` 自定义事件通知 `ShortcutManager`）
- 壁纸设置：壁纸详情 / 日期 / 切换与锁定按钮三个开关（由 `useWallpaperSettings` 管理）
- **配置备份**：导出 / 导入全部配置
  - 备份范围：`search_engines`、`active_engine_id`、`suggest_enabled`、`shortcuts`、`shortcut_columns`、`wallpaper_show_*`（不含每日壁纸临时缓存）
  - 导出为 `{ version, exportTime, data }` 的 JSON 文件
  - 导入校验格式 + 二次确认，写回 localStorage 后 `location.reload()` 使各组件重新初始化

**搜索引擎管理 (`SearchEngineManager.vue` + `SearchEngineForm.vue`):**
- 展示所有搜索引擎（预设 + 自定义）
- 支持切换当前使用的引擎
- 支持添加/编辑/删除自定义引擎（预设引擎不可删除）
- 添加表单包含：
  - 常用引擎模板库（DuckDuckGo、搜狗、360搜索、Yandex）
  - 手动填写：名称、URL 模板（含 `{keyword}` 占位符）、图标 URL
  - 表单验证：名称长度、URL 格式、必须包含 `{keyword}`
  - 自动获取 favicon 功能
  - 实时预览

**快捷方式 (`ShortcutManager.vue`):**
- localStorage 持久化（key: `shortcuts`）
- 右键唤出编辑/删除按钮，点击其他区域自动收起
- 支持两种图标类型：
  - `url` - 网站 favicon URL
  - `text` - 文字图标（带自定义背景色）
- 图标来源可切换：Google Favicon API 或网站自带 `favicon.ico`
- 自动获取网站信息功能（favicon + 域名标题）
- Teleport 渲染编辑对话框到 `body`，避免 z-index 问题

### 开发约定

**Vue 组件风格:**
- 使用 `<script setup lang="ts">` 语法
- 组合式 API（`ref`, `computed`, `watch`, `onMounted` 等）
- 响应式数据使用 `.value` 访问

**样式:**
- 优先使用 UnoCSS 原子类（如 `flex`, `items-center`, `w-full`, `rounded-2xl`）
- Scoped 样式仅用于动画和特殊样式覆盖
- 颜色方案：白色卡片 + 半透明背景遮罩（`bg-black/25`）

**Chrome 扩展权限 (manifest.config.ts):**
- `sidePanel` - 侧边栏支持
- `contentSettings` - 内容设置
- `host_permissions` - 跨域 API 访问（绕过 CORS）：
  - 百度搜索建议 (`https://suggestion.baidu.com/*`)
  - 必应壁纸 (`https://www.bing.com/*`、`https://cn.bing.com/*`、`https://bing.biturl.top/*`)

**CRXJS 热更新:**
- 开发模式下修改代码会自动触发扩展重新加载
- 修改 manifest 配置需要手动刷新扩展页面
