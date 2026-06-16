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
  - `App.vue` - 主组件，包含必应壁纸获取、缓存逻辑
  - `index.html` - HTML 入口
  - `main.ts` - Vue 应用挂载
- `components/` - 共享组件
  - `SearchBar.vue` - 搜索栏组件（多引擎切换、搜索建议、键盘导航）
  - `ShortcutManager.vue` - 快捷方式管理（增删改查、右键编辑、localStorage 持久化）
- `popup/` - 工具栏点击弹出面板（当前已注释，未启用）
- `sidepanel/` - 侧边栏面板
- `content/` - 内容脚本（页面悬浮球，当前已注释，未启用）
- `types/` - TypeScript 类型定义
  - `search.ts` - `SearchEngine` 接口定义
- `assets/` - 静态资源（图标、SVG）

**扩展页面映射（manifest.config.ts）:**
- `chrome_url_overrides.newtab` → `src/newtab/index.html` - 覆盖 Chrome 默认新标签页
- `side_panel` → `src/sidepanel/index.html` - 侧边栏面板
- ~~`action.default_popup`~~ - 工具栏弹出面板（已注释）
- ~~`content_scripts`~~ - 内容脚本（已注释）

### 核心功能逻辑

**必应壁纸 (`newtab/App.vue`):**
- 使用 localStorage 缓存当天壁纸（key: `bing_wallpaper_cache`），避免重复请求
- 多 API 降级策略：官方 API → 中国区 API → 代理 API
- 缓存数据结构：`{ url: string, date: string, timestamp: number }`
- 每日首次加载时自动获取最新壁纸并更新缓存

**搜索功能 (`SearchBar.vue`):**
- 支持必应、谷歌、百度三种搜索引擎
- 搜索建议使用百度 JSONP API，300ms 防抖优化
- 键盘导航：上下箭头选择建议、Enter 确认、Escape 关闭
- 点击外部自动关闭下拉菜单和建议列表

**快捷方式 (`ShortcutManager.vue`):**
- localStorage 持久化（key: `shortcuts`）
- 右键点击显示编辑/删除按钮
- 支持两种图标类型：
  - `url` - 网站 favicon URL
  - `text` - 文字图标（带自定义背景色）
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
- `host_permissions` - 百度搜索建议 API (`https://suggestion.baidu.com/*`)

**CRXJS 热更新:**
- 开发模式下修改代码会自动触发扩展重新加载
- 修改 manifest 配置需要手动刷新扩展页面
