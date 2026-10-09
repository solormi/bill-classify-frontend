<template>
  <main class="placeholder">
    <h1>记账 MVP</h1>
    <p>当前 change: <code>initialize-billing-project</code></p>
    <nav class="links">
      <router-link to="/billing/bills">账单</router-link>
      <router-link to="/billing/categories">分类管理</router-link>
      <router-link to="/billing/rules">自动分类规则</router-link>
    </nav>
  </main>
</template>

<script setup>
// 无业务逻辑,仅作为导航入口
</script>

<style scoped>
.placeholder { padding: 2rem; max-width: 720px; margin: 0 auto; }
h1 { font-size: 1.8rem; margin-bottom: 1rem; }
code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; }
.links { margin-top: 1rem; display: flex; gap: 1rem; }
.links a { color: #06c; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #06c; border-radius: 4px; }
.links a:hover { background: #06c; color: white; }
</style>