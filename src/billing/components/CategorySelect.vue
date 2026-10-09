<script setup>
// CategorySelect — single-select dropdown for category_id.
// Designed to be reused by the bill-entry form (change 4), so it
// deliberately does NOT depend on any specific view's state.
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const props = defineProps({
  value: { type: Number, default: null },
  level: { type: Number, default: 1, validator: (v) => v === 1 || v === 2 },
  excludeSystem: { type: Boolean, default: false },
  placeholder: { type: String, default: '选择分类' },
})
const emit = defineEmits(['update:value'])

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)

onMounted(() => catStore.ensureLoaded())

const options = computed(() => {
  return categories.value
    .filter((c) => {
      if (props.level === 1 && c.parent_id != null) return false
      if (props.level === 2 && c.parent_id == null) return false
      if (props.excludeSystem && c.user_id == null) return false
      return true
    })
    .map((c) => ({ value: c.id, label: `${c.icon || ''} ${c.name}` }))
})

function onChange(e) {
  emit('update:value', e.target.value ? Number(e.target.value) : null)
}
</script>

<template>
  <select :value="value ?? ''" @change="onChange">
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
</template>