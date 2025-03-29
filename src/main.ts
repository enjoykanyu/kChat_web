import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import 'element-plus/theme-chalk/index.css'
import ElementPlus from 'element-plus'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia';
const pinia = createPinia();

const app = createApp(App)
app.use(router)
app.mount('#app')
app.use(ElementPlus)
app.use(axios)
app.use(pinia)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

