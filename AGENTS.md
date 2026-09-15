# AGENTS.md — bill-classify 前端仓库

本仓库的规划由 OpenSpec store 统一管理: `/Users/jump/code/work/todo-specs/`。
所有变更必须先在 store 里建 change,通过 OpenSpec 工作流驱动,再在本仓 apply。

## 强制约束(详情见 store 端 AGENTS.md)

- 任务文件: `tasks/frontend.md`(短名,不是 `bill-classify-frontend`)
- 设计文件: `design/frontend.md`
- 涉及 capability: `html-ui`
- 任何变更先 `openspec status --store todo-specs`,不要直接动手

## 技术栈

- 构建: Vite(`vite.config.js`)
- 框架: Vue 3 或 React(以 `package.json` 为准)
- 样式: CSS Modules / Tailwind(看实际 `src/` 结构)
- 测试: Vitest / Testing Library

## 协作约定

- 提交信息遵循 Conventional Commits
- commit 前跑 `npm run lint` 和 `npm test`
- 跨仓变更需要先在 store 里 archive 才能算完成