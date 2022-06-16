import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'
import './index.css'
import 'font-awesome/css/font-awesome.css'

const app = createApp(App)
app.use(naive)
app.mount('#app').$nextTick(window.removeLoading)
console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)
