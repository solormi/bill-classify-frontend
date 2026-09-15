<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <h2 class="login-title">登录</h2>

    <label class="field">
      <span class="label">用户名</span>
      <input
        v-model.trim="username"
        type="text"
        autocomplete="username"
        required
        :disabled="loading"
      />
    </label>

    <label class="field">
      <span class="label">密码</span>
      <input
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
        :disabled="loading"
      />
    </label>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <button type="submit" class="primary" :disabled="loading">
      {{ loading ? '登录中…' : '登录' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { redirectAfterLogin } from '../router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    redirectAfterLogin(router, route)
  } catch (e) {
    error.value = auth.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3, 12px);
  max-width: 360px;
  padding: var(--sp-4, 16px);
  border: 1px solid var(--c-border, #e5e7eb);
  border-radius: var(--r-md, 8px);
  background: var(--c-surface, #fafafa);
}
.login-title { margin: 0 0 var(--sp-2, 8px) 0; font-size: var(--fs-lg, 18px); }
.field { display: flex; flex-direction: column; gap: var(--sp-1, 4px); }
.label { font-size: var(--fs-sm, 14px); color: var(--c-text-muted, #6b7280); }
input {
  padding: var(--sp-2, 8px) var(--sp-3, 12px);
  border: 1px solid var(--c-border, #e5e7eb);
  border-radius: var(--r-sm, 4px);
  background: var(--c-bg, #ffffff);
  font: inherit;
}
input:focus { outline: 2px solid var(--c-accent, #3b82f6); outline-offset: 0; }
.primary {
  padding: var(--sp-2, 8px) var(--sp-3, 12px);
  background: var(--c-accent, #3b82f6);
  color: #fff;
  border: 0;
  border-radius: var(--r-sm, 4px);
  font: inherit;
  cursor: pointer;
}
.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: var(--c-error, #ef4444); margin: 0; font-size: var(--fs-sm, 14px); }
</style>