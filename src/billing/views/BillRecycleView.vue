<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBillStore } from '@/billing/stores/bill'
import { useCategoryStore } from '@/billing/stores/category'

const billStore = useBillStore()
const catStore = useCategoryStore()
const { recycle } = storeToRefs(billStore)

onMounted(() => {
  catStore.ensureLoaded()
  billStore.fetchRecycle({})
})

async function onRestore(b) {
  try {
    await billStore.restore(b.original_id)
  } catch (err) {
    alert(err.response?.data?.error?.message || '恢复失败')
  }
}

function categoryLabel(id) {
  const c = catStore.categories.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}
</script>

<template>
  <main class="page page-wide">
    <div class="page-header">
      <div>
        <h1>回收站</h1>
        <p>软删除的账单会归档在这里,点「恢复」回到主列表。</p>
      </div>
      <div class="actions">
        <router-link to="/billing/bills" class="btn btn-ghost">返回列表</router-link>
      </div>
    </div>

    <p v-if="!recycle.length" class="card empty">
      <h3>回收站是空的</h3>
      <p>软删除的账单会出现在这里。</p>
    </p>

    <table v-else class="table">
      <thead>
        <tr><th>删除时间</th><th>商户</th><th>分类</th><th class="num">金额</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="b in recycle" :key="b.id">
          <td>{{ b.deleted_at }}</td>
          <td>{{ b.merchant || '—' }}</td>
          <td>{{ categoryLabel(b.category_id) }}</td>
          <td class="num">{{ Number(b.amount).toFixed(2) }}</td>
          <td><button class="btn btn-sm btn-primary" @click="onRestore(b)">恢复</button></td>
        </tr>
      </tbody>
    </table>
  </main>
</template>