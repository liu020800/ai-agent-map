# AI Agent Map (MVP) 部署指南

## 1. Cloudflare Pages 连接 GitHub

1. 打开 Cloudflare Dashboard -> Pages
2. 点击「Create a project」->「Connect to Git」
3. 选择仓库：`liu020800/ai-agent-map`
4. 构建设置：
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output directory: `.next`
5. 环境变量（Production + Preview 都加）：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://tjkziibeofwvthekawam.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 service role key（仅服务端使用，不要放到前端代码里）

## 2. Supabase 数据库

已在控制台执行建表 SQL（`public.users`）。  
如果要重置表结构，可再次执行：

```sql
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  city text,
  user_type text not null default 'app',
  tools text[] not null default '{}',
  ai_level integer not null default 1,
  created_at timestamptz not null default now()
);
```

## 3. 本地开发

```bash
cp .env.local.example .env.local   # 若提供模板
# 或手动填写：
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

## 4. 下一步建议

- 增加排行榜/地图真实数据聚合
- 增加用户等级计算逻辑（L1-L5）
- 增加分享卡片生成页
- 接入 ECharts 中国地图
- 开启 Cloudflare 自定义域名 + HTTPS
