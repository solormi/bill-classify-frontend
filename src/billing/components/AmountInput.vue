<script setup>
// AmountInput — number input with an enlarged display font for the
// bill-entry screen. Wraps <input type="number"> + inputmode="decimal"
// so mobile keyboards show the numeric pad; emits a Number (or '' when
// the user cleared the field) via v-model.
defineProps({
  modelValue: { type: [Number, String], default: '' },
  placeholder: { type: String, default: '0.00' },
})
const emit = defineEmits(['update:modelValue'])
function onInput(e) {
  const v = e.target.value
  emit('update:modelValue', v === '' ? '' : Number(v))
}
</script>

<template>
  <input
    type="number"
    inputmode="decimal"
    step="0.01"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
    class="amount-input"
  />
</template>

<style scoped>
.amount-input {
  font-size: 28px;
  font-weight: 600;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}
</style>
