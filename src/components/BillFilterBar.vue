<template>
  <div class="filter-bar">
    <label>
      类别
      <CategorySelect :modelValue="local.category || ''" @update:modelValue="update('category', $event)" />
    </label>
    <label>
      起始日期
      <input type="date" :value="local.start_date || ''" @change="update('start_date', $event.target.value || null)" />
    </label>
    <label>
      结束日期
      <input type="date" :value="local.end_date || ''" @change="update('end_date', $event.target.value || null)" />
    </label>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import CategorySelect from './CategorySelect.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue', 'apply'])

const local = reactive({ category: null, start_date: null, end_date: null })

watch(() => props.modelValue, v => {
  local.category = v.category || null
  local.start_date = v.start_date || null
  local.end_date = v.end_date || null
}, { immediate: true, deep: true })

function update(key, value) {
  local[key] = value || null
  emit('update:modelValue', { ...local })
  emit('apply')
}
function reset() {
  local.category = null; local.start_date = null; local.end_date = null
  emit('update:modelValue', { ...local })
  emit('apply')
}
</script>

<style scoped>
.filter-bar { display: flex; gap: 16px; align-items: center; padding: 8px 0; }
.filter-bar label { display: flex; gap: 6px; align-items: center; font-size: 13px; }
</style>