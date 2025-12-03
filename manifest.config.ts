import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  // 工具栏点击面板
  // action: {
  //   default_icon: {
  //     48: 'public/logo.png',
  //   },
  //   default_popup: 'src/popup/index.html',
  // },
  // 页面悬浮球
  // content_scripts: [{
  //   js: ['src/content/main.ts'],
  //   matches: ['https://*/*'],
  // }],
  permissions: [
    'sidePanel',
    'contentSettings',
  ],
  host_permissions: [
    "https://suggestion.baidu.com/*",
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  chrome_url_overrides: {
    newtab: 'src/newtab/index.html',
  },
})
