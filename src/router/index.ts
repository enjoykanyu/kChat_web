import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chatIm',
      component: () => import('../views/ChatIm.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginNew.vue'),
    },
  ]
})

export default router
