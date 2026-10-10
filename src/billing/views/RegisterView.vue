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
const showPassword = ref(false)
const showConfirm = ref(false)
const errorMessage = ref('')
const submitting = ref(false)

// Track whether the user has touched each field so we don't shout at them
// before they've had a chance to type.
const emailTouched = ref(false)
const passwordTouched = ref(false)
const confirmTouched = ref(false)

const emailValid = computed(() => /.+@.+\..+/.test(email.value))
const passwordValid = computed(() => password.value.length >= 8 && /[A-Za-z]/.test(password.value) && /[0-9]/.test(password.value))
const confirmValid = computed(() => confirm.value === password.value)
const formValid = computed(() => emailValid.value && passwordValid.value && confirmValid.value)

// Inline validation messages — only shown after the user has typed and left
// the field, so the form stays clean on first paint.
const emailHint = computed(() => {
  if (!emailTouched.value) return ''
  if (!email.value) return '请输入邮箱'
  if (!emailValid.value) return '邮箱格式不正确'
  return ''
})
const passwordHint = computed(() => {
  if (!passwordTouched.value) return ''
  if (!password.value) return '请输入密码'
  if (password.value.length < 8) return `密码至少 8 位(当前 ${password.value.length})`
  if (!/[A-Za-z]/.test(password.value)) return '密码需要包含字母'
  if (!/[0-9]/.test(password.value)) return '密码需要包含数字'
  return ''
})
const confirmHint = computed(() => {
  if (!confirmTouched.value) return ''
  if (!confirm.value) return '请再次输入密码'
  if (confirm.value !== password.value) return '两次密码不一致'
  return ''
})

function onEmailBlur() { emailTouched.value = true }
function onPasswordBlur() { passwordTouched.value = true }
function onConfirmBlur() { confirmTouched.value = true }

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
          <input id="reg-id" v-model="email" type="text" autocomplete="username" placeholder="user@example.com" required @change="onEmailChange" @blur="onEmailBlur" />
          <p v-if="emailHint" class="error-inline">{{ emailHint }}</p>
        </div>

        <div class="field">
          <label for="reg-pw">密码</label>
          <div class="password-field">
            <input id="reg-pw" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="至少 8 位,含字母和数字" required @change="onPasswordChange" @blur="onPasswordBlur" />
            <button type="button" class="password-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.7 10.7 0 0 1 12 5c5.4 0 9.3 4.5 10.5 6.6a13 13 0 0 1-2.4 3M6.6 6.6C4.1 8.3 2.5 10.7 1.5 11.6 2.7 13.7 6.6 18.2 12 18.2c1.5 0 2.9-.3 4.1-.8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M1.5 11.6C2.7 9.5 6.6 5 12 5s9.3 4.5 10.5 6.6C21.3 13.7 17.4 18.2 12 18.2S2.7 13.7 1.5 11.6z" />
                <circle cx="12" cy="11.6" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </button>
          </div>
          <p v-if="passwordHint" class="error-inline">{{ passwordHint }}</p>
          <p v-else class="hint">用于登录。强度:≥8 位 + 字母 + 数字</p>
        </div>

        <div class="field">
          <label for="reg-confirm">确认密码</label>
          <div class="password-field">
            <input id="reg-confirm" v-model="confirm" :type="showConfirm ? 'text' : 'password'" autocomplete="new-password" required @change="onConfirmChange" @blur="onConfirmBlur" />
            <button type="button" class="password-toggle" :aria-label="showConfirm ? '隐藏密码' : '显示密码'" :aria-pressed="showConfirm" @click="showConfirm = !showConfirm">
              <svg v-if="showConfirm" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.7 10.7 0 0 1 12 5c5.4 0 9.3 4.5 10.5 6.6a13 13 0 0 1-2.4 3M6.6 6.6C4.1 8.3 2.5 10.7 1.5 11.6 2.7 13.7 6.6 18.2 12 18.2c1.5 0 2.9-.3 4.1-.8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M1.5 11.6C2.7 9.5 6.6 5 12 5s9.3 4.5 10.5 6.6C21.3 13.7 17.4 18.2 12 18.2S2.7 13.7 1.5 11.6z" />
                <circle cx="12" cy="11.6" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </button>
          </div>
          <p v-if="confirmHint" class="error-inline">{{ confirmHint }}</p>
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

<style scoped>
.error-inline {
  margin: 6px 0 0;
  color: var(--color-danger);
  font-size: var(--text-sm);
}
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