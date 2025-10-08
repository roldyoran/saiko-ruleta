import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Actualizar el título de la pestaña según la ruta
const APP_NAME = 'Saiko Ruleta'
router.afterEach((to) => {
	const titleFromMeta = to.meta && (to.meta.title as string)
	const title = titleFromMeta || (to.name ? String(to.name).replace(/[-_]/g, ' ') : '')
	document.title = title ? `${title} — ${APP_NAME}` : APP_NAME
})
