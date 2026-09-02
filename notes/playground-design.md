# Previously Playground 体验设计备忘

> 记录时间：2026-08-26  
> 状态：已实现（2026-08-28，待联调 DeepSeek）

## 背景与问题

Previously 项目当前 demo 体验存在三个主要障碍：

1. **部署成本高**：最佳形态是部署在 Vercel，但用户需自备 API key，门槛高。
2. **空数据劝退**：用户自己部署后没有任何可用记忆数据，需要从零积累。
3. **只读 demo 限制**：线上演示版本只能体验"读"，无法体验"写"和自我进化，很多核心能力无法展示。

## 产品决策

### 1. Playground 与文档站合并

将可交互的 Playground 直接嵌入 `previously-site` 文档站，和文档讲同一个故事。

### 2. 不给自由输入框，只给 preset 选项

每个能力提供 3 个左右的预设选项，例如：

- **回忆**：回忆 2024 年 / 回忆 2025 年 / 回忆 2026 年
- **自我进化**：查看某个主题如何被总结 / 看 agent 如何更新记忆标记

用户点击 preset 后，前端调用 demo 服务并展示真实返回结果。

### 3. 服务端真实请求但受限

- 只接受白名单内的 preset ID，拒绝任何自定义 prompt。
- 应用层做响应缓存：相同请求命中缓存，提高模型缓存率、降低 token 消耗。
- IP 级别限流，防止接口被刷。
- Demo 服务运行在 demo 模式：**不落盘、不写入**，仅把计算结果返回给客户端展示；刷新即重置。

### 4. 数据策略

- 不再使用 WorldMemArena 等通用 benchmark 数据集（叙事平、不可控）。
- 使用 Loom 生成一份**专精的小叙事数据集**：围绕一个具体人物，跨 2-3 年，包含工作、生活、真实历史事件背景。
- 数据集需产出 Previously 格式（timeline、index、strands 等），后续接到 Aftrbrez demo。

### 5. 叙事策略

首页 PPT → 文档 → Playground 讲同一个故事，让用户从"这个产品能做什么"到"它在真实人生中怎么工作"形成连贯心智。

### 6. 安全与成本

- 所有真实 API 调用受 preset 白名单和限流约束。
- 短期内先跑真实请求；若流量爆发，再升级到更严格限流或预录模式。
- 生成/调用成本由 Previously Lab 承担，用户端零成本。

## 待后续确定

- [ ] 人物设定与故事圣经
- [ ] 时间跨度（如 2024-03 → 2026-08）
- [ ] 数据语言（英文/中文/双语）
- [ ] 需要融入的真实历史事件清单及精确日期
- [ ] Loom 输出 Previously 聚合索引（timeline/index.json、strands.json）
- [ ] Aftrbrez demo 接入数据与 preset 映射

## 相关仓库

- `C:\Users\Dream\Documents\GitHub\previously-site`：文档站 + Playground
- `C:\Users\Dream\Documents\GitHub\Aftrbrez`：Previously 本体，demo 服务
- `C:\Users\Dream\Documents\GitHub\loom`：数据集生成器

---

## 实现记录（2026-08-28）

### 架构总览

- 数据：**运行时实时读取线上 `you` 仓库**（GitHub raw，`previously-lab/you/main/user`）——这个仓库就是 demo 用户的记忆本体，playground 的访问方式与真实内核一致。`src/lib/playground/snapshot.ts` 的 `getSnapshot()` 远程优先，模块级缓存 5 分钟；GitHub 不可达时回退到 vendored 兜底快照（`src/lib/playground/data/snapshot.json`，由 `pnpm playground:sync` 刷新，见 `scripts/sync-playground-data.mjs`），兜底状态下 1 分钟后重试远程。快照带内容哈希 `version`。
- API：`POST /api/playground`（`src/app/api/playground/route.ts`）。
- UI：`src/components/playground/`（片段化对话组件：按能力划分 recall/evolution/anatomy，打开即有 2-3 轮预录对话历史（静态文案，基于数据集真实切片，不走 API），底部无输入框只有 prompt 选项，点击走真实 API 追加进对话流），MDX 用 `<Playground capability="recall" />` 嵌在对应能力的文档里。**2026-08-28 修订：Playground 是组件不是页面**——`/playground` 独立页面及其所有入口（落地页 CTA、footer、sitemap、llms.txt、文档内链接）已全部撤除，入口改为指向 /docs/recall。详见下文「设计修订」。
- preset 白名单：`src/lib/playground/presets.ts`，前后端共用。

### API 契约

**请求**

```json
{ "presetId": "recall-worldcup", "locale": "en" | "zh" }
```

- `presetId` 必须是白名单之一（zod refine `isPresetId`），否则 400。
- `locale` 决定 answer 等自由文本字段的语言。

**成功响应 200**

```json
{ "presetId": "…", "kind": "recall" | "evolution" | "anatomy", "result": {…}, "cached": true | false }
```

- `kind = recall` → `{ answer, references: [{ slice_id, quote, note? }], searched: string[], confidence: 0..1 }`
- `kind = evolution` → `{ triggerReasons: string[], fitnessLedger: [{ bucket, delta, evidence }], directionVerdict, directionChanges: { portraitAdded, portraitRetired, hypothesesPromoted, hypothesesProposed, hypothesesRetired }, cardBefore, cardAfter, playbookNote }`（`cardBefore` 由服务端直接取 vendored 卡片原文，不经模型，保证 diff 诚实;fitness 账本的 evidence 必须是用户原话引文,无证据不打分)
- `kind = anatomy` → `{ narrative, sliceId, frontmatter }`（`frontmatter` 由服务端用 gray-matter 从切片 core.md 解析，不经模型）

**错误响应**：统一 `{ "error": string, "code": "bad_request" | "rate_limited" | "unavailable" | "upstream" }`，`error` 文案按 locale 双语。

| 状态码 | code | 场景 |
|---|---|---|
| 400 | bad_request | body 校验失败 / preset 不在白名单 |
| 429 | rate_limited | IP 超限（带 `Retry-After` 头） |
| 503 | unavailable | `DEEPSEEK_API_KEY` 缺失 |
| 502 | upstream | DeepSeek 非 2xx / 输出过不了 zod 校验 |

### DeepSeek 调用

`https://api.deepseek.com/chat/completions`，`model: "deepseek-chat"`，`response_format: json_object`，`max_tokens: 1500`，`temperature: 0.3`，60s 超时。key 只从 `process.env.DEEPSEEK_API_KEY` 读。

### Preset 清单与数据对应

| presetId | kind | 深读切片 | 说明 |
|---|---|---|---|
| recall-worldcup | recall | 2026/06/19/2027、2026/06/27/1813、2026/07/24/1021 | 世界杯看球 + 赛后复盘 |
| recall-mom | recall | 2025/07/30/1755、2025/08/23/1431 | 妈妈健康惊吓 + 恢复 |
| recall-marathon | recall | 2026/07/11/1108、2026/07/16/1913、2026/07/20/1102 | 赛前紧张 → 完赛 → 复盘 |
| evolution-card | evolution | 2026/08/11/2054、2026/08/17/1721 | 最新切片跑一遍卡片进化 pass（输入另含 current-previously.md + direction.md） |
| slice-anatomy | anatomy | 2026/07/16/1913 | 讲解 frontmatter 各字段来源 |

recall prompt 复刻内核 recall 同事纪律：先给全量 timeline 索引 + 相关 strand 条目（locate），再给切片全文（deep-read），要求证据锚定引用（verbatim quote + slice_id）、`searched` 轨迹、「没有这段记忆」是合法答案。

### 缓存与限流

- **缓存**：模块级 `Map`，key = `presetId:locale:数据版本哈希`。preset 制意味着所有用户发的是同一批请求，命中率就是成本设计目标；数据集更新后版本哈希变化，旧回答自动失效。进程重启即清空。
- **限流**：模块级 `SlidingWindowRateLimiter`，每 IP 20 次/小时滑动窗口（`src/lib/playground/rate-limit.ts`）。

### 已知限制

- **Serverless 下缓存与限流都是 per-instance**：多实例部署时限流可被横向绕过、缓存命中率被实例数稀释。demo 场景接受；流量爆发时升级为共享存储（如 Upstash）或预录模式。
- **远程数据依赖 GitHub raw 可用性**：5 分钟缓存 + vendored 兜底；raw 的速率限制对 demo 量级足够，若成为问题可加 `GITHUB_TOKEN` 换 API 通道。
- 结果文本按 plain text 渲染（whitespace-pre-line），不做完整 markdown 渲染——站内无 react-markdown 依赖，刻意不加。

### 待联调

- 设 `DEEPSEEK_API_KEY` 后对 5 个 preset × 2 locale 各跑一次，确认模型输出过 zod 校验（尤其是 evolution 的 `cardAfter` 完整卡片与 anatomy 的 `sliceId`）。
- 文档挂载（`content/docs/`）由维护者后续进行。

---

## 设计修订（2026-08-28，维护者明确拍板）

Playground 的定位与形态以本节为准，覆盖上文任何冲突描述：

1. **是组件，不是页面。** 撤掉 `/playground` 独立页面及所有入口（落地页 CTA、footer、sitemap、`why.mdx`/`faq.mdx` 链接）。组件只通过 MDX 穿插在文档里。
2. **按能力划分，不按"场景"划分。** 每个 Playground 组件对应一种能力，嵌在讲该能力的文档里：回忆文档 → 回忆 playground；用户卡片文档 → 进化 playground；切片文档 → 解剖 playground。
3. **组件形态 = 一段正在进行中的真实对话。** 打开即有 2-3 轮预录对话历史（静态文案，基于数据集事实，不走 API——零加载、零成本、不受缺 key/限流影响）；底部无自由输入框，只给若干 prompt 选项，点击后走真实 API 实时作答并追加进对话流。
4. **禁止 meta/演示腔文案。** 界面与引导语不得出现"演示数据集""demo 会代你发问""演示规则"这类出戏表述；组件看起来就是产品本身的聊天面板。
