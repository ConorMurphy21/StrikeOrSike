import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue';
const Game = () => import('@/views/Game.vue');
const About = () => import('@/views/About.vue');
const HowToPlay = () => import('@/views/HowToPlay.vue');
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