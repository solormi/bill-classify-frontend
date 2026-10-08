import { describe, it, expect, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import http from '@/api/http'

let mock

afterEach(() => {
  mock?.restore()
})

describe('http.js', () => {
  it('baseURL 为 /api/v1', () => {
    expect(http.defaults.baseURL).toBe('/api/v1')
  })

  it('timeout 为 10000ms', () => {
    expect(http.defaults.timeout).toBe(10000)
  })

  it('相对路径请求被拼到 /api/v1 前缀下', async () => {
    mock = new MockAdapter(http)
    mock.onGet('/health').reply(200, { status: 'ok' })

    const res = await http.get('/health')

    expect(res.data).toEqual({ status: 'ok' })
    expect(mock.history.get[0].url).toBe('/health')
  })
})