import type { RouteLocation } from 'vue-router';
import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue';
const Game = () => import('@/views/Game.vue');
const About = () => import('@/views/About.vue');
const HowToPlay = () => import('@/views/HowToPlay.vue');
import { useRoomStore } from '@/stores/room.js';

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
    props: (route: RouteLocation) => ({ roomName: route.params.roomName }),
    meta: { title: 'Game' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const room = useRoomStore();
  room.route = to.name as string;
  next();
});

export default router;
