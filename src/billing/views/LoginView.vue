<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/billing/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

// Identifier accepts either an email OR a nickname. Both go through the
// same backend lookup chain (FindByEmail → FindByNickname fallback).
const identifierValid = computed(() => {
  const v = email.value.trim()
  if (!v) return false
  if (/.+@.+\..+/.test(v)) return true
  return v.length >= 3
})
const passwordValid = computed(() => password.value.length >= 8)
const formValid = computed(() => identifierValid.value && passwordValid.value)

// Vue v-model only listens to `input` events. Browser autofill / password
// managers often populate the visible field but fire only `change` — leaving
// v-model's ref empty and the submit button stuck disabled. Belt-and-brace
// @change handler catches those cases.
function onEmailChange(e) {
  email.value = e.target.value
}
function onPasswordChange(e) {
  password.value = e.target.value
}

async function onSubmit() {
  if (!formValid.value || submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect && typeof route.query.redirect === 'string'
      ? route.query.redirect : '/billing'
    router.push(redirect)
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message || '登录失败,请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <div class="brand">
        <div class="brand-mark">¥</div>
        <h1>登录</h1>
        <p style="margin: 4px 0 0; color: var(--color-text-muted); font-size: var(--text-sm);">
          记账 MVP
        </p>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label for="login-id">邮箱 / 用户名</label>
          <input
            id="login-id"
            v-model="email"
            type="text"
            autocomplete="username"
            placeholder="user@example.com"
            required
            @change="onEmailChange"
          />
        </div>

        <div class="field">
          <label for="login-pw">密码</label>
          <input
            id="login-pw"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="至少 8 位"
            required
            @change="onPasswordChange"
          />
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="!formValid || submitting">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="alt">
        没有账号?<router-link to="register">立即注册</router-link>
      </p>
    </div>
  </main>
</template>