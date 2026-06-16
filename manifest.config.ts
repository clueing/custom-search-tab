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
    "https://suggestion.baidu.com/*",
    "https://www.bing.com/*",
    "https://cn.bing.com/*",
    "https://bing.biturl.top/*",
  ],
  chrome_url_overrides: {
    newtab: 'src/newtab/index.html',
  },
})
