// src/billing/api/category.js
// Thin wrappers around the /api/v1/billing/categories endpoints.
import http from '@/api/http'

export const categoryApi = {
  list() {
    return http.get('/billing/categories')
  },
  create(payload) {
    return http.post('/billing/categories', payload)
  },
  update(id, payload) {
    return http.patch(`/billing/categories/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/billing/categories/${id}`)
  },
}