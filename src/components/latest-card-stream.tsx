"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Radio, Shield } from "lucide-react";
import { generateAvatarSvg } from "@/lib/avatar";
import { fetchLatestCards, type LatestCard } from "@/lib/api-client";
import { demoPassports } from "@/data/demo";
import { displayLevel } from "@/lib/display";

type Props = {
  title: string;
  eyebrow?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function normalizeCards(cards: LatestCard[]) {
  return cards.slice(0, 4);
}

export default function LatestCardStream({ title, eyebrow = "最新动态", ctaHref = "/share", ctaLabel = "查看分享页" }: Props) {
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

  const hasRealCards = cards.length > 0;
  const list = normalizeCards(hasRealCards ? cards : demoPassports);

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <motion.div initial={false} className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-neutral-500">
            <Radio className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
          <h2 className="text-xl font-medium tracking-[-0.02em] text-neutral-950 sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-neutral-500">{hasRealCards ? "最近生成的 AI 身份卡会显示在这里。" : "当前展示演示身份卡，真实记录会随用户提交逐步更新。"}</p>
        </div>
        <Link href={ctaHref} className="inline-flex items-center gap-1 self-start rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-50 sm:self-auto">
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {list.map((card, index) => (
          <motion.div
            key={`${card.card_slug || card.nickname}-${index}`}
            initial={false}
          >
            <Link
              href={card.card_slug ? `/share?slug=${card.card_slug}` : "/share"}
              className="group block h-full"
            >
              <article className="flex h-full min-h-[168px] flex-col rounded-lg border border-neutral-200 bg-white p-4 transition-colors duration-150 hover:bg-neutral-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
                      dangerouslySetInnerHTML={{ __html: generateAvatarSvg(card.avatar_seed, 56, card.ai_level, card.primary_tool) }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-950">{card.nickname || "匿名 Agent"}</p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{card.ai_level_name || displayLevel(card.ai_level)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-[10px] text-neutral-600">
                    {displayLevel(card.ai_level)}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <Shield className="h-3.5 w-3.5 text-neutral-500" />
                      常用工具
                    </span>
                    <span className="truncate font-medium text-neutral-950">{card.primary_tool || "Codex"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                      地区据点
                    </span>
                    <span className="truncate font-medium text-neutral-950">{card.province || "待填写"}</span>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <span className="text-[10px] tracking-[0.12em] text-neutral-400">{hasRealCards ? "最新记录" : "演示记录"} #{String(index + 1).padStart(2, "0")}</span>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
