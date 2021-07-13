import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import './index.css'
import 'font-awesome/css/font-awesome.css'
const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
