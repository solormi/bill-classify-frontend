<script setup>
// RuleManageView — list + create/edit/delete classification rules.
// Live preview is exposed via a small panel at the top so the user can
// try out rule changes without leaving this page.
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRuleStore } from '@/billing/stores/rule'
import { useCategoryStore } from '@/billing/stores/category'
import RuleFormDialog from '@/billing/components/RuleFormDialog.vue'

const ruleStore = useRuleStore()
const catStore = useCategoryStore()
const { rules } = storeToRefs(ruleStore)
const { categories } = storeToRefs(catStore)

ruleStore.fetch()
catStore.fetch()

const dialogOpen = ref(false)
const dialogInitial = ref(null)

function openCreate() { dialogInitial.value = null; dialogOpen.value = true }
function openEdit(r) { dialogInitial.value = r; dialogOpen.value = true }

async function submitDialog(payload) {
  try {
    if (dialogInitial.value) {
      await ruleStore.update(dialogInitial.value.id, payload)
    } else {
      await ruleStore.create(payload)
    }
    dialogOpen.value = false
  } catch (err) {
    alert(err.response?.data?.error?.message || '操作失败')
  }
}

async function removeRule(r) {
  if (!confirm(`删除规则「${r.match_type}:${r.match_value}」?`)) return
  try { await ruleStore.remove(r.id) }
  catch (err) { alert(err.response?.data?.error?.message || '删除失败') }
}

function categoryName(id) {
  const c = categories.value.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}

function matchTypeLabel(t) {
  return { merchant_exact: '商户', note_keyword: '备注', amount_range: '金额区间' }[t] || t
}

// Live preview panel
const previewInput = ref({ merchant: '', note: '', amount: 0 })
const previewResult = ref(null)
async function runPreview() {
  try { previewResult.value = await ruleStore.preview(previewInput.value) }
  catch (err) { previewResult.value = { error: err.response?.data?.error?.message || '预览失败' } }
}
</script>

<template>
  <main class="manage-view">
    <header>
      <h1>自动分类规则</h1>
      <button @click="openCreate">+ 新建规则</button>
    </header>

    <section class="preview-panel">
      <h3>实时预览</h3>
      <div class="row">
        <input v-model="previewInput.merchant" placeholder="商户" />
        <input v-model="previewInput.note" placeholder="备注" />
        <input v-model.number="previewInput.amount" type="number" placeholder="金额" step="0.01" />
        <button @click="runPreview">预览</button>
      </div>
      <p v-if="previewResult" class="result">
        <template v-if="previewResult.error">❌ {{ previewResult.error }}</template>
        <template v-else>
          ✓ 匹配分类:<strong>{{ categoryName(previewResult.category_id) }}</strong>
          <span v-if="previewResult.rule_id">(#{{ previewResult.rule_id }})</span>
        </template>
      </p>
    </section>

    <table v-if="rules.length">
      <thead>
        <tr><th>类型</th><th>匹配值</th><th>分类</th><th>优先级</th><th>启用</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="r in rules" :key="r.id">
          <td>{{ matchTypeLabel(r.match_type) }}</td>
          <td><code>{{ r.match_value }}</code></td>
          <td>{{ categoryName(r.category_id) }}</td>
          <td>{{ r.priority }}</td>
          <td>{{ r.enabled ? '✓' : '—' }}</td>
          <td>
            <button @click="openEdit(r)">编辑</button>
            <button @click="removeRule(r)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">暂无规则。</p>

    <RuleFormDialog
      :open="dialogOpen"
      :initial="dialogInitial"
      @cancel="dialogOpen = false"
      @submit="submitDialog"
    />
  </main>
</template>

<style scoped>
.manage-view { max-width: 900px; margin: 2rem auto; }
header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
header h1 { flex: 1; margin: 0; }
.preview-panel { background: #f7f7f7; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
.preview-panel .row { display: flex; gap: 0.5rem; }
.preview-panel input { flex: 1; padding: 0.4rem; }
.result { margin: 0.5rem 0 0; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
td button { margin-right: 0.25rem; }
code { background: #f4f4f4; padding: 0 0.25rem; }
.empty { color: #888; }
</style>