<script setup>
// CategoryTree — read-only nested view for the management page.
// Top-level categories first, then their children inline.
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const props = defineProps({
  showSystem: { type: Boolean, default: true },
})
const emit = defineEmits(['edit', 'remove'])

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)
onMounted(() => catStore.ensureLoaded())

const tree = computed(() => {
  const tops = categories.value.filter((c) => c.parent_id == null)
  return tops.map((p) => ({
    ...p,
    children: categories.value.filter((c) => c.parent_id === p.id),
  }))
})
</script>

<template>
  <ul class="category-tree">
    <li v-for="p in tree" :key="p.id" :class="{ system: p.user_id == null }">
      <div class="row">
        <span class="label">{{ p.icon || '·' }} {{ p.name }}</span>
        <span v-if="p.user_id == null && showSystem" class="badge">系统</span>
        <span class="actions">
          <button v-if="p.user_id != null" @click="emit('edit', p)">编辑</button>
          <button v-if="p.user_id != null" @click="emit('remove', p)">删除</button>
        </span>
      </div>
      <ul v-if="p.children.length">
        <li v-for="c in p.children" :key="c.id">
          <div class="row">
            <span class="label">　↳ {{ c.icon || '·' }} {{ c.name }}</span>
            <span class="actions">
              <button @click="emit('edit', c)">编辑</button>
              <button @click="emit('remove', c)">删除</button>
            </span>
          </div>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.category-tree { list-style: none; padding: 0; }
.category-tree li { padding: 0.25rem 0; }
.row { display: flex; gap: 0.5rem; align-items: center; }
.label { flex: 1; }
.badge { font-size: 0.75rem; color: #888; }
.actions button { margin-left: 0.25rem; }
</style>