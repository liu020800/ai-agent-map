# UI 稳定化修复报告

> AI Agent Map · 全站 UI 终局版优化
> 范围: Next.js 16.2.6 + React 19.2.4 + Tailwind v4 (dark cyber theme)

## 1. 项目技术栈审计

| 项 | 实际 |
|---|---|
| 框架 | Next.js 16.2.6 (App Router) + Turbopack |
| React | 19.2.4 |
| 样式 | Tailwind v4 (`@import "tailwindcss"`) + `globals.css` (custom layer) |
| 动画 | framer-motion + gsap + echarts |
| 3D | `@react-three/fiber` (CyberBackground) |
| 视觉 | `liquid-glass-react` (LiquidGlassCard), lucide-react icons |
| API | Cloudflare Pages Functions (`functions/api/`) + Supabase |
| 部署 | Cloudflare Pages (静态 + Functions) |

### 文件地图

| 路径 | 角色 |
|---|---|
| `src/app/layout.tsx` | 根 layout，挂载 `ClientShell` + `globals.css` |
| `src/app/page.tsx` | 首页 (/) — 组合 HeroSection + ThreeStepSection + 各种 section |
| `src/app/survey/page.tsx` | 角色创建器，4 步表单 + Live Preview |
| `src/app/map/page.tsx` | 全国地图 (ECharts) + 侧栏 |
| `src/app/ranking/page.tsx` | 排行榜 (tools/provinces/levels 三 tab) |
| `src/app/trends/page.tsx` | 趋势战场 (ECharts bar) |
| `src/app/share/share-content.tsx` | 身份卡分享页 (Passport + 二维码 + 分享) |
| `src/app/not-found.tsx` | 404 |
| `src/components/client-shell.tsx` | 跳过链接 + 导航 + 内容 padding |
| `src/components/navbar.tsx` | 顶部导航 + 移动端抽屉 |
| `src/components/CyberBackground.tsx` | R3F 球+环+点 背景 (`fixed inset-0 z-0`) |
| `src/components/home/HeroSection.tsx` | 首页 Hero (左文案+右视觉) |
| `src/components/home/ThreeStepSection.tsx` | 三步流程卡片 |
| `src/components/home/AgentPassportPreview.tsx` | Hero 内嵌的护照预览 |
| `src/components/home/FloatingToolBadges.tsx` | Hero 浮动工具徽章 |
| `src/components/ChinaSvgMap.tsx` | SVG 地图 (城市点+连线) |
| `src/components/china-map-chart.tsx` | ECharts 真实地图 |
| `src/components/latest-card-stream.tsx` | 最新身份卡流 |
| `src/components/react-bits/*` | LiquidGlassCard, CountUp, BlurText, ParticlesBG, SciFiLoader 等 |

## 2. 已发现的问题

### 2.1 空白/半空白状态 (`/map`、`/ranking`、`/trends`)

| 页 | 问题 | 行 |
|---|---|---|
| `/map` | 加载时只有 `SciFiLoader` 一行文字 | `map/page.tsx:59-66` |
| `/map` | 错误时只显示一句话 | `china-map-chart.tsx:187-194` |
| `/ranking` | 加载时只有 `SciFiLoader` 一行文字 | `ranking/page.tsx:51-58` |
| `/trends` | 加载时只有 `SciFiLoader` 一行文字 | `trends/page.tsx:83-90` |
| `/trends` | 拿不到 `data` 时直接 return loader，没有骨架屏 | 同上 |

**修复方向**: 引入 mock 数据 + skeleton 占位 + 空状态文案。

### 2.2 Mock 数据散落

首页、share、map、ranking、trends 都有写死的 fallback / mock 数据数组，零散在 JSX 里。约 6-8 处重复。

**修复方向**: 集中到 `src/data/mock.ts`。

### 2.3 重复卡片 / 重复图标样式

`LiquidGlassCard` 出现 79 次，4-5 种 mode + cornerRadius + blurAmount 组合。每页都重新声明。
`border border-white/[0.04] bg-white/[0.01]` 装饰框 100+ 处。

**修复方向**: 抽象 `CyberCard` / `StatCard` / `EmptyState` / `PageSkeleton` 公共组件。

### 2.4 步骤编号排版 (`/survey`)

`/survey` line 206 用 `0{idx}` 显示 "01"~"04"，**目前是 OK** 的。但 Step 4 (line 308-332) 的"最终确认"卡片高度可能因为 message/error 状态而抖动。

### 2.5 移动端风险

| 文件 | 行 | 风险 |
|---|---|---|
| `HeroSection.tsx` | 137 | `min-h-[640px]` 在手机端会强制撑出空区域 |
| `HeroSection.tsx` | 146 | 雷达圆 380px 在手机端 overflow-x |
| `navbar.tsx` | 98 | `h-4.5 w-4.5` 不是标准 Tailwind 类，可能不生效 |
| `survey/page.tsx` | 215 | `xl:grid-cols-[1fr_410px]` 410px 在 <1280 屏正常但右侧预览会挤压 |
| `share-content.tsx` | 209 | `aspectRatio: "3 / 4"` + 460px 宽 移动端 width 100% OK |
| `map/page.tsx` | 144 | `<select>` 180px min-width 在 <360 屏可能挤压 |

### 2.6 装饰元素过度

`body::before` 96px grid + `body::after` 18px 径向点 (上次已降透明度)
`HeroSection` 4 个 `radar-ring` 嵌套 + 旋转动画 + 6 个信号点

虽然不占文档流，但**在低端机/小屏会触发重绘**。

### 2.7 `ChinaSvgMap` 在小屏的可能问题

`<rect width="100" height="90" fill="url(#mapGrid)" />` 之前是 5x5 网格（已删），现在 SVG 内部只有城市点，**没有空盒**了。但 `min-h-[300px]` 容器在数据为空时只显示 26 个小点。

## 3. 修复计划

### 3.1 新增/重构组件

| 组件 | 路径 | 用途 |
|---|---|---|
| `PageShell` | `src/components/ui/PageShell.tsx` | 统一主容器 (`max-w-[1240px]` + 左右 padding) |
| `SectionHeader` | `src/components/ui/SectionHeader.tsx` | 统一"eyebrow + title + desc" 区块头 |
| `CyberCard` | `src/components/ui/CyberCard.tsx` | 玻璃卡片统一封装 |
| `StatCard` | `src/components/ui/StatCard.tsx` | 统计卡 (icon + label + value) |
| `ToolBadge` | `src/components/ui/ToolBadge.tsx` | 工具 chip (统一颜色) |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | 空状态 (icon + msg + CTA) |
| `PageSkeleton` | `src/components/ui/PageSkeleton.tsx` | 骨架屏 |
| `AgentPassportCard` | `src/components/ui/AgentPassportCard.tsx` | 身份卡 (Home preview + Survey live + Share) |

### 3.2 集中 Mock 数据

`src/data/mock.ts` 导出:
- `MOCK_OVERVIEW` (total/agentUsers/appUsers/todayNew)
- `MOCK_TOOLS` (10 个工具 + count)
- `MOCK_PROVINCES` (10 个省份 + value)
- `MOCK_LEVELS` (5 个等级)
- `MOCK_TREND_DELTAS` (+12%, +8% 等)
- `MOCK_RECENT_CARDS` (4 个假身份卡)

### 3.3 页面修复顺序

1. `/` (首页) — 整体已 OK，主要清理内联组件 (HotTools, RankingPreview) 并用 mock 数据
2. `/survey` — 修 sticky 行为，桌面端保证预览卡不超父容器，移动端不横向滚动
3. `/map` — skeleton + mock + empty state
4. `/ranking` — skeleton + mock + empty state
5. `/trends` — skeleton + mock + empty state
6. `/share` — 已经基本 OK，只补 mock fallback

## 4. 修复后清单

### 4.1 新增/重构组件（9 个）

| 组件 | 路径 | 用途 |
|---|---|---|
| `PageShell` + `Section` | `src/components/ui/PageShell.tsx` | 统一主容器 (`max-w-[1240px]` + 左右 padding) 与 section 间距 |
| `SectionHeader` | `src/components/ui/SectionHeader.tsx` | 统一"eyebrow + title + desc" 区块头,支持 4 种 accent + trailing |
| `CyberCard` | `src/components/ui/CyberCard.tsx` | 玻璃卡片统一封装 (default/subtle/highlight 3 variant + glow + interactive) |
| `StatCard` | `src/components/ui/StatCard.tsx` | 统计卡 (icon + label + value + delta) |
| `ToolBadge` | `src/components/ui/ToolBadge.tsx` | 工具 chip (基于 `toolColor()` 自动着色 + sm/md/lg 三种 size) |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | 空状态 (icon + msg + CTA) |
| `PageSkeleton` | `src/components/ui/PageSkeleton.tsx` | 骨架屏 (Map/List/Chart 三个预设) |
| `RankingList` + `TagCloud` | `src/components/ui/RankingList.tsx` | 排行榜行 (rank + name + value + trend) + 标签云 |
| `AgentPassportCard` | `src/components/ui/AgentPassportCard.tsx` | 身份卡 (compact / full 两种布局) |
| `index.ts` | `src/components/ui/index.ts` | 统一导出 |

### 4.2 集中 Mock 数据

`src/data/mock.ts` 导出:
- `MOCK_OVERVIEW` (1280/326/954/42) — 总玩家数 / Agent / App / 今日新增
- `MOCK_TOOLS` (10 个工具) — 含 Codex/Claude Code/OpenCode/DeepSeek/豆包/Cursor/Dify/Kimi/n8n/通义千问
- `MOCK_PROVINCES` (10 个省份)
- `MOCK_LEVELS` (L1-L5 分布)
- `MOCK_TREND_DELTAS` (冠军/追赶/最快/冒头)
- `TOOL_COLOR_MAP` + `toolColor()` — 12 工具色板

### 4.3 页面修复

| 页 | 改动 |
|---|---|
| `/` | 删除内联 `HotTools`/`RankingPreview`,改用 `SectionHeader` + `TagCloud` + `RankingList`,fallback 全部走 `MOCK_*` |
| `/survey` | 引入 `PageShell` + `SectionHeader`,桌面 grid 改 `lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]`,成功页改用 `AgentPassportCard` compact,删除未用 imports (Crosshair/BlurText/Section/ToolBadge/CyberCard/toolColor) |
| `/map` | loader 改 `PageSkeletonMap`,fallback 用 `MOCK_PROVINCES`/`MOCK_TOOLS`/`MOCK_LEVELS`/`MOCK_OVERVIEW`,空榜单用 `EmptyState` + CTA,错误条用 `CyberCard` 包裹 + Retry 按钮 |
| `/ranking` | loader 改 `PageSkeletonList`,fallback 用 4 个 `MOCK_*`,tab 列表用 `RankingList`(按 tab 自动换 accent),空列表用 `EmptyState` |
| `/trends` | loader 改 `PageSkeletonChart`,hero 冠军/追赶/差值用 mock,长尾改 `RankingList`,ECharts 缺数据时用 `EmptyState` |

### 4.4 设计令牌

`src/app/globals.css` `:root` 新增:
- 表面令牌: `--bg-card-subtle` / `--bg-card-strong` / `--border` / `--border-strong`
- 语义 accent: `--accent-cyan` / `--accent-purple` / `--accent-green` / `--accent-amber`
- 工具色: `--brand-amber` / `--brand-rose`
- 稀有度: `--rarity-l1`..`--rarity-l5`
- 圆角: `--radius-sm/md/lg/xl`
- 头部注释: 整个 color & motion system 文档

### 4.5 已知风险 (记录供后续优化)

| 项 | 说明 | 优先级 |
|---|---|---|
| API 缺数据时显示 mock | 暂时是"演示数据"语义,生产环境需隐藏 mock 或加 `?demo=1` 开关 | 中 |
| `/map` filter 切换不显示中间态 | 切换 agent/app 后无 spinner,数据瞬切 | 低 |
| `ECharts` 高度 420 起步,长尾工具时高度 = count*48 最多 ~480 | 不会出现 0 高度但空状态需另行处理 | 低 |
| `AgentPassportCard` 默认头像依赖 `generateAvatarSvg`,SSR 稳定 | 已用确定性 hashCode 保证 | OK |
| `LiquidGlassCard` 仍占 79 次 (主力视觉卡片) | 短期保留,后续可抽象 | 中 |

### 4.6 验证

- `npm run lint`: 0 errors, 0 warnings
- `npm run build`: 9 static routes 全部生成成功
- TS 严格通过,Next 16.2.6 / React 19.2.4 兼容性 OK

### 4.7 修改的文件

```
新增:
- src/components/ui/PageShell.tsx
- src/components/ui/SectionHeader.tsx
- src/components/ui/CyberCard.tsx
- src/components/ui/StatCard.tsx
- src/components/ui/ToolBadge.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/PageSkeleton.tsx
- src/components/ui/RankingList.tsx
- src/components/ui/AgentPassportCard.tsx
- src/components/ui/index.ts
- src/data/mock.ts

重写:
- src/app/page.tsx
- src/app/map/page.tsx
- src/app/ranking/page.tsx
- src/app/trends/page.tsx
- src/app/survey/page.tsx

小改:
- src/app/globals.css (新增设计令牌层 + 头部注释)
- UI_FIX_REPORT.md (本文档)
```
