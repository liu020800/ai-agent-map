"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map, Trophy, Sparkles, ChevronRight, Shield, Bot, Crosshair, Radar } from "lucide-react";
import HeroShowcase from "@/components/home/HeroShowcase";
import LatestCardStream from "@/components/latest-card-stream";
import { PageShell, Section, RankingList } from "@/components/ui";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import TiltedCard from "@/components/react-bits/TiltedCard";
import { fetchRanking, type RankingData } from "@/lib/api-client";

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

  const overview = ranking?.overview ?? null;
  const tools = ranking?.tools ?? [];
  const provinces = ranking?.provinces ?? [];
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
              <p className="section-eyebrow"><Crosshair className="h-3.5 w-3.5 text-cyan-200" /> EQUIPMENT ARSENAL</p>
              <h2 className="mt-3 text-[clamp(28px,4vw,44px)] font-black leading-[1.05] tracking-[-0.02em] text-white">热门 AI 装备</h2>
              <p className="section-desc mt-3">把鼠标移到卡上,看每件装备的霓虹辉光。</p>
            </div>
            <Link href="/ranking" className="btn-rb-ghost"><Trophy className="h-4 w-4" /><span>查看完整榜单</span></Link>
            <Link href="/share" className="btn-rb-ghost"><Sparkles className="h-4 w-4" /><span>找回身份卡</span></Link>
          </div>
          {displayTools.length === 0 ? (
            <div className="rounded-3xl border border-cyan-300/12 bg-cyan-300/[0.04] p-8 text-center text-sm text-cyan-100/75">
              暂无真实装备统计。用户生成第一张身份卡后，这里会自动显示真实工具热度。
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
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${accent})`, boxShadow: `0 0 12px rgb(${accent})` }} />
                        </div>
                        <p className="text-[20px] font-black tracking-wide text-white">{tool.name}</p>
                        <p className="text-[12px] text-white/45">{index === 0 ? "代码 Agent 主力" : index === 1 ? "Claude 系列" : index === 2 ? "开源替代" : index === 3 ? "国产大模型" : "低代码编排"}</p>
                        <div className="mt-auto flex items-baseline gap-1">
                          <span className="text-[22px] font-black text-white">{tool.count}</span>
                          <span className="text-[11px] text-white/40">次装配</span>
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
              className="relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-4 border-b border-white/[0.08] p-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-eyebrow"><Radar className="h-3.5 w-3.5 text-cyan-200" /> SIGNAL RADAR</p>
                  <h2 className="mt-3 text-[clamp(26px,3.4vw,38px)] font-black tracking-[-0.02em] text-white">全国 AI 信号正在点亮</h2>
                  <p className="section-desc mt-3">每一张身份卡都会写入全国图谱,地图就是主舞台。</p>
                </div>
                <Link href="/map" className="btn-rb-ghost"><Map className="h-4 w-4" /><span>查看完整雷达</span><ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
                <div className="h-[460px] bg-[#05080d]/78 p-3">
                  <ChinaSvgMap data={provinces} />
                </div>
                <div className="border-t border-white/[0.08] p-5 lg:border-l lg:border-t-0">
                  <p className="mb-4 section-eyebrow text-white/55">省份信号榜</p>
                  <RankingList
                    empty="这里还没有 Agent 信号,成为第一个点亮它的人。"
                    items={(provinces.length ? provinces.slice(0, 5) : [
                      { name: "北京", value: 256 },
                      { name: "上海", value: 230 },
                      { name: "广东", value: 198 },
                      { name: "浙江", value: 152 },
                      { name: "江苏", value: 128 },
                    ]).map((province, index) => ({
                      name: province.name,
                      count: province.value,
                      accent: ["#a3e635", "#67e8f9", "#f0abfc", "#60a5fa", "#fb7185"][index] ?? "#67e8f9",
                      trend: index === 0 ? "up" : "flat",
                      delta: index === 0 ? "Hot" : undefined,
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
              className="relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              <p className="section-eyebrow text-lime-200">LIVE LOADOUT</p>
              <h2 className="mt-3 text-[clamp(22px,2.6vw,30px)] font-black tracking-[-0.02em] text-white">开启你的 AI 身份</h2>
              <p className="mt-3 text-[14px] leading-7 text-white/55">装备越硬,等级越高,30 秒生成可下载可分享的 Agent Passport。</p>
              <div className="mt-6">
                <Link href="/survey" className="btn-rb-fill w-full !justify-center"><Shield className="h-5 w-5" /><span>启动身份扫描</span><ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-[12px] text-white/45">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Step 01</p>
                  <p className="mt-2 font-semibold text-white">选择装备</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Step 02</p>
                  <p className="mt-2 font-semibold text-white">选择场景</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Step 03</p>
                  <p className="mt-2 font-semibold text-white">选择地区</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Step 04</p>
                  <p className="mt-2 font-semibold text-white">生成 Passport</p>
                </div>
              </div>
            </motion.aside>
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <LatestCardStream title="最新身份卡信号流" eyebrow="Latest Passports" ctaHref="/share" ctaLabel="查看分享页" />
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell width="narrow">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(163,230,53,0.08),rgba(236,72,153,0.10))] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-100/20 bg-black/38">
                <Sparkles className="h-6 w-6 text-cyan-100" />
              </div>
              <h2 className="text-[clamp(28px,4.4vw,52px)] font-black tracking-[-0.02em] text-white">现在生成你的 AI Agent Passport</h2>
              <p className="mx-auto mt-4 max-w-[640px] text-[15px] leading-7 text-white/62">不是普通问卷,是一次 AI 装备扫描。选完工具,你就拿到一张可保存、可分享、可点亮地图的身份卡。</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/survey" className="btn-rb-fill"><Shield className="h-5 w-5" /><span>开始扫描</span><ArrowRight className="h-4 w-4" /></Link>
                <Link href="/ranking" className="btn-rb-ghost"><Trophy className="h-5 w-5" /><span>查看榜单</span></Link>
              </div>
              <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.22em] text-white/32">No Login · 30 Seconds · Shareable</p>
            </div>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}

