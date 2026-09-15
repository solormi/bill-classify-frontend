<template>
  <div v-if="bill">
    <p><strong>{{ bill.merchant }}</strong> · {{ bill.tx_date }} · {{ Number(bill.amount).toFixed(2) }}</p>
    <p class="muted">{{ bill.raw_description }}</p>
    <p>
      类别:
      <CategorySelect :modelValue="bill.category" @change="onChangeCategory" />
    </p>
    <p class="muted">来源: {{ bill.source }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
  <p v-else class="muted">加载中…</p>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBillStore } from '../stores/bill'
import CategorySelect from '../components/CategorySelect.vue'

const route = useRoute()
const store = useBillStore()
const bill = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    bill.value = await store.fetchOne(route.params.id)
  } catch (e) {
    error.value = e.message
  }
})

async function onChangeCategory(category) {
  if (!bill.value) return
  try {
    bill.value = await store.update(bill.value.id, { ...bill.value, category })
  } catch (e) {
    error.value = e.message
  }
}
</script>