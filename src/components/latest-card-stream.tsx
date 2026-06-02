"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { generateAvatarSvg } from "@/lib/avatar";
import { fetchLatestCards, type LatestCard } from "@/lib/api-client";

type Props = {
  title: string;
  eyebrow?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function LatestCardStream({ title, eyebrow = "Latest Signals", ctaHref = "/share", ctaLabel = "查看分享页" }: Props) {
  const [cards, setCards] = useState<LatestCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLatestCards(12)
      .then((data) => {
        if (active) setCards(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const list = cards.slice(0, 4);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="title-font mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#00ffc8]/60">{eyebrow}</p>
          <h2 className="title-font text-2xl font-black tracking-wide text-white sm:text-3xl">{title}</h2>
        </div>
        <Link href={ctaHref} className="hidden items-center gap-1 text-sm tracking-wider text-white/40 transition-colors hover:text-[#00ffc8] sm:flex">
          {ctaLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {list.length > 0 ? (
          list.map((card, index) => (
            <motion.div key={`${card.card_slug || card.nickname}-${index}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <Link href={card.card_slug ? `/share?slug=${card.card_slug}` : "/share"} className="block">
                <LiquidGlassCard className="h-full p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.1} cornerRadius={24}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-[18px] border border-white/[0.04] bg-black/30" dangerouslySetInnerHTML={{ __html: generateAvatarSvg(card.avatar_seed, 56, card.ai_level, card.primary_tool) }} />
                      <div>
                        <p className="font-semibold text-white">{card.nickname}</p>
                        <p className="text-xs text-white/40">{card.ai_level_name}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">L{card.ai_level}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="text-white/38">主力装备</span><span className="font-medium text-white">{card.primary_tool}</span></div>
                    <div className="flex items-center justify-between gap-3"><span className="text-white/38">地区据点</span><span className="font-medium text-white">{card.province}</span></div>
                  </div>
                </LiquidGlassCard>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-4">
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-center">
              {loaded ? (
                <>
                  <p className="text-base font-semibold text-white">还没有玩家写入身份卡</p>
                  <p className="mt-3 text-sm leading-7 text-white/45">成为全国第一位 Agent 玩家，点亮第一条信号。</p>
                  <div className="mt-5 flex justify-center">
                    <Link href="/survey" className="btn-lusion !px-5 !py-3 !text-xs">立即生成身份卡</Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40">正在读取最新信号...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
