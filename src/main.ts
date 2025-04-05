import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router"
import 'element-plus/theme-chalk/index.css'
import ElementPlus from 'element-plus'
import axios from 'axios'  // axios 不需要 app.use()
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'

// 创建 Pinia 实例
const pinia = createPinia()

const app = createApp(App)

// 先安装 Pinia 和路由，再挂载应用
// app.use(axios)
app.use(pinia)  // ✅ 必须在 app.mount() 之前调用
app.use(router)
app.use(ElementPlus)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 最后挂载 Vue 应用
app.mount('#app')
