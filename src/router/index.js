import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'
import { installAuthGuard } from '@/shared/guards'

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

installAuthGuard(router)

export default router