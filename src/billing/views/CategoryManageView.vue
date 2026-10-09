<script setup>
// CategoryManageView — list + create/edit/delete user-owned categories.
// System presets are visible but not editable / deletable.
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)
catStore.fetch()

const dialog = ref({ open: false, mode: 'create', payload: null, error: '' })

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

const topLevel = () => categories.value.filter((c) => c.parent_id == null)
const childrenOf = (id) => categories.value.filter((c) => c.parent_id === id)
</script>

<template>
  <main class="manage-view">
    <header>
      <h1>分类管理</h1>
      <button @click="openCreate">+ 新建分类</button>
    </header>

    <div v-if="categories.length === 0" class="empty">
      暂无分类。点右上角新建一个。
    </div>

    <ul v-else class="cat-list">
      <li v-for="p in topLevel()" :key="p.id" :class="{ system: p.user_id == null }">
        <div class="row">
          <span class="label">{{ p.icon || '·' }} {{ p.name }}</span>
          <span v-if="p.user_id == null" class="badge">系统</span>
          <span class="actions">
            <button v-if="p.user_id != null" @click="openEdit(p)">编辑</button>
            <button v-if="p.user_id != null" @click="removeCategory(p)">删除</button>
          </span>
        </div>
        <ul v-if="childrenOf(p.id).length">
          <li v-for="c in childrenOf(p.id)" :key="c.id">
            <div class="row">
              <span class="label">　↳ {{ c.icon || '·' }} {{ c.name }}</span>
              <span class="actions">
                <button @click="openEdit(c)">编辑</button>
                <button @click="removeCategory(c)">删除</button>
              </span>
            </div>
          </li>
        </ul>
      </li>
    </ul>

    <div v-if="dialog.open" class="dialog-backdrop" @click.self="closeDialog">
      <div class="dialog">
        <h2>{{ dialog.mode === 'create' ? '新建分类' : '编辑分类' }}</h2>
        <label>
          名称
          <input v-model="dialog.payload.name" type="text" maxlength="50" />
        </label>
        <label>
          图标(emoji 或文字)
          <input v-model="dialog.payload.icon" type="text" maxlength="50" />
        </label>
        <label v-if="dialog.mode === 'create'">
          上级分类(留空 = 一级)
          <select v-model="dialog.payload.parent_id">
            <option :value="null">(一级)</option>
            <option v-for="c in topLevel().filter((x) => x.user_id != null || x.id !== dialog.payload.id)" :key="c.id" :value="c.id">
              {{ c.icon || '' }} {{ c.name }}
            </option>
          </select>
        </label>
        <p v-if="dialog.error" class="error">{{ dialog.error }}</p>
        <div class="actions">
          <button @click="closeDialog">取消</button>
          <button :disabled="!dialog.payload.name.trim()" @click="submitDialog">
            {{ dialog.mode === 'create' ? '创建' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.manage-view { max-width: 720px; margin: 2rem auto; }
header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
header h1 { flex: 1; margin: 0; }
.empty { color: #888; padding: 1rem 0; }
.cat-list { list-style: none; padding: 0; }
.cat-list li { padding: 0.25rem 0; }
.row { display: flex; gap: 0.5rem; align-items: center; }
.label { flex: 1; }
.badge { font-size: 0.75rem; color: #888; }
.actions button { margin-left: 0.25rem; }
.system .label { color: #888; }
.dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.dialog { background: white; padding: 1.5rem; border-radius: 8px; width: 400px; }
.dialog label { display: block; margin: 0.5rem 0; }
.dialog input, .dialog select { width: 100%; padding: 0.4rem; margin-top: 0.25rem; box-sizing: border-box; }
.dialog .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.error { color: #d33; }
</style>