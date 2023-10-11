import { createRouter, createWebHistory } from 'vue-router';
// import HelloWorld from '@/components/HelloWorld'
import vKnowledgeGraph from "@/components/vKnowledgeGraph";
// import RelationG from '@/components/RelationG'
import edgeTable from "@/components/edgeTable";
import MapContainer from "@/components/MapContainer";
import echartTable from "@/components/echartTable";
const routes = [
    {
        path: '/',
        redirect:'/vknowledgegraph'
        // name: 'HelloWorld',
        // component: HelloWorld
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
    {
        path: '/edgeTable',
        name: 'edgeTable',
        component: edgeTable
    },
    {
        path: '/echartTable',
        name: 'echartTable',
        component: echartTable
    }


    // 其他路由配置...
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;