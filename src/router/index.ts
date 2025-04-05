import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/chatIm',
      name: 'chatIm',
      component: () => import('../views/ChatIm.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatViewNew.vue'),
      // props: true
    }
  ]
})

export default router
