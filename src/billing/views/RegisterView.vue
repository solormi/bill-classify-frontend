<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/billing/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirm = ref('')
const nickname = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const emailValid = computed(() => /.+@.+\..+/.test(email.value))
const passwordValid = computed(() => password.value.length >= 8 && /[A-Za-z]/.test(password.value) && /[0-9]/.test(password.value))
const confirmValid = computed(() => confirm.value === password.value)
const formValid = computed(() => emailValid.value && passwordValid.value && confirmValid.value)

async function onSubmit() {
  if (!formValid.value || submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await auth.register(email.value, password.value, nickname.value)
    router.push('/billing')
  } catch (err) {
    const code = err.response?.data?.error?.code
    if (code === 'EMAIL_EXISTS') {
      errorMessage.value = '该邮箱已被注册'
    } else if (code === 'WEAK_PASSWORD') {
      errorMessage.value = '密码至少 8 位,且必须包含字母和数字'
    } else {
      errorMessage.value = err.response?.data?.error?.message || '注册失败,请重试'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="register-view">
    <h1>注册</h1>
    <form @submit.prevent="onSubmit">
      <label>
        邮箱
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <label>
        密码(≥8 位,含字母和数字)
        <input v-model="password" type="password" autocomplete="new-password" required />
      </label>
      <label>
        确认密码
        <input v-model="confirm" type="password" autocomplete="new-password" required />
      </label>
      <label>
        昵称(可选)
        <input v-model="nickname" type="text" maxlength="50" />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="!formValid || submitting">
        {{ submitting ? '注册中...' : '注册' }}
      </button>
    </form>
    <p class="alt">
      已有账号?<router-link to="/login">登录</router-link>
    </p>
  </main>
</template>

<style scoped>
.register-view { max-width: 360px; margin: 4rem auto; padding: 2rem; }
form label { display: block; margin-bottom: 1rem; }
input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
button { padding: 0.5rem 1rem; }
.error { color: var(--color-error, #d33); }
.alt { margin-top: 1rem; font-size: 0.9rem; }
</style>