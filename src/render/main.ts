import '@src/common/patch'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ipcRenderer } from 'electron'
import './index.css'
import 'font-awesome/css/font-awesome.css'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'

// 将自动设置 Day.js 的国际化设置为 'zh-cn'

// setTimeout(() => {
//   console.log("ipcRenderer:", ipcRenderer);
//   // Configuration name causes hot updates to be slow | 传递 name 后会导致热更新很慢
//   // console.log('electron-store', new Store({ name: 'electron-vue' }))
//   // https://github.com/caoxiemeihao/electron-vue-vite/issues/10
//   console.log("electron-store", new Store());

//   // new Store 会阻塞线程，导致 preload 动画卡顿
// }, 2999);
const app = createApp(App)
app.use(VXETable).use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app').$nextTick(window.removeLoading)
