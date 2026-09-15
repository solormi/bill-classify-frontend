<template>
  <div class="sort-bar">
    <label>
      排序字段
      <select :value="modelValue.field" @change="update('field', $event.target.value)">
        <option value="tx_date">交易日期</option>
        <option value="amount">金额</option>
        <option value="created_at">创建时间</option>
      </select>
    </label>
    <label>
      顺序
      <select :value="modelValue.order" @change="update('order', $event.target.value)">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'apply'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  emit('apply')
}
</script>

<style scoped>
.sort-bar { display: flex; gap: 16px; align-items: center; padding: 8px 0; }
.sort-bar label { display: flex; gap: 6px; align-items: center; font-size: 13px; }
</style>