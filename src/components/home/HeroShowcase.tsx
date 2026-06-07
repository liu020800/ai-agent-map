"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map, Shield, Crosshair, Trophy, Workflow } from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import AgentPassportPreview from "./AgentPassportPreview";
import { demoOverview, demoProvinces, demoTools } from "@/data/demo";
import { displayPlus, hasOverviewData } from "@/lib/display";

type HeroOverview = {
  total: number;
  agentUsers: number;
  appUsers: number;
  todayNew: number;
};

type HeroShowcaseProps = {
  overview?: HeroOverview | null;
  topProvinces?: string[];
  topTool?: { name: string; count: number } | null;
  hasRealData?: boolean;
};

export default function HeroShowcase({ overview, topProvinces = [], topTool = null, hasRealData: hasRealDataProp }: HeroShowcaseProps) {
  const hasRealData = hasRealDataProp ?? hasOverviewData(overview);
  const safeOverview: HeroOverview = hasRealData && overview ? overview : demoOverview;
  const safeTopProvinces = topProvinces.length ? topProvinces : demoProvinces.slice(0, 3).map((province) => province.name);
  const safeTopTool = topTool ?? demoTools[0];
  const stats = [
    { key: "total", label: "已生成身份卡", value: safeOverview.total },
    { key: "agentUsers", label: "Agent 用户", value: safeOverview.agentUsers },
    { key: "appUsers", label: "App 用户", value: safeOverview.appUsers },
    { key: "todayNew", label: "今日新增", value: safeOverview.todayNew },
  ];

  return (
    <section className="relative isolate border-b border-neutral-200 bg-[#fafafa] pb-14 pt-28 sm:pt-32 lg:pb-18">
      <div className="shell relative z-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="max-w-[680px]">
          <h1
            className="display-font max-w-[660px] text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.04] tracking-[-0.055em] text-neutral-950"
          >
            记录你的 AI 工具栈，生成可分享身份卡
          </h1>

          <p className="mt-5 max-w-[580px] text-[15px] leading-7 text-neutral-600 sm:text-base">
            选几个常用 AI 工具，生成一张好玩的 AI 身份卡，也看看大家都在用什么。
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/survey" className="btn-rb-fill">
              <Shield className="h-5 w-5" />
              <span>生成我的身份卡</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/map" className="btn-rb-ghost">
              <Map className="h-5 w-5" />
              <span>查看全国玩家地图</span>
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span>无需登录</span>
            <span className="text-gray-300">·</span>
            <span>30 秒生成</span>
            <span className="text-gray-300">·</span>
            <span>可下载分享卡</span>
            <span className="text-gray-300">·</span>
            <span>查看工具排行</span>
          </div>

          <motion.dl initial={false} className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-y border-neutral-200 py-5">
            {stats.map((stat) => {
              return (
                <div key={stat.key}>
                  <dt className="text-xs text-neutral-500">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-medium tabular-nums text-neutral-950">
                    <CountUp to={stat.value} duration={1.2} />
                  </dd>
                </div>
              );
            })}
          </motion.dl>
        </div>

        <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between px-2 pt-1">
                <div>
                  <p className="text-sm font-medium text-neutral-950">身份卡预览</p>
                  <p className="text-xs text-neutral-500">生成后可下载和分享</p>
                </div>
                <span className="text-xs text-neutral-400">Preview</span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="order-2 flex items-center justify-center lg:order-1">
                  <div className="w-full max-w-[300px]" data-passport-card>
                    <AgentPassportPreview />
                  </div>
                </div>
                <div className="order-1 flex flex-col gap-3 lg:order-2">
                  <SideMetric icon={Trophy} label="热门地区" value={safeTopProvinces[0] || "广东"} sub={`${hasRealData ? "真实" : "演示"}排行 · 次热 ${safeTopProvinces[1] || "上海"}`} />
                  <SideMetric icon={Workflow} label="常用工具" value={safeTopTool.name} sub={`${safeTopTool.count} 人使用 · ${hasRealData ? "用户提交记录" : "演示数据"}`} />
                  <SideMetric icon={Crosshair} label="今日新增" value={displayPlus(safeOverview.todayNew)} sub="近 24h 新增身份" />
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}

function SideMetric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="truncate text-sm font-medium text-neutral-950">{value}</p>
          <p className="text-xs text-neutral-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}
