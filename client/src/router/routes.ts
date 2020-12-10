import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/lobby/Lobby.vue') },
    ],
  },
  {
    name: 'play',
    path: '/play',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'play', component: () => import('pages/play/Play.vue') },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
