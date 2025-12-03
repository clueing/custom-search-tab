# 简单搜索 - 自定义新标签页 Chrome 扩展

这是一个基于 Vue 3、TypeScript 和 Vite 构建的 Chrome 扩展，提供了自定义的新标签页功能，包括必应每日壁纸、多搜索引擎支持和快捷方式管理。

## 功能特性

- 🌅 **必应每日壁纸** - 自动获取必应每日壁纸作为新标签页背景
- 🔍 **多搜索引擎** - 支持必应、谷歌、百度等多种搜索引擎切换
- ⌨️ **搜索建议** - 提供实时搜索建议功能
- 🚀 **快捷方式管理** - 可自定义添加、编辑、删除常用网站快捷方式
- 🎨 **响应式设计** - 适配不同屏幕尺寸
- 🧩 **Chrome 扩展** - 基于 Manifest V3 标准构建

## 技术栈

- Vue 3 with `<script setup>` 语法
- TypeScript
- Vite 构建工具
- CRXJS Vite 插件集成
- UnoCSS 样式框架
- VueUse 工具库

## 快速开始

1. 安装依赖:
```bash
pnpm install
```

2. 启动开发服务器:
```bash
pnpm run dev
```

3. 在 Chrome 浏览器中加载扩展:
  - 打开 Chrome 浏览器
  - 打开 chrome://extensions/
  - 开启"开发者模式"
  - 点击"加载已解压的扩展程序"
  - 选择项目中的 dist 目录

4. 生产环境构建:
```bash
pnpm run build
```