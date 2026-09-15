import { client } from './client'

// 响应结构(与 backend handler.AuthHandler.Login 一致)
// { token: string, user: { id, username, created_at } }

export async function login(username, password) {
  const { data } = await client.post('/auth/login', { username, password })
  return data
}

export async function logout() {
  await client.post('/auth/logout')
}

export async function me() {
  const { data } = await client.get('/auth/me')
  return data
}