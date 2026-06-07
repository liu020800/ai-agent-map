"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map, Trophy, Sparkles, ChevronRight, Shield, Bot, Crosshair, BarChart3 } from "lucide-react";
import HeroShowcase from "@/components/home/HeroShowcase";
import LatestCardStream from "@/components/latest-card-stream";
import { PageShell, Section, RankingList } from "@/components/ui";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import TiltedCard from "@/components/react-bits/TiltedCard";
import { fetchRanking, type RankingData } from "@/lib/api-client";
import { demoRankingData } from "@/data/demo";
import { hasOverviewData } from "@/lib/display";

import ChinaSvgMap from "@/components/ChinaSvgMap";

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingData | null>(null);

  useEffect(() => {
    let active = true;
    fetchRanking()
      .then((data) => {
        if (active) setRanking(data);
      })
      .catch(() => {
        if (active) setRanking(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasRealData = hasOverviewData(ranking?.overview);
  const displayRanking = hasRealData && ranking ? ranking : demoRankingData;
  const overview = displayRanking.overview;
  const tools = displayRanking.tools;
  const provinces = displayRanking.provinces;
  const topTool = tools[0] ?? null;
  const topProvinces = provinces.slice(0, 3).map((province) => province.name);

  const displayTools = tools.slice(0, 5);

  return (
    <main id="main-content" className="relative min-h-screen">
      <HeroShowcase overview={overview} topProvinces={topProvinces} topTool={topTool} />

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow"><Crosshair className="h-3.5 w-3.5 text-blue-600" /> 热门工具</p>
              <h2 className="mt-3 text-[clamp(28px,4vw,44px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-950">大家常用的 AI 工具</h2>
              <p className="section-desc mt-3">基于用户登记的工具栈统计，生成身份卡后会自动更新。</p>
            </div>
            <Link href="/ranking" className="btn-rb-ghost"><Trophy className="h-4 w-4" /><span>查看完整榜单</span></Link>
            <Link href="/share" className="btn-rb-ghost"><Sparkles className="h-4 w-4" /><span>找回身份卡</span></Link>
          </div>
          {displayTools.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              暂无真实工具统计。用户生成第一张身份卡后，这里会自动显示工具热度。
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {displayTools.map((tool, index) => {
              const palette = ["67,232,249", "163,230,53", "240,171,252", "96,165,250", "251,113,133"];
              const accent = palette[index] ?? palette[0];
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16,1,0.3,1] }}
                >
                  <TiltedCard className="h-full">
                    <SpotlightCard
                      className="h-full"
                      spotlightColor={accent}
                      spotlightSize={260}
                    >
                      <div className="flex h-full flex-col gap-3 p-5">
                        <div className="flex items-center justify-between">
                          <span className="btn-pill">0{index + 1}</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${accent})` }} />
                        </div>
                        <p className="text-[20px] font-black tracking-wide text-gray-950">{tool.name}</p>
                        <p className="text-[12px] text-gray-500">{index === 0 ? "编程常用" : index === 1 ? "写作与推理" : index === 2 ? "开源工具" : index === 3 ? "通用助手" : "自动化工作流"}</p>
                        <div className="mt-auto flex items-baseline gap-1">
                          <span className="text-[22px] font-black text-gray-950">{tool.count}</span>
                          <span className="text-[11px] text-gray-500">人使用</span>
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltedCard>
                </motion.div>
              );
            })}
          </div>
          )}
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-eyebrow"><BarChart3 className="h-3.5 w-3.5 text-blue-600" /> 全国地图</p>
                  <h2 className="mt-3 text-[clamp(26px,3.4vw,38px)] font-black tracking-[-0.02em] text-gray-950">全国 AI 玩家地图</h2>
                  <p className="section-desc mt-3">每一张身份卡都会进入地区统计，看看不同城市的朋友在用什么。</p>
                </div>
                <Link href="/map" className="btn-rb-ghost"><Map className="h-4 w-4" /><span>查看玩家地图</span><ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
                <div className="h-[420px] bg-slate-50 p-3">
                  <ChinaSvgMap data={provinces} />
                </div>
                <div className="border-t border-gray-200 p-5 lg:border-l lg:border-t-0">
                  <p className="mb-4 section-eyebrow text-gray-500">省份使用排行</p>
                  <RankingList
                    empty="这里还没有用户数据，成为第一个生成身份卡的人。"
                    items={provinces.slice(0, 5).map((province, index) => ({
                      name: province.name,
                      count: province.value,
                      accent: ["#a3e635", "#67e8f9", "#f0abfc", "#60a5fa", "#fb7185"][index] ?? "#67e8f9",
                      trend: "flat",
                    }))}
                  />
                </div>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="section-eyebrow text-blue-600">生成身份卡</p>
              <h2 className="mt-3 text-[clamp(22px,2.6vw,30px)] font-black tracking-[-0.02em] text-gray-950">记录你的 AI 工具栈</h2>
              <p className="mt-3 text-[14px] leading-7 text-gray-600">选择常用工具、使用场景和地区，30 秒生成可下载、可分享的 AI 身份卡。</p>
              <div className="mt-6">
                <Link href="/survey" className="btn-rb-fill w-full !justify-center"><Shield className="h-5 w-5" /><span>生成身份卡</span><ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-[12px] text-gray-500">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] tracking-[0.16em] text-gray-400">Step 01</p>
                  <p className="mt-2 font-semibold text-gray-950">选择工具</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] tracking-[0.16em] text-gray-400">Step 02</p>
                  <p className="mt-2 font-semibold text-gray-950">选择场景</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] tracking-[0.16em] text-gray-400">Step 03</p>
                  <p className="mt-2 font-semibold text-gray-950">选择地区</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] tracking-[0.16em] text-gray-400">Step 04</p>
                  <p className="mt-2 font-semibold text-gray-950">生成身份卡</p>
                </div>
              </div>
            </motion.aside>
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <LatestCardStream title="最新生成的身份卡" eyebrow="最新动态" ctaHref="/share" ctaLabel="查看分享页" />
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell width="narrow">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 bg-neutral-50" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] border border-blue-100 bg-blue-50">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-[clamp(28px,4.4vw,52px)] font-black tracking-[-0.02em] text-gray-950">现在生成你的 AI 身份卡</h2>
              <p className="mx-auto mt-4 max-w-[640px] text-[15px] leading-7 text-gray-600">选完常用工具和地区，就能拿到一张可保存、可分享的 AI 身份卡。</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/survey" className="btn-rb-fill"><Shield className="h-5 w-5" /><span>开始生成</span><ArrowRight className="h-4 w-4" /></Link>
                <Link href="/ranking" className="btn-rb-ghost"><Trophy className="h-5 w-5" /><span>查看榜单</span></Link>
              </div>
              <p className="mt-6 text-xs text-gray-400">无需登录 · 30 秒生成 · 可下载分享</p>
            </div>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}

