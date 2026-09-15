<template>
  <div class="app">
    <header class="topbar">
      <h1>账单分类</h1>
      <nav>
        <router-link to="/">列表</router-link>
        <router-link to="/bills/upload">上传</router-link>
        <router-link to="/bills/new">新建</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
.app { font-family: system-ui, -apple-system, "PingFang SC", sans-serif; }
.topbar { display: flex; gap: 24px; align-items: center; padding: 12px 24px; border-bottom: 1px solid #eee; }
.topbar h1 { font-size: 18px; margin: 0; }
.topbar nav a { margin-right: 12px; color: #2c3e50; text-decoration: none; }
.topbar nav a.router-link-active { color: #42b883; font-weight: 600; }
main { padding: 16px 24px; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 6px 10px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
th { background: #fafafa; }
button { padding: 4px 10px; cursor: pointer; }
.error { color: #d03050; padding: 8px 0; }
.muted { color: #888; }
</style>