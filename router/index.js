import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '@/components/HelloWorld'
import vKnowledgeGraph from "@/components/vKnowledgeGraph";
// import RelationG from '@/components/RelationG'
import MapContainer from "@/components/MapContainer";

const routes = [
    {
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld
    },
    {
        path: '/vknowledgegraph',
        name: 'vknowledgegraph',
        component: vKnowledgeGraph
    },
    {
        path: '/MapContainer',
        name: 'MapContainer',
        component: MapContainer
    },


    // 其他路由配置...
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;