import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 2. Importeer de iconen die je wilt gebruiken
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'

// 3. Voeg de iconen toe aan de library
library.add(faPenToSquare, faTrash)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount("#app")
