import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Import Custom Styles
import './assets/css/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
