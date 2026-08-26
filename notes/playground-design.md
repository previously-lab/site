# Previously Playground 体验设计备忘

> 记录时间：2026-08-26  
> 状态：已达成共识，待后续补充故事圣经与数据

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
