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
