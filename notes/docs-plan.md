# Previously 文档重写计划与写作纪律（2026-08-28）

> 维护者拍板的原则，覆盖旧有惯例。写任何一篇文档前先读本文件。

## 写作纪律（维护者原话提炼）

1. **讲故事、讲理念，不是把代码翻译成普通话。** 每篇回答"我们为什么这样做、我们相信什么"；功能与命令只作为故事的证据出现。读者读完应记住"这个产品相信什么"，而不是记住参数。
2. **与代码完全契合。** 只写当前已实现的能力（以 `previously-lab/agent` 与 `previously-lab/client` 的代码为准）；退役特性（MCP server、`previously upgrade`、`previously recall` 命令）与规划中的东西（Connect、rich strands）一律不写。每个事实性表述先在代码里核验。
3. **给人看，不给机器看。** 不堆命令参考、不罗列参数表当正文；参考性内容（配置键、命令清单）压到篇末或链接，主体是叙事。
4. **不提 demo/演示腔。** 不出现"演示数据集""demo 会代你发问"这类出戏表述。站内可交互组件就是产品本身的样子。
5. **中英同一套大纲同时写，一一对应。** 不是翻译关系，是同一篇文章的两种写法：标题对应、小节对应、事实对应。侧边栏与正文术语统一（zh：回忆/切片/用户卡片/时间线；en：Recall/Slices/User Card/The Timeline）。
6. frontmatter `order` 字段已死（顺序由 `src/lib/docs/manifest.ts` 决定），新文档不再写 order；manifest 里的 title 用规范英文标题。

## 可用 MDX 组件

`<Callout variant="info|warning">`、`<Playground capability="recall|evolution|anatomy" />`（嵌在对应能力的文档里）、代码块、表格。不用其它自定义组件。

## 文档地图（28 篇）

章节 i18n key / zh / en 见 manifest 与 messages/{locale}/docs.json。

### 起点（start）
| slug | zh 标题 | en 标题 | 状态 |
|---|---|---|---|
| introduction | 简介 | Introduction | 重写 |
| why | 为什么是 Previously | Why Previously | 修订 |
| getting-started | 快速开始 | Getting Started | 重写（client：npm i -g previously-client → previously） |

### 记忆如何成形（memory）
| slug | zh 标题 | en 标题 | 状态 |
|---|---|---|---|
| slices | 时间切片 | Time Slices | 修订 + 嵌 anatomy playground |
| timeline | 时间线 | The Timeline | 修订 |
| strands | Strands | Strands | 修订 |
| scribe | 转录 | The Scribe | 新（transcribe, don't hijack；四来源 claude-code/codex/kimi-code/gemini） |
| ingest | 写入记忆的唯一一扇门 | The Only Way In | 新（--submit 验收式校验、--source、--mark 先报价） |
| memory-model | 记忆模型 | The Memory Model | 修订 |

### 它如何回忆与思考（mind）
| slug | zh 标题 | en 标题 | 状态 |
|---|---|---|---|
| recall | 回忆 | Recall | 修订（已嵌 recall playground） |
| web-search | 搜索同事 | The Web Researcher | 新（置信度与分歧评估） |
| think-deep | 洁净室思考 | The Clean Room | 新（隔离推理、effort 档） |
| colleagues | 同事制 | Colleagues, Not Tools | 新（主 agent 只留四件工具；记忆守门 memory_worthy） |
| user-card | 用户卡片 | The User Card | 修订（已嵌 evolution playground） |
| evolution | 进化回路 | The Evolution Loop | 新（两阶段、direction、fitness、mutations 验收） |

### 跑在你机器上（client）
| slug | zh 标题 | en 标题 | 状态 |
|---|---|---|---|
| local-first | 本地优先 | Local First | 新（内核是一个 npm 包） |
| your-memory | 记忆是一个文件夹 | Your Memory Is a Folder | 新（~/Documents/Previously，git 是账本） |
| two-engines | 双引擎 | Two Engines | 新（bridge 订阅 vs BYOK） |
| everyday | 日常 | Everyday Commands | 新（previously 的一天：start/open/status/logs/stop） |
| skill-pack | 技能包 | The Skill Pack | 新（让 Claude/Codex/Kimi 读懂你的记忆；MCP 为什么退役可一句带过） |
| kernel-supply-chain | 内核供应链 | The Kernel Supply Chain | 新（精确版本锁定；升级=升级 client） |
| configuration | 配置 | Configuration | 重写（叙事化 + 篇末键表） |

### 界面与参考（reference）
| slug | zh 标题 | en 标题 | 状态 |
|---|---|---|---|
| chat-ui | 聊天界面 | The Chat Interface | 新（三阶段渲染、时间轮、认知气泡） |
| architecture | 架构 | Architecture | 修订 |
| deployment | 部署 | Deployment | 修订（云端自托管） |
| faq | 常见问题 | FAQ | 修订 |

## 章节顺序（manifest）

start → memory → mind → client → reference。

## 事实核验来源

- agent 本体：`C:\Users\Dream\Documents\GitHub\Aftrbrez`（= previously-lab/agent）——src/lib/episodic、src/lib/evolution、src/lib/agents、src/app/api、src/components/chat、identity/。
- client：`C:\Users\Dream\Documents\GitHub\client`——README.md、docs/reference.md、docs/design/v0.1-client.md、src/commands、src/scribe、src/bridge。
