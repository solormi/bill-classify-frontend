<script setup>
// SaveRuleDialog — confirms whether the user's manual category override
// should also be saved as a classification rule. Triggered from BillForm
// only when the user actively changed the category away from the
// auto-suggested one.
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
        你手动把「<strong>{{ merchant }}</strong>」改成了
        「<strong>{{ categoryName }}</strong>」。
      </p>
      <p class="hint">以后遇到相同商户时自动应用这条规则。</p>
      <div class="actions">
        <button @click="emit('cancel')">不保存</button>
        <button class="primary" @click="emit('save')">保存为规则</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.dialog { background: white; padding: 1.5rem; border-radius: 8px; max-width: 360px; }
.actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.hint { color: #888; font-size: 0.85rem; }
button.primary { background: #06c; color: white; }
</style>
