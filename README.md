# AI Agent Map - AI 用户调查网站

全国 AI 工具 / AI Agent 使用情况调查网站。

## 技术栈

- Next.js 15 (App Router)
- TypeScript (strict mode)
- TailwindCSS
- Framer Motion
- ECharts (中国地图 + 趋势图)
- Supabase (数据库)
- Cloudflare Pages (部署)
- Cloudflare Functions (API)

## 功能

- **首页**: 总参与人数、Agent/App 用户数、今日新增、热门工具、地图预览
- **调查页**: 分步骤表单、进度条、工具多选、AI 等级实时预览、防刷机制
- **排行榜**: AI 工具 Top 10、省份 Top 10、等级分布
- **中国地图**: 省份热力图、本地化地图 JSON、Agent/App 筛选
- **趋势榜**: AI 工具热度横向柱状图
- **分享卡片**: 像素头像、唯一 slug、下载 PNG、复制链接

## 防刷机制

- Honeypot 隐藏字段
- 提交时间检测（< 3s 拒绝）
- IP 频率限制（每小时最多 5 次）
- Cloudflare Turnstile（可配置）
- 只统计 status=valid 的数据

## 本地开发

```bash
cp .env.example .env.local
# 填写环境变量
npm install
npm run dev
```

## 部署到 Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy out --project-name ai-agent-map
```

## 环境变量

| 变量 | 说明 |
|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 项目 URL |
| NEXT_PUBLIC_SUPSTYLES_ANON_KEY | Supabase anon key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (仅服务端) |
| CLOUDFLARE_API_TOKEN | Cloudflare API token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 账户 ID |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Turnstile 站点密钥 (可选) |
| TURNSTILE_SECRET_KEY | Turnstile 服务端密钥 (可选) |
| NEXT_PUBLIC_SITE_URL | 网站 URL |

## 数据库 Schema

```sql
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  province text not null,
  city text,
  occupation text,
  user_type text not null default 'app',
  tools text[] not null default '{}',
  primary_tool text,
  usage_frequency text,
  usage_purpose text[],
  ai_level integer not null default 1,
  ai_level_name text not null default 'L1 AI 聊天用户',
  avatar_seed text,
  card_slug text unique,
  visitor_hash text,
  ip_hash text,
  turnstile_passed boolean default false,
  honeypot text,
  submit_duration_ms integer,
  status text default 'valid',
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_users_province on public.users(province);
create index if not exists idx_users_primary_tool on public.users(primary_tool);
create index if not exists idx_users_user_type on public.users(user_type);
create index if not exists idx_users_status on public.users(status);
create index if not exists idx_users_created_at on public.users(created_at);
create index if not exists idx_users_visitor_hash on public.users(visitor_hash);
create index if not exists idx_users_ip_hash on public.users(ip_hash);
create index if not exists idx_users_card_slug on public.users(card_slug);

-- RLS
alter table public.users enable row level security;
create policy "anon_select_users" on public.users for select to anon using (true);
create policy "anon_insert_users" on public.users for insert to anon with check (true);
```
