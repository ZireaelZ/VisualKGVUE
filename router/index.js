import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '@/components/HelloWorld'
import vKnowledgeGraph from "@/components/vKnowledgeGraph";
import RelationG from '@/components/RelationG'

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
        path: '/RelationG',
        name: 'RelationG',
        component: RelationG
    }
    // 其他路由配置...
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;