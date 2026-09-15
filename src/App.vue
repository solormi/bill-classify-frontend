<template>
  <div class="app">
    <header class="topbar">
      <h1>账单分类</h1>
      <nav class="topnav">
        <template v-if="auth.isAuthenticated">
          <router-link to="/">列表</router-link>
          <router-link to="/bills/upload">上传</router-link>
          <router-link to="/bills/new">新建</router-link>
          <span class="user">{{ auth.user?.username }}</span>
          <button class="logout-btn" @click="onLogout">登出</button>
        </template>
        <template v-else>
          <router-link to="/login">登录</router-link>
        </template>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout() {
  if (!window.confirm('确认登出?')) return
  await auth.logout()
  router.push({ name: 'login' })
}
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
.topnav {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  margin-left: auto;
}
.topnav a {
  color: var(--c-text);
  text-decoration: none;
}
.topnav a.router-link-active {
  color: var(--c-accent);
  font-weight: 600;
}
.user { color: var(--c-text-muted); font-size: var(--fs-sm); }
.logout-btn {
  padding: var(--sp-1) var(--sp-3);
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
  color: var(--c-text-muted);
  cursor: pointer;
  font: inherit;
}
.logout-btn:hover { color: var(--c-text); border-color: var(--c-text-muted); }
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