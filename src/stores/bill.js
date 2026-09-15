import { defineStore } from 'pinia'
import { listBills, createBill, updateBill, updateCategory, deleteBill, getBill } from '../api/bills'

export const useBillStore = defineStore('bill', {
  state: () => ({
    bills: [],
    filter: { category: null, start_date: null, end_date: null },
    sort: { field: 'tx_date', order: 'desc' },
    loading: false,
    error: null,
    lastFetchedId: null
  }),
  actions: {
    async fetchBills() {
      this.loading = true; this.error = null
      try {
        const params = {}
        if (this.filter.category) params.category = this.filter.category
        if (this.filter.start_date) params.start_date = this.filter.start_date
        if (this.filter.end_date) params.end_date = this.filter.end_date
        params.sort = this.sort.field
        params.order = this.sort.order
        const res = await listBills(params)
        this.bills = res.data || []
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    setFilter(filter) {
      this.filter = { ...this.filter, ...filter }
    },
    setSort(sort) {
      this.sort = { ...this.sort, ...sort }
    },
    async create(payload) {
      const b = await createBill(payload)
      this.bills.unshift(b)
      return b
    },
    async update(id, payload) {
      const b = await updateBill(id, payload)
      const idx = this.bills.findIndex(x => x.id === id)
      if (idx >= 0) this.bills[idx] = b
      return b
    },
    async changeCategory(id, category) {
      const before = this.bills.find(x => x.id === id)
      const prevCategory = before ? category || before.category : null
      // 乐观更新
      if (before) before.category = category
      try {
        const b = await updateCategory(id, category)
        if (before) Object.assign(before, b)
      } catch (e) {
        if (before) before.category = prevCategory
        throw e
      }
    },
    async remove(id) {
      await deleteBill(id)
      this.bills = this.bills.filter(x => x.id !== id)
    },
    async fetchOne(id) {
      return getBill(id)
    }
  }
})