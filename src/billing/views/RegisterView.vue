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

// Belt-and-brace @change handlers for autofill defense.
function onEmailChange(e) { email.value = e.target.value }
function onPasswordChange(e) { password.value = e.target.value }
function onConfirmChange(e) { confirm.value = e.target.value }
function onNicknameChange(e) { nickname.value = e.target.value }

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
  <main class="auth-page">
    <div class="auth-card">
      <div class="brand">
        <div class="brand-mark">¥</div>
        <h1>注册</h1>
        <p style="margin: 4px 0 0; color: var(--color-text-muted); font-size: var(--text-sm);">
          创建你的第一个账号(自动获得 admin 权限)
        </p>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label for="reg-id">邮箱</label>
          <input id="reg-id" v-model="email" type="text" autocomplete="username" placeholder="user@example.com" required @change="onEmailChange" />
        </div>

        <div class="field">
          <label for="reg-pw">密码</label>
          <input id="reg-pw" v-model="password" type="password" autocomplete="new-password" placeholder="至少 8 位,含字母和数字" required @change="onPasswordChange" />
          <p class="hint">用于登录。强度:≥8 位 + 字母 + 数字</p>
        </div>

        <div class="field">
          <label for="reg-confirm">确认密码</label>
          <input id="reg-confirm" v-model="confirm" type="password" autocomplete="new-password" required @change="onConfirmChange" />
        </div>

        <div class="field">
          <label for="reg-nick">昵称(可选)</label>
          <input id="reg-nick" v-model="nickname" type="text" placeholder="留空则自动从邮箱生成" maxlength="50" @change="onNicknameChange" />
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="!formValid || submitting">
          {{ submitting ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="alt">
        已有账号?<router-link to="login">直接登录</router-link>
      </p>
    </div>
  </main>
</template>