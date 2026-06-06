"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Radio, Shield } from "lucide-react";
import { generateAvatarSvg } from "@/lib/avatar";
import { fetchLatestCards, type LatestCard } from "@/lib/api-client";

type Props = {
  title: string;
  eyebrow?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function normalizeCards(cards: LatestCard[]) {
  return cards.slice(0, 4);
}

export default function LatestCardStream({ title, eyebrow = "Latest Signals", ctaHref = "/share", ctaLabel = "查看分享页" }: Props) {
  const [cards, setCards] = useState<LatestCard[]>([]);

  useEffect(() => {
    let active = true;
    fetchLatestCards(12)
      .then((data) => {
        if (active) setCards(normalizeCards(data));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const list = normalizeCards(cards);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.66))] p-5 shadow-[0_0_40px_rgba(34,211,238,0.10)] backdrop-blur-xl sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      <motion.div initial={false} className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="title-font mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            <Radio className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
          <h2 className="title-font text-2xl font-black tracking-wide text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">最近生成的 Agent Passport 会写入这里，持续点亮全国信号。</p>
        </div>
        <Link href={ctaHref} className="inline-flex items-center gap-1 self-start rounded-full border border-cyan-300/16 bg-cyan-300/[0.06] px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.10] sm:self-auto">
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {list.length === 0 && (
          <div className="col-span-full rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.04] p-8 text-center text-sm text-cyan-100/75">
            暂无真实身份卡信号。用户完成身份卡生成后，最新记录会自动出现在这里。
          </div>
        )}
        {list.map((card, index) => (
          <motion.div
            key={`${card.card_slug || card.nickname}-${index}`}
            initial={false}
          >
            <Link
              href={card.card_slug ? `/share?slug=${card.card_slug}` : "/share"}
              className="group block h-full"
            >
              <article className="flex h-full min-h-[180px] flex-col rounded-2xl border border-white/[0.08] bg-black/30 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/24 hover:bg-black/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-[18px] border border-cyan-300/14 bg-black/50"
                      dangerouslySetInnerHTML={{ __html: generateAvatarSvg(card.avatar_seed, 56, card.ai_level, card.primary_tool) }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{card.nickname || "匿名 Agent"}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{card.ai_level_name || `Lv.${card.ai_level}`}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-cyan-300/18 bg-cyan-300/[0.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Lv.{card.ai_level}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Shield className="h-3.5 w-3.5 text-cyan-300" />
                      主力装备
                    </span>
                    <span className="truncate font-semibold text-white">{card.primary_tool || "Codex"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                      地区据点
                    </span>
                    <span className="truncate font-semibold text-white">{card.province || "浙江"}</span>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Signal #{String(index + 1).padStart(2, "0")}</span>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
