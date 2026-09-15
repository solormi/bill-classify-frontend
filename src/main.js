import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useMock } from './api/client'
import { setupMock } from './api/mock'
import './styles/tokens.css'

if (useMock) setupMock()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')