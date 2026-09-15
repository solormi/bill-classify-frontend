import { createRouter, createWebHistory } from 'vue-router'
import BillListView from '../views/BillListView.vue'
import BillUploadView from '../views/BillUploadView.vue'
import BillCreateView from '../views/BillCreateView.vue'
import BillDetailView from '../views/BillDetailView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                 component: BillListView,   name: 'list' },
    { path: '/bills/upload',     component: BillUploadView, name: 'upload' },
    { path: '/bills/new',        component: BillCreateView, name: 'create' },
    { path: '/bills/:id',        component: BillDetailView, name: 'detail', props: true }
  ]
})