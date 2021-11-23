import { createWebHistory, createRouter } from "vue-router";
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
    {
        path: '/',
        component: Home,
        name: 'home',
        meta: { title: 'Home' }
    },
    {
        path: '/:roomName',
        component: Game,
        name: 'game',
        props: route => ({roomName: route.params.roomName}),
        meta: { title: 'Game' }
    },
    {
        path: '/:path(.*)',
        component: NotFound
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;