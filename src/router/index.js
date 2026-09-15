import { createRouter, createWebHistory } from 'vue-router'
import BillListView from '../views/BillListView.vue'
import BillUploadView from '../views/BillUploadView.vue'
import BillCreateView from '../views/BillCreateView.vue'
import BillDetailView from '../views/BillDetailView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

// 需要登录才能访问的路由 name 列表
const PROTECTED = new Set(['list', 'upload', 'create', 'detail'])

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login',        component: LoginView,       name: 'login', meta: { public: true } },
    { path: '/',             component: BillListView,    name: 'list' },
    { path: '/bills/upload', component: BillUploadView,  name: 'upload' },
    { path: '/bills/new',    component: BillCreateView,  name: 'create' },
    { path: '/bills/:id',    component: BillDetailView,  name: 'detail', props: true }
  ]
})

// 全局路由守卫:未登录访问受保护路由 → /login?redirect=原路径
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 公开路由(包括 /login)直接放行
  if (to.meta.public) {
    // 已登录用户访问 /login → 直接跳到首页,避免重复登录
    if (to.name === 'login' && auth.isAuthenticated) {
      return { name: 'list' }
    }
    return true
  }

  // 受保护路由:有 token 但还没 hydrate 过 user → 先 hydrate
  if (auth.token && !auth.user) {
    await auth.hydrateFromStorage()
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

// 登录成功后跳回原 redirect 目标
export function redirectAfterLogin(router, route) {
  const target = route?.query?.redirect
  if (typeof target === 'string' && target.startsWith('/')) {
    return router.push(target)
  }
  return router.push({ name: 'list' })
}