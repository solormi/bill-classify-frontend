<script setup>
import { ref } from 'vue'
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

const previewInput = ref({ merchant: '', note: '', amount: 0 })
const previewResult = ref(null)
async function runPreview() {
  try { previewResult.value = await ruleStore.preview(previewInput.value) }
  catch (err) { previewResult.value = { error: err.response?.data?.error?.message || '预览失败' } }
}
</script>

<template>
  <main class="page page-wide">
    <div class="page-header">
      <div>
        <h1>自动分类规则</h1>
        <p>命中规则的账单在录入时自动套用分类。优先级数字越大越优先。</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="openCreate">+ 新建规则</button>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">实时预览</h3>
      <p style="margin: 0 0 0.75em; color: var(--color-text-muted); font-size: var(--text-sm);">
        填一个账单字段,看系统会套哪个分类。
      </p>
      <div style="display: flex; gap: var(--space-2);">
        <input v-model="previewInput.merchant" placeholder="商户" />
        <input v-model="previewInput.note" placeholder="备注" />
        <input v-model.number="previewInput.amount" type="number" placeholder="金额" step="0.01" />
        <button class="btn btn-primary" @click="runPreview">预览</button>
      </div>
      <div v-if="previewResult" style="margin-top: 0.75em;">
        <p v-if="previewResult.error" class="error" style="margin: 0; color: var(--color-danger);">❌ {{ previewResult.error }}</p>
        <p v-else style="margin: 0;">
          ✓ 匹配分类:<strong>{{ categoryName(previewResult.category_id) }}</strong>
          <span v-if="previewResult.rule_id" class="badge badge-brand" style="margin-left: 0.5em;">规则 #{{ previewResult.rule_id }}</span>
        </p>
      </div>
    </div>

    <div v-if="!rules.length" class="card empty">
      <h3>暂无规则</h3>
      <p>点右上角「新建规则」创建第一条。</p>
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>类型</th>
          <th>匹配值</th>
          <th>分类</th>
          <th class="num">优先级</th>
          <th>启用</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rules" :key="r.id">
          <td><span class="badge badge-brand">{{ matchTypeLabel(r.match_type) }}</span></td>
          <td><code>{{ r.match_value }}</code></td>
          <td>{{ categoryName(r.category_id) }}</td>
          <td class="num">{{ r.priority }}</td>
          <td>
            <span v-if="r.enabled" class="badge badge-success">✓</span>
            <span v-else class="badge badge-muted">—</span>
          </td>
          <td>
            <button class="btn btn-sm btn-ghost" @click="openEdit(r)">编辑</button>
            <button class="btn btn-sm btn-danger" @click="removeRule(r)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <RuleFormDialog
      :open="dialogOpen"
      :initial="dialogInitial"
      @cancel="dialogOpen = false"
      @submit="submitDialog"
    />
  </main>
</template>