// src/billing/router/index.js
// Sub-routes mounted under /billing.
// - '' placeholder (requireAuth)
// - /login + /register (public, from change 2)
// - /categories (requireAuth, change 3)
// - /rules (requireAuth, change 3)
export default [
  {
    path: '',
    component: () => import('../views/PlaceholderView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: 'categories',
    component: () => import('../views/CategoryManageView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'rules',
    component: () => import('../views/RuleManageView.vue'),
    meta: { requireAuth: true },
  },
]