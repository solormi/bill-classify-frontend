<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const props = defineProps({
  merchant: { type: String, required: true },
  newCategoryId: { type: Number, required: true },
})
const emit = defineEmits(['cancel', 'save'])

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)

const categoryName = computed(() => {
  const c = categories.value.find((x) => x.id === props.newCategoryId)
  return c ? `${c.icon || ''} ${c.name}` : `#${props.newCategoryId}`
})
</script>

<template>
  <div class="dialog-backdrop" @click.self="emit('cancel')">
    <div class="dialog">
      <h3>保存为规则?</h3>
      <p>
        你把「<strong>{{ merchant }}</strong>」的分类手动改成了「<strong>{{ categoryName }}</strong>」。
      </p>
      <p class="hint" style="margin: 0;">以后遇到相同商户时,系统会自动应用这条规则。</p>
      <div class="dialog-actions">
        <button class="btn btn-ghost" @click="emit('cancel')">不保存</button>
        <button class="btn btn-primary" @click="emit('save')">保存为规则</button>
      </div>
    </div>
  </div>
</template>