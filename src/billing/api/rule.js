// src/billing/api/rule.js
// Wrappers around /api/v1/billing/rules plus the live-preview helper.
import http from '@/api/http'

export const ruleApi = {
  list() {
    return http.get('/billing/rules')
  },
  create(payload) {
    return http.post('/billing/rules', payload)
  },
  update(id, payload) {
    return http.patch(`/billing/rules/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/billing/rules/${id}`)
  },
  // Live preview — call as the user types in the bill-entry form.
  preview({ merchant, note, amount }) {
    return http.post('/billing/rules/preview', { merchant, note, amount })
  },
}