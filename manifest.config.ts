import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: '简单搜索',
  description: '简约、安全、无广告的新标签页扩展：必应每日壁纸、多搜索引擎切换与快捷方式管理。',
  version: pkg.version,
  icons: {
    16: 'public/logo-16.png',
    32: 'public/logo-32.png',
    48: 'public/logo-48.png',
    128: 'public/logo.png',
  },
  action: {
    default_icon: {
      16: 'public/logo-16.png',
      32: 'public/logo-32.png',
      48: 'public/logo-48.png',
      128: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  host_permissions: [
    // 访问任意网站：抓取快捷方式网页标题、搜索建议与必应壁纸
    "https://*/*",
    "http://*/*",
  ],
  chrome_url_overrides: {
    newtab: 'src/newtab/index.html',
  },
})
