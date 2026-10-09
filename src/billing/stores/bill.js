// src/billing/stores/bill.js
// Pinia store for bill CRUD + recycle. Owns the live list, total counter,
// and the archived (recycle) list; mutations apply optimistically after the
// API call resolves.
import { defineStore } from 'pinia'
import { billApi } from '@/billing/api/bill'

export const useBillStore = defineStore('bill', {
  state: () => ({
    bills: [],
    total: 0,
    recycle: [],
    loading: false,
  }),
  getters: {
    findById: (state) => (id) => state.bills.find((b) => b.id === id) || null,
  },
  actions: {
    async fetch({ page = 1, pageSize = 20 } = {}) {
      this.loading = true
      try {
        const { data } = await billApi.list({ page, pageSize })
        this.bills = data.items || []
        this.total = data.total || 0
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const { data } = await billApi.create(payload)
      this.bills.unshift(data) // newest first
      this.total += 1
      return data
    },
    async update(id, payload) {
      const { data } = await billApi.update(id, payload)
      const idx = this.bills.findIndex((b) => b.id === id)
      if (idx >= 0) this.bills[idx] = data
      return data
    },
    async remove(id) {
      await billApi.remove(id)
      this.bills = this.bills.filter((b) => b.id !== id)
      this.total = Math.max(0, this.total - 1)
    },
    async fetchRecycle({ page = 1, pageSize = 20 } = {}) {
      this.loading = true
      try {
        const { data } = await billApi.listRecycle({ page, pageSize })
        this.recycle = data.items || []
      } finally {
        this.loading = false
      }
    },
    async restore(id) {
      const { data } = await billApi.restore(id)
      this.recycle = this.recycle.filter((b) => b.original_id !== id)
      this.bills.unshift(data)
      this.total += 1
      return data
    },
  },
})
