<template>
  <div class="upload">
    <input type="file" accept=".csv" @change="onPick" data-testid="file-input" />
    <button @click="onSubmit" :disabled="!file">上传</button>
    <p v-if="loading" class="muted">上传中…</p>
    <div v-if="result">
      <p>导入 {{ result.imported_count }} 条,失败 {{ result.failed_count }} 条</p>
      <ul v-if="result.failed_rows.length">
        <li v-for="f in result.failed_rows" :key="f.row">
          第 {{ f.row }} 行: {{ f.reason }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadCsv } from '../api/bills'

const file = ref(null)
const loading = ref(false)
const result = ref(null)

function onPick(e) {
  file.value = e.target.files?.[0] || null
  result.value = null
}

async function onSubmit() {
  if (!file.value) return
  loading.value = true
  try {
    result.value = await uploadCsv(file.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload { display: flex; flex-direction: column; gap: 12px; max-width: 480px; }
</style>