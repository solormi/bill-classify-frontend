// src/billing/stores/rule.js
// Pinia store for classification rule CRUD plus live preview.
import { defineStore } from 'pinia'
import { ruleApi } from '@/billing/api/rule'

export const useRuleStore = defineStore('rule', {
  state: () => ({
    rules: [],
    loading: false,
  }),
  getters: {
    byId: (state) => (id) => state.rules.find((r) => r.id === id) || null,
    enabled: (state) => state.rules.filter((r) => r.enabled),
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        const { data } = await ruleApi.list()
        this.rules = data
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const { data } = await ruleApi.create(payload)
      this.rules.push(data)
      return data
    },
    async update(id, payload) {
      const { data } = await ruleApi.update(id, payload)
      const idx = this.rules.findIndex((r) => r.id === id)
      if (idx >= 0) this.rules[idx] = data
      return data
    },
    async remove(id) {
      await ruleApi.remove(id)
      this.rules = this.rules.filter((r) => r.id !== id)
    },
    async ensureLoaded() {
      if (this.rules.length === 0 && !this.loading) {
        await this.fetch()
      }
    },
    async preview(payload) {
      const { data } = await ruleApi.preview(payload)
      return data
    },
  },
})