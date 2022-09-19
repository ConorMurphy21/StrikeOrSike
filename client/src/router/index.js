import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue';
import Game from '@/views/Game.vue';
import About from '@/views/About.vue';
import NotFound from '@/views/NotFound.vue';
import HowToPlay from '@/views/HowToPlay.vue';
import store from '@/store/index';

const routes = [
    {
        path: '/',
        component: Home,
        name: 'home',
        meta: { title: 'Home' }
    },
    {
        path: '/how-to-play',
        component: HowToPlay,
        name: 'howToPlay',
        meta: { title: 'How To Play' }
    },
    {
        path: '/about',
        component: About,
        name: 'about',
        meta: { title: 'About' }
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

router.beforeEach((to, from, next) => {
    store.commit('room/setRoute', to.name);
    next();
});

export default router;