<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '@/billing/stores/bill'
import { useCategoryStore } from '@/billing/stores/category'
import { billApi } from '@/billing/api/bill'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()
const catStore = useCategoryStore()

const bill = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await billApi.get(route.params.id)
    bill.value = data
    catStore.ensureLoaded()
  } catch (err) {
    error.value = err.response?.data?.error?.message || '加载失败'
  }
})

function categoryLabel(id) {
  const c = catStore.categories.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}

async function onDelete() {
  if (!confirm('确定删除?')) return
  try {
    await billStore.remove(bill.value.id)
    router.push('/billing/bills')
  } catch (err) {
    alert(err.response?.data?.error?.message || '删除失败')
  }
}
</script>

<template>
  <main class="page page-narrow">
    <p v-if="error" class="error" style="background: var(--color-danger-soft); color: var(--color-danger); padding: var(--space-3); border-radius: var(--radius);">{{ error }}</p>

    <div v-if="bill">
      <div class="page-header">
        <div>
          <h1>账单详情</h1>
          <p>创建于 {{ bill.created_at }}</p>
        </div>
      </div>

      <div class="card">
        <dl style="display: grid; grid-template-columns: 120px 1fr; gap: var(--space-3) var(--space-4); margin: 0;">
          <dt style="color: var(--color-text-muted);">金额</dt>
          <dd style="margin: 0; font-size: var(--text-xl); font-weight: 600; color: var(--color-brand);">
            {{ Number(bill.amount).toFixed(2) }}
          </dd>

          <dt style="color: var(--color-text-muted);">分类</dt>
          <dd style="margin: 0;">
            <span class="badge badge-brand">{{ categoryLabel(bill.category_id) }}</span>
          </dd>

          <dt style="color: var(--color-text-muted);">商户</dt>
          <dd style="margin: 0;">{{ bill.merchant || '—' }}</dd>

          <dt style="color: var(--color-text-muted);">备注</dt>
          <dd style="margin: 0; color: var(--color-text-soft);">{{ bill.note || '—' }}</dd>

          <dt style="color: var(--color-text-muted);">日期</dt>
          <dd style="margin: 0;">{{ bill.bill_date }}</dd>

          <dt style="color: var(--color-text-muted);">来源</dt>
          <dd style="margin: 0;">
            <span class="badge badge-muted">{{ bill.source }}</span>
          </dd>
        </dl>
      </div>

      <div style="display: flex; gap: var(--space-2); margin-top: var(--space-4);">
        <router-link :to="`/billing/bills/${bill.id}/edit`" class="btn btn-primary">编辑</router-link>
        <button class="btn btn-danger" @click="onDelete">删除</button>
        <router-link to="/billing/bills" class="btn btn-ghost">返回列表</router-link>
      </div>
    </div>
  </main>
</template>