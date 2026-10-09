<script setup>
// DatePicker — minimal YYYY-MM-DD date input. Backend expects strings,
// so we never round-trip through a Date object here. No third-party
// date library by design.
defineProps({
  modelValue: { type: String, default: '' }, // YYYY-MM-DD
})
const emit = defineEmits(['update:modelValue'])
function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <input
    type="date"
    :value="modelValue"
    @input="onInput"
  />
</template>
