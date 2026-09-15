<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  padding: var(--sp-6, 24px) var(--sp-4, 16px);
}
</style>