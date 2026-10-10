<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/billing/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
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
          <div class="password-field">
            <input
              id="login-pw"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="至少 8 位"
              required
              @change="onPasswordChange"
            />
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                  d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.7 10.7 0 0 1 12 5c5.4 0 9.3 4.5 10.5 6.6a13 13 0 0 1-2.4 3M6.6 6.6C4.1 8.3 2.5 10.7 1.5 11.6 2.7 13.7 6.6 18.2 12 18.2c1.5 0 2.9-.3 4.1-.8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                  d="M1.5 11.6C2.7 9.5 6.6 5 12 5s9.3 4.5 10.5 6.6C21.3 13.7 17.4 18.2 12 18.2S2.7 13.7 1.5 11.6z" />
                <circle cx="12" cy="11.6" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </button>
          </div>
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

<style scoped>
.password-field {
  position: relative;
  display: flex;
  align-items: center;
}
.password-field input {
  width: 100%;
  padding-right: 44px;
}
.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  padding: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: color 0.15s ease, background-color 0.15s ease;
}
.password-toggle:hover,
.password-toggle:focus-visible {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
  outline: none;
}
.password-toggle[aria-pressed="true"] {
  color: var(--color-primary);
}
</style>