import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/billing' },
    {
      path: '/billing',
      children: billingRoutes,
    },
  ],
})

export default router