<template>
  <select :value="modelValue" @change="onChange">
    <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
  </select>
</template>

<script setup>
import { CATEGORIES } from '../constants/category'

const props = defineProps({
  modelValue: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue', 'change'])

function onChange(e) {
  const v = e.target.value
  emit('update:modelValue', v)
  emit('change', v)
}
</script>