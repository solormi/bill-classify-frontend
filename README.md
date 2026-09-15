# bill-classify-frontend

账单分类前端,Vue 3 + Vite + Pinia + Vue Router。

## 本期不依赖后端

`.env` 默认 `VITE_USE_MOCK=1`,通过 `axios-mock-adapter` 在前端拦截 `/api/v1/bills` 全部请求,内置 20 条示例数据与自动分类能力。切换真实接口只需:

```bash
VITE_USE_MOCK=0 npm run dev
```

并保证后端监听 `:8080`(Vite 已配置代理 `/api` → `http://localhost:8080`)。

## 启动

```bash
npm install
cp .env.example .env
npm run dev
```

打开 http://localhost:5173。

## 测试

```bash
npm test            # 一次性跑
npm run test:watch  # 监听
npm run test:coverage
```

目标覆盖率 ≥ 60%。

## 页面

| 路由 | 说明 |
|---|---|
| `/` | 列表 + 过滤 + 排序 + 分类下拉编辑 |
| `/bills/upload` | CSV 上传 |
| `/bills/new` | 手工录入 |
| `/bills/:id` | 详情 + 编辑分类 |

## 接口契约

完整契约以 `../openspec/changes/add-todolist/specs/html-ui/spec.md` 为准。