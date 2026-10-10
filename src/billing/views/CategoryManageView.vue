<script setup>
// CategoryManageView — list + create/edit/delete user-owned categories.
// System presets are visible but not editable / deletable.
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)
catStore.fetch()

const topLevel = computed(() => categories.value.filter((c) => c.parent_id == null))
const childrenOf = (id) => categories.value.filter((c) => c.parent_id === id)

const dialog = ref({ open: false, mode: 'create', payload: { name: '', icon: '', parent_id: null }, error: '' })

function openCreate() {
  dialog.value = { open: true, mode: 'create', payload: { name: '', icon: '', parent_id: null }, error: '' }
}
function openEdit(c) {
  dialog.value = { open: true, mode: 'edit', payload: { id: c.id, name: c.name, icon: c.icon || '', parent_id: c.parent_id }, error: '' }
}
function closeDialog() { dialog.value.open = false }

async function submitDialog() {
  dialog.value.error = ''
  try {
    if (dialog.value.mode === 'create') {
      await catStore.create(dialog.value.payload)
    } else {
      await catStore.update(dialog.value.payload.id, dialog.value.payload)
    }
    dialog.value.open = false
  } catch (err) {
    dialog.value.error = err.response?.data?.error?.message || '操作失败'
  }
}

async function removeCategory(c) {
  if (!confirm(`删除分类「${c.name}」?`)) return
  try { await catStore.remove(c.id) }
  catch (err) { alert(err.response?.data?.error?.message || '删除失败') }
}
</script>

<template>
  <main class="page page-wide">
    <div class="page-header">
      <div>
        <h1>分类管理</h1>
        <p>系统预设可见但不可编辑;自定义分类挂在一级分类下。</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="openCreate">+ 新建分类</button>
      </div>
    </div>

    <div v-if="categories.length === 0" class="card empty">
      <h3>暂无分类</h3>
      <p>点右上角「新建分类」创建第一个。</p>
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>名称</th>
          <th>图标</th>
          <th>层级</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="p in topLevel()" :key="p.id">
          <tr>
            <td><strong>{{ p.icon || '·' }} {{ p.name }}</strong></td>
            <td>{{ p.icon || '—' }}</td>
            <td><span class="badge badge-brand">一级</span> <span v-if="p.user_id == null" class="badge badge-muted">系统</span></td>
            <td>
              <button v-if="p.user_id != null" class="btn btn-sm btn-ghost" @click="openEdit(p)">编辑</button>
              <button v-if="p.user_id != null" class="btn btn-sm btn-danger" @click="removeCategory(p)">删除</button>
            </td>
          </tr>
          <tr v-for="c in childrenOf(p.id)" :key="c.id">
            <td style="padding-left: 2em;">↳ {{ c.icon || '·' }} {{ c.name }}</td>
            <td>{{ c.icon || '—' }}</td>
            <td><span class="badge badge-accent">二级</span></td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="openEdit(c)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="removeCategory(c)">删除</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="dialog.open" class="dialog-backdrop" @click.self="closeDialog">
      <div class="dialog">
        <h3>{{ dialog.mode === 'create' ? '新建分类' : '编辑分类' }}</h3>
        <div class="field" style="display: flex; flex-direction: column; gap: var(--space-1);">
          <label style="font-size: var(--text-sm); color: var(--color-text-soft);">名称</label>
          <input v-model="dialog.payload.name" type="text" maxlength="50" placeholder="如:餐饮" />
        </div>
        <div class="field" style="display: flex; flex-direction: column; gap: var(--space-1);">
          <label style="font-size: var(--text-sm); color: var(--color-text-soft);">图标(emoji 或文字)</label>
          <input v-model="dialog.payload.icon" type="text" maxlength="50" />
        </div>
        <div v-if="dialog.mode === 'create'" class="field" style="display: flex; flex-direction: column; gap: var(--space-1);">
          <label style="font-size: var(--text-sm); color: var(--color-text-soft);">上级分类(留空 = 一级)</label>
          <select v-model="dialog.payload.parent_id">
            <option :value="null">(一级)</option>
            <option v-for="c in topLevel().filter((x) => x.user_id != null || x.id !== dialog.payload.id)" :key="c.id" :value="c.id">
              {{ c.icon || '' }} {{ c.name }}
            </option>
          </select>
        </div>
        <p v-if="dialog.error" class="error" style="margin: 0; color: var(--color-danger); font-size: var(--text-sm); background: var(--color-danger-soft); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
          {{ dialog.error }}
        </p>
        <div class="dialog-actions">
          <button class="btn btn-ghost" @click="closeDialog">取消</button>
          <button class="btn btn-primary" :disabled="!dialog.payload.name.trim()" @click="submitDialog">
            {{ dialog.mode === 'create' ? '创建' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>