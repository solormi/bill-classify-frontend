import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useMock } from './api/client'
import { setupMock } from './api/mock'
import './styles/tokens.css'

if (useMock) setupMock()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 启动时如果有 token 就 hydrate(避免路由守卫里才异步触发导致首屏闪烁)
const auth = useAuthStore()
if (auth.token) {
  auth.hydrateFromStorage().catch(() => { /* token 过期时已自动 clear */ })
}

app.mount('#app')