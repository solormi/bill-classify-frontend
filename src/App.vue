<template>
  <TopNav v-if="auth.isAuthenticated" />
  <router-view />
</template>

<script setup>
// Global app shell: loads design tokens + base/components CSS once,
// renders the top nav for authenticated views, then the active route view.
import TopNav from '@/billing/components/TopNav.vue'
import { useAuthStore } from '@/billing/stores/auth'

import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/components.css'

const auth = useAuthStore()
</script>