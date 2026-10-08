import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Vitest 1.2's vite-node serves modules over http://localhost:3000/@fs/...,
// so `new URL('../..', import.meta.url)` resolves to a non-file URL at
// module-evaluation time and breaks `fileURLToPath`. Using
// `fileURLToPath(import.meta.url)` directly + `path.resolve` avoids the bug
// while staying ESM-safe (no `__dirname`).
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const REQUIRED_DIRS = [
  'src/billing/views',
  'src/billing/components',
  'src/billing/stores',
  'src/billing/api',
  'src/billing/router',
  'src/billing/composables',
  'src/shared',
  'src/api',
  'src/router',
  'src/stores',
]

const REQUIRED_FILES = [
  'src/billing/README.md',
  'src/shared/README.md',
  'src/billing/views/PlaceholderView.vue',
  'src/billing/router/index.js',
  'src/router/index.js',
  'src/api/http.js',
  'src/App.vue',
  'src/main.js',
]

describe('仓目录结构符合 design.md 约定', () => {
  it.each(REQUIRED_DIRS)('目录 %s 存在', (dir) => {
    expect(existsSync(path.join(root, dir))).toBe(true)
  })

  it.each(REQUIRED_FILES)('文件 %s 存在', (file) => {
    expect(existsSync(path.join(root, file))).toBe(true)
  })
})
