// src/billing/stores/category.js
// Pinia store for category CRUD. Lists the user-visible categories
// (own + system); writes hit the API and refresh.
import { defineStore } from 'pinia'
import { categoryApi } from '@/billing/api/category'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
  }),
  getters: {
    topLevel: (state) => state.categories.filter((c) => c.parent_id == null),
    childrenOf: (state) => (parentId) =>
      state.categories.filter((c) => c.parent_id === parentId),
    isSystem: () => (cat) => cat.user_id == null,
    byId: (state) => (id) => state.categories.find((c) => c.id === id) || null,
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        const { data } = await categoryApi.list()
        this.categories = data
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const { data } = await categoryApi.create(payload)
      this.categories.push(data)
      return data
    },
    async update(id, payload) {
      const { data } = await categoryApi.update(id, payload)
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx >= 0) this.categories[idx] = data
      return data
    },
    async remove(id) {
      await categoryApi.remove(id)
      this.categories = this.categories.filter((c) => c.id !== id)
    },
    // Helper for components: ensure categories are loaded once.
    async ensureLoaded() {
      if (this.categories.length === 0 && !this.loading) {
        await this.fetch()
      }
    },
  },
})