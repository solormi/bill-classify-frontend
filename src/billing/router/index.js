// src/billing/router/index.js
// Sub-routes mounted under /billing. /login and /register are public; the
// placeholder index view (path:'') carries meta.requireAuth so the guard
// kicks in once auth lands.
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
]