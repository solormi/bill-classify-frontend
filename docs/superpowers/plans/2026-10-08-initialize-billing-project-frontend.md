# 记账前端骨架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在已被清空的 `bill-classify-frontend/` 仓中重建 Vue 3 工程骨架,使 `npm run dev` 可启动、`/billing` 显示"记账 MVP"占位页、目录结构符合 design.md 约定,且不写任何业务逻辑。

**Architecture:** 单页应用,`src/main.js` 挂载 `App.vue`(仅含 `<router-view>`),总路由 `src/router/index.js` 注册 `/` → `/billing` 重定向并挂载 `src/billing/router/index.js` 子路由。业务代码全部隔离在 `src/billing/`,通用代码在 `src/api/`、`src/stores/`、`src/shared/`。测试用 Vitest + @vue/test-utils + jsdom,HTTP 层用 axios-mock-adapter 验证。

**Tech Stack:** Vue 3.4 / Vite 5 / Vue Router 4 / Pinia 2 / axios 1.6;Vitest 1.2 + @vue/test-utils 2.4 + jsdom 23 + axios-mock-adapter

**Spec:**
- `../../todo-specs/openspec/changes/initialize-billing-project/design/billing-frontend.md`(前端设计,含全部代码样例)
- `../../todo-specs/openspec/changes/initialize-billing-project/design.md`(仓目录总览 + 双业务隔离约定)
- `../../todo-specs/openspec/changes/initialize-billing-project/tasks/billing-frontend-sadmi.md`(12 条 `[frontend]` 任务清单)
- `../../todo-specs/openspec/changes/initialize-billing-project/tasks.md`(验收标准)

## Global Constraints

- 工作目录:`/Users/jump/code/openspec-store/bill-classify-frontend`(git 分支 `main`,工作区干净)
- 提交信息遵循 Conventional Commits;每个任务末尾提交一次
- **本仓 `package.json` 没有 `lint` script**,尽管 `AGENTS.md` 要求 commit 前跑 `npm run lint`。提交门禁只跑 `npm test`。(已知不一致,不在本 change 范围)
- 路由设计(来自 design/billing-frontend.md):`/` → 重定向 `/billing`;`/billing` → PlaceholderView
- **已知规格冲突,本计划按 tasks 文件执行**:`design/billing-frontend.md` 的"路由设计"表格额外列了 `/billing/placeholder`,但同文件给出的 `src/billing/router/index.js` 代码样例和 tasks 第 14 行都只含 `path: ''`。**本计划只实现 `path: ''`**,`/billing/placeholder` 不加。理由:tasks 文件是执行权威,且 YAGNI。
- `src/api/http.js` 与 `src/billing/api/` 是**两个不同目录**:前者是通用 axios 实例(本 change 建 `http.js`),后者是记账业务接口封装目录(本 change 留空,后续 change 用)。README 中必须写清这个区别,否则后续开发者会建重复实例。
- 空目录必须放 `.gitkeep` 才能提交进 git
- 本 change **不装 Pinia 到 main.js**:`src/stores/` 与 `src/billing/stores/` 本 change 留空(Pinia 已是依赖,后续 change 首次建 store 时再 `app.use(createPinia())`)

## Review Focus

以下 5 个输入/失败模式由 spec 隐含但 spec 本身沉默,是最可能咬人的地方。已在下方各任务的步骤中分别加了对应测试。

1. **直接深链访问 / 刷新 `/billing`** — `createWebHistory` 在 vite dev 下刷新会请求服务器上的 `/billing` 路径,若没有 SPA fallback 会 404。合理预期:页面正常渲染。→ Task 2 测试
2. **未知路由(如 `/nonexistent`)** — vue-router 无 catch-all 时渲染空白页。合理预期:至少不崩溃;空白可接受但需知悉。→ Task 2 测试
3. **后端未启动时 `/api` 代理行为** — `localhost:8080` 不在时,vite proxy 会返回 ECONNREFUSED。合理预期:请求快速失败,前端不白屏、不挂起。→ Task 5 手工验证
4. **`.env` 的 `VITE_API_BASE_URL` 与 `http.js` 硬编码 `/api/v1` 不一致** — 仓里已有 `.env.example`(`VITE_API_BASE_URL=/api/v1`、`VITE_USE_MOCK=1`),但 design 规定 `http.js` 硬编码。后续 change 若改用 env 会踩坑。→ Task 3 测试中固定 `baseURL` 契约
5. **两个 api 目录的归属困惑** — 后续开发者把接口封装放错目录,导致出现第二个 axios 实例、baseURL 漂移。→ Task 4 README 内容 + 结构测试

---

### Task 1: 测试基线与应用引导骨架

建立能跑测试的环境和空壳应用。本任务不碰 billing 业务目录。

**Files:**
- Create: `src/test/setup.js`
- Create: `src/main.js`
- Create: `src/App.vue`
- Modify: `vite.config.js`(新增 `resolve.alias`)

**Interfaces:**
- Consumes: 无(首个任务)
- Produces:
  - `src/router/index.js` 的 default export — 后续 Task 2 创建,`main.js` 约定以 `import router from '@/router'` 消费
  - vite 别名 `@` → `<repo>/src`,后续所有任务用 `@/` 做 src 内绝对导入

- [ ] **Step 1: 让测试环境可运行(`src/test/setup.js`)**

当前 `vite.config.js` 的 `setupFiles: ['./src/test/setup.js']` 指向一个不存在的文件 —— `npm test` 现在就因此报错。先补上,否则后续所有测试都是因为环境坏掉而失败(红色原因错误)。

创建 `src/test/setup.js`,内容为标准 Vue 测试清理,无业务逻辑:

```js
import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'

enableAutoUnmount(afterEach)
```

- [ ] **Step 2: 在 `vite.config.js` 中加 `@` 别名**

在 `defineConfig({...})` 内新增 `resolve` 字段(与 `plugins` 同级)。别名必须与 design/billing-frontend.md 中 `import billingRoutes from '@/billing/router'` 的写法一致 —— 没有它,design 给的总路由代码无法运行。

`package.json` 声明了 `"type": "module"`,故 `__dirname` 不可用,用 ESM 写法:

```js
import { fileURLToPath, URL } from 'node:url'

// ...defineConfig 内,与 plugins 同级:
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
},
```

- [ ] **Step 3: 写失败测试 — App 只渲染 router-view 出口**

创建 `tests/shared/app-bootstrap.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('只渲染一个 router-view 出口,不含业务内容', () => {
    const wrapper = mount(App, {
      global: { stubs: { RouterView: true } },
    })
    expect(wrapper.html()).toContain('router-view')
  })
})
```

断言 `html()` 含 `router-view` 而非组件名 —— VTU 把 stub 渲染成 `<router-view-stub>`,组件名在 stub 后并不稳定,断言渲染产物更可靠。

- [ ] **Step 4: 运行测试确认失败**

Run: `npm test`
Expected: FAIL — 找不到 `@/App.vue`(文件尚未创建)。这个失败必须来自"缺 App.vue"而非环境问题,否则说明 Step 1-2 没生效。

- [ ] **Step 5: 创建 `src/App.vue`**

```vue
<template>
  <router-view />
</template>

<script setup>
// 仅提供路由出口;业务页面由 src/router/index.js 挂载
</script>
```

- [ ] **Step 6: 创建 `src/main.js`**

挂载应用并接入总路由。注意 Task 2 尚未创建 `src/router/index.js`,本步骤后 `main.js` 的 import 暂时悬空 —— 因此在 Task 2 完成前不要运行 `npm run dev` 做验证,只跑 `npm test`(测试不经过 `main.js`)。

```js
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 7: 运行测试确认通过**

Run: `npm test`
Expected: PASS — 1 test passed(`App.vue` 渲染 router-view 出口)。

- [ ] **Step 8: 提交**

```bash
git add src/test/setup.js src/main.js src/App.vue vite.config.js tests/shared/app-bootstrap.spec.js
git commit -m "chore(frontend): 重建应用引导骨架与 Vitest 基线"
```

---

### Task 2: billing 占位页与路由

**Files:**
- Create: `src/billing/views/PlaceholderView.vue`
- Create: `src/billing/router/index.js`
- Create: `src/router/index.js`
- Test: `tests/billing/placeholder-view.spec.js`
- Test: `tests/billing/billing-router.spec.js`

**Interfaces:**
- Consumes: `@` 别名(Task 1);`App.vue` 的 `<router-view>` 出口(Task 1)
- Produces:
  - `src/billing/router/index.js` default export — 路由配置数组 `Array<RouteRecordRaw>`,当前仅 `{ path: '', component: () => import('../views/PlaceholderView.vue') }`
  - `src/router/index.js` default export — vue-router 实例,被 Task 1 的 `main.js` 以 `import router from '@/router'` 消费

- [ ] **Step 1: 写失败测试 — 占位页文案**

创建 `tests/billing/placeholder-view.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlaceholderView from '@/billing/views/PlaceholderView.vue'

describe('PlaceholderView.vue', () => {
  it('显示"记账 MVP"标题', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('记账 MVP')
  })

  it('显示骨架就绪说明', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('项目骨架已就绪')
  })

  it('显示当前 change 名 initialize-billing-project', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('initialize-billing-project')
  })
})
```

- [ ] **Step 2: 写失败测试 — 路由重定向与深链**

创建 `tests/billing/billing-router.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/billing' },
      { path: '/billing', children: billingRoutes },
    ],
  })
}

describe('总路由', () => {
  it('/ 重定向到 /billing', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing')
  })

  it('/billing 直接深链可解析(模拟刷新进入)', () => {
    const router = makeRouter()
    expect(router.resolve('/billing').path).toBe('/billing')
  })

  it('/billing 解析到父路由 + 空路径子路由(2 层 matched)', () => {
    const router = makeRouter()
    const resolved = router.resolve('/billing')
    expect(resolved.matched.length).toBe(2)
    expect(resolved.path).toBe('/billing')
  })

  it('billing 子路由配置只含一个空路径条目', () => {
    expect(billingRoutes).toHaveLength(1)
    expect(billingRoutes[0].path).toBe('')
  })

  it('未知路由不崩溃,但也不匹配任何记录(当前行为)', async () => {
    const router = makeRouter()
    await router.push('/nonexistent')
    expect(router.currentRoute.value.path).toBe('/nonexistent')
    expect(router.currentRoute.value.matched.length).toBe(0)
  })
})
```

第 4 个测试对应 Review Focus 第 2 条:钉住"无 catch-all 时未知路由至少不崩溃"这一已知行为,避免后续 change 静默改变它。

- [ ] **Step 3: 运行测试确认失败**

Run: `npm test`
Expected: FAIL — 找不到 `@/billing/views/PlaceholderView.vue`。

- [ ] **Step 4: 创建 `src/billing/views/PlaceholderView.vue`**

按 design/billing-frontend.md 给出的完整内容,文案逐字复制:

```vue
<template>
  <main class="placeholder">
    <h1>记账 MVP</h1>
    <p>项目骨架已就绪。后续业务功能由其他 change 推进。</p>
    <p>当前 change: <code>initialize-billing-project</code></p>
  </main>
</template>

<script setup>
// 无业务逻辑
</script>

<style scoped>
.placeholder { padding: 2rem; max-width: 720px; margin: 0 auto; }
h1 { font-size: 1.8rem; margin-bottom: 1rem; }
code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; }
</style>
```

- [ ] **Step 5: 创建 `src/billing/router/index.js`**

```js
export default [
  {
    path: '',
    component: () => import('../views/PlaceholderView.vue'),
  },
]
```

只含 `path: ''` 一个子路由 —— 见 Global Constraints 的规格冲突说明。

- [ ] **Step 6: 创建 `src/router/index.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/billing' },
    {
      path: '/billing',
      children: billingRoutes,
    },
  ],
})

export default router
```

- [ ] **Step 7: 运行测试确认通过**

Run: `npm test`
Expected: PASS — 8 tests passed(1 个 App + 3 个 PlaceholderView + 4 个路由)。

- [ ] **Step 8: 提交**

```bash
git add src/billing/views/PlaceholderView.vue src/billing/router/index.js src/router/index.js tests/billing/
git commit -m "feat(frontend): 添加记账占位页与 /billing 路由"
```

---

### Task 3: 通用 HTTP 客户端

**Files:**
- Create: `src/api/http.js`
- Test: `tests/shared/http.spec.js`

**Interfaces:**
- Consumes: 无
- Produces: `src/api/http.js` default export — axios 实例,`baseURL === '/api/v1'`、`timeout === 10000`。后续 change 由此派生业务接口封装(**不要**再建新实例,见 Review Focus 第 5 条)

- [ ] **Step 1: 写失败测试**

创建 `tests/shared/http.spec.js`:

```js
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
```

第 3 个测试钉住"业务侧只写 `/health`,前缀由实例统一加"这一契约(对应 Review Focus 第 4 条)—— 后续 change 若绕过实例直接用裸 axios,baseURL 就会丢。

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL — 找不到 `@/api/http`。

- [ ] **Step 3: 创建 `src/api/http.js`**

```js
import axios from 'axios'

export default axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})
```

按 design 逐字实现:硬编码 `/api/v1`,不读 `import.meta.env.VITE_API_BASE_URL`(`.env.example` 里那个变量本 change 不消费)。

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS — 11 tests passed。

- [ ] **Step 5: 提交**

```bash
git add src/api/http.js tests/shared/http.spec.js
git commit -m "feat(frontend): 添加 /api/v1 通用 axios 实例"
```

---

### Task 4: 目录约定与双 owner 标记

本 change 的交付物之一就是"后续 change 知道往哪加代码",因此目录与 README 需要可执行的校验。

**Files:**
- Create: `src/billing/README.md`
- Create: `src/shared/README.md`
- Create: `.gitkeep`(于 `src/billing/components/`、`src/billing/stores/`、`src/billing/api/`、`src/billing/composables/`、`src/stores/` 五个空目录)
- Test: `tests/shared/directory-structure.spec.js`

**Interfaces:**
- Consumes: 无
- Produces: 无代码接口。产出的是给后续 change 读的两份约定文档,以及把 design.md 的目录约定变成可执行断言

- [ ] **Step 1: 写失败测试 — 目录结构断言**

创建 `tests/shared/directory-structure.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —`src/billing/components`、`src/shared`、`src/stores` 等目录不存在。

- [ ] **Step 3: 创建空目录及其 `.gitkeep`**

创建下列 5 个目录,每个内放一个空 `.gitkeep`(git 不跟踪空目录):

```
src/billing/components/.gitkeep
src/billing/stores/.gitkeep
src/billing/api/.gitkeep
src/billing/composables/.gitkeep
src/stores/.gitkeep
```

`src/shared/` 会在下一步因 `README.md` 而存在,无需 `.gitkeep`。

- [ ] **Step 4: 创建 `src/billing/README.md`**

必须写清四件事:记账业务代码落点、各子目录用途、**两个 api 目录的区别**、以及 README 本身的评审归属。内容按下方骨架写全:

```markdown
# src/billing/ — 记账业务代码

本目录是**记账业务**的代码落点,与 Todo 业务(`src/todo/`)通过目录隔离,不共用文件。

## 子目录约定

| 目录 | 用途 | 什么时候加 |
|------|------|-----------|
| `views/` | 页面级组件(一个路由 = 一个 view) | 新增账单列表 / 录入 / 详情页 |
| `components/` | 业务组件(可被多个 view 复用) | 新增 BillTable / CategorySelect |
| `stores/` | Pinia store(仅本业务用) | 新增 auth / bills 等状态 |
| `api/` | **本业务的接口封装**,基于 `@/api/http` 二次包装 | 调后端接口时 |
| `router/` | `/billing/*` 子路由数组 | 新增页面路由 |
| `composables/` | 组合式函数 | 跨 view 复用的响应式逻辑 |

## 注意:两个 api 目录的区别

| 路径 | 归属 | 内容 |
|------|------|------|
| `src/api/http.js` | 通用 | 全局 axios 实例,`baseURL = /api/v1`,整个前端共用一个 |
| `src/billing/api/` | 记账业务 | 接口封装(如 `bill.js` 导出 `fetchBills()`),内部 import `@/api/http` |

**不要在 `src/billing/api/` 里 `axios.create()` 建新实例** —— 会导致 baseURL 漂移、超时配置不一致。

## 跨业务共享

需要两个业务复用的代码放 `src/shared/`,**修改需双 owner 评审**(见该目录 README)。
```

- [ ] **Step 5: 创建 `src/shared/README.md`**

```markdown
# src/shared/ — 跨业务共享代码

存放 **记账业务**与 **Todo 业务**都要用的代码(通用组件 / 工具函数 / 配置)。

## ⚠️ 评审要求

**本目录的任何修改都需要双 owner 评审通过**:

| 业务 | Owner |
|------|-------|
| 记账业务 | sadmi |
| Todo 业务 | mi |

记账业务 owner(sadmi)**不能单独修改**本目录,需 sadmi + mi 同时批准。

详见 store 端规范:`/Users/jump/code/openspec-store/todo-specs/AGENTS.md`。

## 什么该放这里

先问:这段代码是否真的与具体业务无关?

- **该放**:日期格式化、通用 HTTP 封装、无业务语义的基础组件
- **不该放**:任何带"账单 / 分类"或"待办 / 任务"业务语义的东西
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npm test`
Expected: PASS — 29 tests passed(11 个功能测试 + 18 个结构断言)。

- [ ] **Step 7: 提交**

```bash
git add src/billing/README.md src/shared/README.md src/billing/components/.gitkeep src/billing/stores/.gitkeep src/billing/api/.gitkeep src/billing/composables/.gitkeep src/stores/.gitkeep tests/shared/directory-structure.spec.js
git commit -m "docs(frontend): 添加 billing/shared 目录约定与结构断言"
```

---

### Task 5: 端到端验证

覆盖 tasks.md 验收标准中依赖运行态的部分。本任务**不新增代码**,除非验证发现问题。

**Files:**
- Verify: `vite.config.js`(代理已存在,本任务只验证不修改)
- Modify(仅在验证失败时): 对应文件

**Interfaces:**
- Consumes: Task 1-4 全部产出
- Produces: 无代码产出

**背景:`/api` 代理已存在。** `vite.config.js` 当前已有:

```js
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true }
}
```

与 design 要求一致。**不要重复添加**,本任务只验证其行为。

- [ ] **Step 1: 全量测试 + 生产构建**

Run: `npm test && npm run build`
Expected: 29 tests passed;`vite build` 成功产出 `dist/`,无报错。这一步顺带验证 `@` 别名在 build 阶段也能解析。

- [ ] **Step 2: 启动 dev server(后台)**

Run: `npm run dev`
Expected: 监听 `http://localhost:5173/`,无启动报错。保持进程运行供后续步骤使用。

- [ ] **Step 3: 验证根路径重定向**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`
Expected: `200`。注意这是 SPA fallback 返回 index.html,重定向到 `/billing` 由前端 router 在浏览器中完成 —— 浏览器验证在 Step 5。

- [ ] **Step 4: 验证深链回退(对应 Review Focus 第 1 条)**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/billing`
Expected: `200`,而非 404。证明 vite dev 的 SPA fallback 生效,浏览器直接刷新 `/billing` 不会 404。

- [ ] **Step 5: 浏览器验证三个页面状态**

在浏览器打开并确认(需要真实目视,curl 无法验证渲染):

| URL | 预期 |
|-----|------|
| `http://localhost:5173/` | 地址栏自动变为 `/billing`,显示"记账 MVP" |
| `http://localhost:5173/billing` | 显示"记账 MVP" + "项目骨架已就绪。后续业务功能由其他 change 推进。" + `initialize-billing-project` |
| `http://localhost:5173/billing` 后按 F5 刷新 | 页面正常渲染,不 404、不白屏 |

- [ ] **Step 6: 验证代理行为(对应 Review Focus 第 3 条)**

先在**后端未启动**的情况下:

Run: `curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5173/api/v1/health`
Expected: 快速返回非 200(502 / 500 / 000)。关键是**快速失败而非超时挂起**。

再(若 `bill-classify-backend` 已就绪)启动后端后重试:
Expected: `200 {"status":"ok"}`,证明代理链路通到 `localhost:8080`。后端未就绪时跳过此步,在验收时注明"代理链路待后端就绪后复验"。

- [ ] **Step 7: 停止 dev server**

关闭 Step 2 启动的后台进程。

- [ ] **Step 8: 提交(如有修复)**

若 Step 1-6 全绿则**不提交**(无改动)。若修复了任何问题:

```bash
git add -u
git commit -m "fix(frontend): 修复骨架验证发现的问题"
```

---

## 验收对照表

| tasks.md 验收项 | 覆盖任务 |
|---|---|
| `npm run dev` 启动成功,监听 `:5173` | Task 5 Step 2 |
| 浏览器 `/billing` 显示占位页 | Task 5 Step 5 |
| `/` 自动跳到 `/billing` | Task 2 Step 2(自动)+ Task 5 Step 5(目视) |
| 目录结构符合 design.md | Task 4 Step 1(结构断言) |
| 双 owner 评审机制生效 | Task 4 Step 4-5(README 标记) |
| `npm test` 跑通 | 每个任务的最后一步 + Task 5 Step 1 |
| 后端相关验收项 | **不在本计划范围**,见 `tasks/billing-backend-sadmi.md` |

## 与后端任务的边界

`tasks/billing-backend-sadmi.md` 由同一 owner(sadmi)负责,但属于**独立计划**。前端计划不创建、不修改任何后端文件;Task 5 Step 6 仅通过 HTTP 探测后端,不改动后端代码。
