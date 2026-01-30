import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
app.use(router)

app.mount('#app')
