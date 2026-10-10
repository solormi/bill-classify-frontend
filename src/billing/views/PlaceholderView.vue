<script setup>
// Placeholder home — welcomes the user with the current change context and
// hands off to the real views via TopNav. Acts as the index for /billing.
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/billing/stores/auth'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
</script>

<template>
  <main class="page">
    <div class="page-header">
      <div>
        <h1>记账 MVP</h1>
        <p>欢迎回来,{{ user?.nickname || user?.email }}。从顶部导航选择模块开始。</p>
      </div>
      <div class="actions">
        <router-link to="/billing/bills/new" class="btn btn-primary">记一笔</router-link>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">当前已上线</h3>
      <ul style="margin: 0; padding-left: 1.2em; color: var(--color-text-soft);">
        <li><strong>骨架</strong> · change 1 — Gin + GORM + 5 表</li>
        <li><strong>登录 / 注册</strong> · change 2 — JWT 双 token + bcrypt</li>
        <li><strong>分类 + 规则</strong> · change 3 — 8 个预设 + 自动匹配</li>
        <li><strong>账单 CRUD</strong> · change 4 — 列表 / 录入 / 软删 / 回收站</li>
      </ul>
      <p style="margin: 0.75em 0 0; color: var(--color-text-muted); font-size: var(--text-sm);">
        当前 change: <code>initialize-billing-project</code>
      </p>
    </div>
  </main>
</template>