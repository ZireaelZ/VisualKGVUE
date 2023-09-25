import { createApp } from 'vue'
import App from './App.vue'
import router from "../router/index.js";
import RelationGraph from 'relation-graph/vue3';

const app =createApp(App)
app.use(RelationGraph)
app.use(router)
app.mount('#app')
// createApp(App).mount('#app')
