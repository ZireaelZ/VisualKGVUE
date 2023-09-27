import { createApp } from 'vue'
import App from './App.vue'
import router from "../router/index.js";
// import RelationGraph from 'relation-graph/vue3';
import ElementPlus from 'element-plus'

const app =createApp(App)
// app.use(RelationGraph)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
// createApp(App).mount('#app')
