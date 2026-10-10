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

const emailValid = computed(() => /.+@.+\..+/.test(email.value))
const passwordValid = computed(() => password.value.length >= 8)
const formValid = computed(() => emailValid.value && passwordValid.value)

// Vue v-model only listens to `input` events. Browser autofill / password
// managers (1Password, Bitwarden, Keychain) often populate the visible field
// but fire only `change` (not `input`) — leaving v-model's ref empty and
// the submit button stuck disabled. Belt-and-brace @change handler catches
// those cases. Manual typing still updates via v-model immediately.
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
    // Server returns {error:{code,message}}; surface the human message
    errorMessage.value = err.response?.data?.error?.message || '登录失败,请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-view">
    <h1>登录</h1>
    <form @submit.prevent="onSubmit">
      <label>
        邮箱
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            @change="onEmailChange"
          />
      </label>
      <label>
        密码
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          minlength="8"
          @change="onPasswordChange"
        />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="!formValid || submitting">
        {{ submitting ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="alt">
      没有账号?<router-link to="register">注册</router-link>
    </p>
  </main>
</template>

<style scoped>
.login-view { max-width: 360px; margin: 4rem auto; padding: 2rem; }
form label { display: block; margin-bottom: 1rem; }
input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
button { padding: 0.5rem 1rem; }
.error { color: var(--color-error, #d33); }
.alt { margin-top: 1rem; font-size: 0.9rem; }
</style>