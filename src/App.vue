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
.app {
  font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
  color: var(--c-text);
}
.topbar {
  display: flex;
  gap: var(--sp-6);
  align-items: center;
  padding: var(--sp-3) var(--sp-6);
  border-bottom: 1px solid var(--c-border);
}
.topbar h1 {
  font-size: var(--fs-lg);
  margin: 0;
}
.topbar nav a {
  margin-right: var(--sp-3);
  color: var(--c-text);
  text-decoration: none;
}
.topbar nav a.router-link-active {
  color: var(--c-accent);
  font-weight: 600;
}
main {
  padding: var(--sp-4) var(--sp-6);
}
.error {
  color: var(--c-error);
  padding: var(--sp-2) 0;
}
.muted {
  color: var(--c-muted);
}
</style>