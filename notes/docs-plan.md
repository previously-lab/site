# Previously 文档重写计划与写作纪律（2026-08-28）

> 维护者拍板的原则，覆盖旧有惯例。写任何一篇文档前先读本文件。

## 写作纪律（维护者原话提炼）

1. **讲故事、讲理念，不是把代码翻译成普通话。** 每篇回答"我们为什么这样做、我们相信什么"；功能与命令只作为故事的证据出现。读者读完应记住"这个产品相信什么"，而不是记住参数。
2. **与代码完全契合。** 只写当前已实现的能力（以 `previously-lab/agent` 与 `previously-lab/client` 的代码为准）；退役特性（MCP server、`previously upgrade`、`previously recall` 命令）与规划中的东西（Connect、rich strands）一律不写。每个事实性表述先在代码里核验。
3. **给人看，不给机器看。** 不堆命令参考、不罗列参数表当正文；参考性内容（配置键、命令清单）压到篇末或链接，主体是叙事。
4. **不提 demo/演示腔。** 不出现"演示数据集""demo 会代你发问"这类出戏表述。站内可交互组件就是产品本身的样子。
5. **中英同一套大纲同时写，一一对应。** 不是翻译关系，是同一篇文章的两种写法：标题对应、小节对应、事实对应。侧边栏与正文术语统一（zh：回忆/切片/用户卡片/时间线；en：Recall/Slices/User Card/The Timeline）。
6. frontmatter `order` 字段已死（顺序由 `src/lib/docs/manifest.ts` 决定），新文档不再写 order；manifest 里的 title 用规范英文标题。

## 产品定位（2026-08-28 维护者拍板，覆盖此前一切写法）

1. **部署到 Vercel 是主推形态**：完整体验（耐久运行、随处可达、全部同事能力）都在这条路上。不许再把云端写成"进阶选项"。
2. **本机 npm（client）是可选路径，处于早期预览（early preview）**：核心链路可用，但文案必须如实标注预览状态。服务"不想部署任何东西、记忆必须留在本机"的用户。
3. **BYOK 是推荐引擎；bridge 是兜底，且仅存在于本地形态。** 云端没有本机 agent CLI 可桥接，云端唯一引擎就是用户自己的 provider key。bridge 文案必须写明：被桥接 agent 的表现不受我们控制，体验与 BYOK 可能有明显差距。
4. Previously 是我们自己造的 agent——以别的 agent 为核心会限制我们能做的事，这是 BYOK 推荐的底层理由。
5. **结构纪律：共用概念（切片/时间线/同事/进化……）不绑定任何形态；形态专属内容必须标清归属**（本机 npm / 部署到 Vercel），不许混写。历史上最严重的反面教材：architecture 曾把 Vercel Workflow 耐久运行写成通用架构。

## 可用 MDX 组件

`<Callout variant="info|warning|success">`、`<Playground capability="recall|evolution|anatomy" />`（嵌在对应能力的文档里）、`<Terminal demo="status-fresh|status-running" />`（真实 CLI 状态面板，ANSI 数据在 `src/lib/docs/terminal-demos.ts`）、代码块、表格。不用其它自定义组件。

## 文档地图（27 篇）

章节 i18n key / zh / en 见 manifest 与 messages/{locale}/docs.json。

### 起点（start）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| introduction | 简介 | Introduction | 共用 |
| why | 为什么是 Previously | Why Previously | 共用 |
| getting-started | 快速开始 | Getting Started | 两种跑法入口：Vercel 推荐路径 + npm 预览路径，嵌 Terminal |

### 记忆如何成形（memory，共用概念，不绑定形态）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| slices | 时间切片 | Time Slices | 共用 |
| timeline | 时间线 | The Timeline | 共用 |
| strands | Strands | Strands | 共用 |
| memory-model | 记忆模型 | The Memory Model | 共用 |

### 它如何回忆与思考（mind，共用概念）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| recall | 回忆 | Recall | 共用（嵌 recall playground；UI 渲染细节只写 chat-ui） |
| web-search | 搜索同事 | The Web Researcher | 共用（DEEPSEEK_API_KEY 两种跑法都需要；纯 bridge 不可用） |
| think-deep | 洁净室思考 | The Clean Room | 共用 |
| colleagues | 同事制 | Colleagues, Not Tools | 共用 |
| user-card | 用户卡片 | The User Card | 共用（嵌 evolution playground；回路机制只写 evolution） |
| evolution | 进化回路 | The Evolution Loop | 共用 |

### 部署到 Vercel（cloud，推荐形态）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| deployment | 部署到 Vercel | Deploy on Vercel | 云端专属：步骤、环境变量、ACCESS_SECRET、Sync from upstream |
| cloud-runtime | 云端的一回合 | How a Cloud Turn Works | 云端专属：耐久 Workflow、有界续跑、sendBeacon、同源守卫 |

### 在本机运行（npm）（local，可选路径，早期预览）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| local-first | 本地优先 | Local First | 本地（预览提示在这篇） |
| your-memory | 记忆是一个文件夹 | Your Memory Is a Folder | 本地 |
| two-engines | 双引擎 | Two Engines | 本地（BYOK 推荐 / bridge 兜底） |
| everyday | 日常 | Everyday Commands | 本地（嵌 Terminal） |
| scribe | 转录 | The Scribe | 本地专属（云端够不着本机日志） |
| ingest | 写入记忆的唯一一扇门 | The Only Way In | 本地专属 |
| skill-pack | 技能包 | The Skill Pack | 本地 |
| kernel-supply-chain | 内核供应链 | The Kernel Supply Chain | 本地 |
| configuration | 配置 | Configuration | 机器层=本地；记忆层=两种跑法通用 |

### 参考（reference）
| slug | zh 标题 | en 标题 | 归属 |
|---|---|---|---|
| chat-ui | 聊天界面 | The Chat Interface | 共用 UI；bridge 降级卡片标注为本地形态 |
| architecture | 架构 | Architecture | 共用内核架构（耐久运行等云端机制只写 cloud-runtime） |
| faq | 常见问题 | FAQ | 双形态回答必须显式标注形态 |

## 章节顺序（manifest）

start → memory → mind → cloud → local → reference。

## 事实核验来源

- agent 本体：`C:\Users\Dream\Documents\GitHub\Aftrbrez`（= previously-lab/agent）——src/lib/episodic、src/lib/evolution、src/lib/agents、src/app/api、src/components/chat、identity/。
- client：`C:\Users\Dream\Documents\GitHub\client`——README.md、docs/reference.md、docs/design/v0.1-client.md、src/commands、src/scribe、src/bridge。
