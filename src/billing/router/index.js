// src/billing/router/index.js
// Sub-routes mounted under /billing.
// - '' placeholder (requireAuth)
// - /login + /register (public, from change 2)
// - /categories (requireAuth, change 3)
// - /rules (requireAuth, change 3)
// - /bills, /bills/new, /bills/recycle, /bills/:id, /bills/:id/edit (change 4)
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
  {
    path: 'bills',
    component: () => import('../views/BillListView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'bills/new',
    component: () => import('../views/BillCreateView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'bills/recycle',
    component: () => import('../views/BillRecycleView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'bills/:id',
    component: () => import('../views/BillDetailView.vue'),
    meta: { requireAuth: true },
  },
  {
    path: 'bills/:id/edit',
    component: () => import('../views/BillEditView.vue'),
    meta: { requireAuth: true },
  },
]