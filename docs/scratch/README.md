# docs/scratch/ — 临时草稿区

> 本目录用于存放「未对齐的探索性设计草稿」。
> 一旦 Leader 拍板,内容必须迁到 store 的 `design/<short-name>.md`,然后本目录的文件删除。

## 用途

写 mini-design 草稿时用这里。三个阶段的设计流转:

```
Slack/口头(5 分钟决策)
    ↓
docs/scratch/*.md(1-3 小时细化)  ← 你在这里
    ↓
store/openspec/changes/<change>/design/<short-name>.md(正式)
```

## 文件命名

`<YYYY-MM-DD>-<topic>.md`

例:`2026-09-15-design-tokens-billtable.md`

## 模板

参见 `2026-09-15-design-tokens-billtable.md` 的结构。

## 规则

1. **不进 PR 也不进 main 分支**:本地 + 临时分支用,正式版进 store 后立刻删
2. **过期清理**:超过 30 天未对齐的草稿,跟 Leader 沟通决定是否继续
3. **不引以为权威**:这里的任何决策都不是最终版,Leader 没 review 前不能拿来当依据

## 与 store 的关系

| | docs/scratch/ | store design/ |
|---|---|---|
| 性质 | 过程性、探索性 | 结果性、权威性 |
| 编辑者 | 开发为主 | Leader 为主,开发配合 |
| 是否被 spec 引用 | ❌ | ✅ |
| AI apply 时读取 | ❌ | ✅ |
| git 历史重要 | 不重要(可删) | 重要(要留痕) |

## 跨仓场景

- 单仓 change:scratch 只在自己仓
- 跨仓 change:各自仓各自 scratch,但**最终版必须合并到 store 的同一份 `design/<short-name>.md`**