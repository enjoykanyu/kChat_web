import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/value',
      name: 'value',
      props: true, // 使用 props 传递参数

      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/value.vue'),
    },
    {
      path: '/video',
      name: 'video',
      props: true, // 使用 props 传递参数

      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/VideoApp.vue'),
    },
  ],
})

export default router
