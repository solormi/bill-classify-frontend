// src/billing/api/bill.js
// Thin wrappers around the /api/v1/billing/bills endpoints, including the
// recycle list and per-bill restore action.
import http from '@/api/http'

export const billApi = {
  list({ page = 1, pageSize = 20 } = {}) {
    return http.get('/billing/bills', { params: { page, page_size: pageSize } })
  },
  create(payload) {
    return http.post('/billing/bills', payload)
  },
  get(id) {
    return http.get(`/billing/bills/${id}`)
  },
  update(id, payload) {
    return http.patch(`/billing/bills/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/billing/bills/${id}`)
  },
  listRecycle({ page = 1, pageSize = 20 } = {}) {
    return http.get('/billing/bills/recycle', { params: { page, page_size: pageSize } })
  },
  restore(id) {
    return http.post(`/billing/bills/${id}/restore`)
  },
}
