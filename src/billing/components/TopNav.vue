<script setup>
// TopNav — global header for authenticated views. Shows brand, primary nav,
// and a "logged in as X" badge + logout.
//
// Hidden on /login and /register (auth views have their own auth-card
// chrome — no need for the top bar cluttering the centered card).
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/billing/stores/auth'
import { useBillStore } from '@/billing/stores/bill'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const billStore = useBillStore()

const isAuthRoute = computed(() =>
  route.path === '/billing/login' || route.path === '/billing/register',
)

const navItems = [
  { to: '/billing', label: '账单', icon: '📒' },
  { to: '/billing/categories', label: '分类', icon: '🏷' },
  { to: '/billing/rules', label: '规则', icon: '⚙' },
  { to: '/billing/bills/recycle', label: '回收站', icon: '🗑' },
]

function isActive(to) {
  if (to === '/billing') return route.path === '/billing'
  return route.path.startsWith(to)
}

async function logout() {
  await auth.logout()
  billStore.bills = []
  billStore.recycle = []
  router.push('/billing/login')
}
</script>

<template>
  <header v-if="!isAuthRoute && auth.isAuthenticated" class="topnav">
    <router-link to="/billing" class="brand">
      <span class="brand-mark">¥</span>
      <span class="brand-name">账单分类</span>
    </router-link>

    <nav class="nav-links">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: isActive(item.to) }"
      >
        <span class="icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="user-area">
      <span v-if="auth.user" class="user-pill">
        <span class="user-nick">{{ auth.user.nickname || auth.user.email }}</span>
        <span v-if="auth.user.role === 'admin'" class="badge badge-brand">admin</span>
        <span v-else class="badge badge-muted">member</span>
      </span>
      <button class="btn btn-sm btn-ghost" @click="logout">退出</button>
    </div>
  </header>
</template>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: 0 var(--space-5);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
  font-size: var(--text-md);
}
.brand:hover { color: var(--color-text); text-decoration: none; }

.brand-mark {
  display: inline-flex;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
  color: white;
  font-weight: 700;
  font-size: 16px;
  align-items: center;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: var(--space-1);
  flex: 1;
}
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  height: 36px;
  border-radius: var(--radius);
  color: var(--color-text-soft);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
}
.nav-link:hover {
  background: var(--color-surface-alt);
  color: var(--color-text);
  text-decoration: none;
}
.nav-link.active {
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}
.nav-link .icon { font-size: 16px; }

.user-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.user-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface-alt);
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
}
.user-nick { font-weight: 500; color: var(--color-text); }
</style>