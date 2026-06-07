"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Download, MapPin, MessageCircle, RefreshCw, Search, Share2, Sparkles, Trophy } from "lucide-react";
import { PageShell, Section } from "@/components/ui";
import {
  getCardById,
  getCardByVisitorId,
  getOrCreateVisitorId,
  readCachedAgentCard,
  regenerateCardImage,
  searchCardsByNickname,
  STORAGE_KEYS,
  type AgentCardRecord,
} from "@/lib/api-client";
import { getQZoneShareUrl, getWeiboShareUrl } from "@/lib/wechat-share";

function readCardIdFromUrl() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("cardId") || params.get("slug") || "";
}

function normalizeSignalStrength(value: unknown, fallback = 87): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(100, Math.round(n));
}
function buildShareText(card: AgentCardRecord) {
  return `我已点亮 AI Agent Map，生成了我的全国 AI 信号身份卡。\n\n昵称：${card.nickname}\nID：${card.cardId}\n节点：${card.province}${card.city || ""}\n工具：${card.tools.join(" / ")}\n\n你也来生成一张：\n${card.shareUrl}`;
}

async function downloadCardImage(imageUrl: string, cardId: string) {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `AI-Agent-Card-${cardId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(imageUrl, "_blank", "noopener");
    alert("当前浏览器不支持直接下载，已打开原图。你可以长按图片或右键保存。");
  }
}

function SearchRecover({
  onSelect,
}: {
  onSelect: (card: AgentCardRecord) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [results, setResults] = useState<AgentCardRecord[]>([]);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!nickname.trim()) return;
    setMessage("正在查询...");
    try {
      const cards = await searchCardsByNickname(nickname.trim());
      setResults(cards);
      setMessage(cards.length ? `找到 ${cards.length} 张身份卡` : "没有找到匹配身份卡");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "查询失败");
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-300/14 bg-cyan-300/[0.04] p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="输入昵称找回身份卡"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
        />
        <button type="button" onClick={handleSearch} className="btn-rb-ghost justify-center">
          <Search className="h-4 w-4" />
          查询
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-cyan-100/70">{message}</p>}
      {results.length > 0 && (
        <div className="mt-3 grid gap-2">
          {results.map((card) => (
            <button
              key={card.cardId}
              type="button"
              onClick={() => onSelect(card)}
              className="rounded-xl border border-white/10 bg-black/35 p-3 text-left text-sm text-white/75 transition hover:border-cyan-300/30"
            >
              <span className="font-semibold text-white">{card.nickname}</span>
              <span className="ml-2 text-white/45">{card.province}{card.city} · {card.cardId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShareContent() {
  const [card, setCard] = useState<AgentCardRecord | null>(() => readCachedAgentCard());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [showWechat, setShowWechat] = useState(false);

  useEffect(() => {
    let active = true;
    const visitorId = getOrCreateVisitorId();
    const urlCardId = readCardIdFromUrl();
    const storedCardId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEYS.cardId) || "" : "";
    const cardId = urlCardId || storedCardId;
    const task = cardId ? getCardById(cardId) : getCardByVisitorId(visitorId);
    task.then((found) => {
      if (!active) return;
      if (found) {
        setCard(found);
      } else {
        setCard(null);
        window.localStorage.removeItem(STORAGE_KEYS.cardId);
        window.localStorage.removeItem(STORAGE_KEYS.cardCache);
        setMessage("没有找到身份卡数据");
      }
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      setMessage(error instanceof Error ? error.message : "身份卡读取失败");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const shareText = useMemo(() => (card ? buildShareText(card) : ""), [card]);
  const signalStrength = useMemo(() => normalizeSignalStrength((card as { signalStrength?: unknown; signal_strength?: unknown } | null)?.signalStrength ?? (card as { signalStrength?: unknown; signal_strength?: unknown } | null)?.signal_strength), [card]);

  const copyText = useCallback(async () => {
    if (!card) return;
    await navigator.clipboard?.writeText(shareText);
    setCopied("text");
    setTimeout(() => setCopied(null), 1800);
  }, [card, shareText]);

  const copyLink = useCallback(async () => {
    if (!card) return;
    await navigator.clipboard?.writeText(card.shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 1800);
  }, [card]);

  const handleDownload = useCallback(async () => {
    if (!card?.imageUrl) return;
    await downloadCardImage(card.imageUrl, card.cardId);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1800);
  }, [card]);

  const handleWebShare = useCallback(async () => {
    if (!card) return;
    if (navigator.share) {
      await navigator.share({ title: card.shareTitle, text: shareText, url: card.shareUrl });
    } else {
      await copyLink();
    }
  }, [card, copyLink, shareText]);

  const handleRegenerate = useCallback(async () => {
    if (!card) return;
    const ok = window.confirm("重新生成会消耗一次图片生成额度，并替换当前身份卡，确定继续吗？");
    if (!ok) return;
    setMessage("正在重新生成身份卡图片...");
    try {
      const updated = await regenerateCardImage(card.cardId, getOrCreateVisitorId());
      setCard(updated);
      setMessage("身份卡图片已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "重新生成失败");
    }
  }, [card]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 pb-16 pt-0">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[140px]" />
        <div className="absolute right-[8%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          <div className="mb-8 text-center">
            <p className="title-font text-[11px] tracking-[0.18em] text-blue-600">分享身份卡</p>
            <h1 className="title-font mt-4 text-4xl font-black text-gray-950 sm:text-6xl">你的 AI 身份卡生成好了</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600">
              可以保存图片，也可以复制文案发给朋友。刷新页面不会再次调用生图模型。
            </p>
          </div>

          {loading && (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">正在读取已保存身份卡...</div>
          )}

          {!loading && !card && (
            <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
              <h2 className="title-font text-3xl font-black text-gray-950">没有找到身份卡数据</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">请先生成一张 AI 身份卡。</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/survey" className="btn-rb-fill justify-center">立即生成身份卡</Link>
                <button type="button" onClick={() => setMessage("请在下方输入昵称找回")} className="btn-rb-ghost justify-center">通过昵称找回</button>
              </div>
              <div className="mt-6">
                <SearchRecover onSelect={setCard} />
              </div>
              {message && <p className="mt-4 text-sm text-cyan-100/70">{message}</p>}
            </div>
          )}

          {card && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_420px]">
              <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-3 shadow-sm">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.shareTitle} className="mx-auto max-h-[78vh] w-full rounded-[22px] object-contain" />
                ) : (
                  <div className="flex min-h-[520px] items-center justify-center rounded-[22px] border border-gray-200 text-gray-500">身份卡图片暂不可用</div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="title-font text-[10px] tracking-[0.18em] text-blue-600">身份卡信息</p>
                  <h2 className="title-font mt-2 text-2xl font-black text-gray-950">{card.nickname}</h2>
                  <p className="mt-2 font-mono text-sm text-gray-500">{card.cardId}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p><MapPin className="mr-2 inline h-4 w-4 text-blue-600" />{card.province}{card.city}</p>
                    <p><Sparkles className="mr-2 inline h-4 w-4 text-violet-600" />{card.tools.join(" / ")}</p>
                    <p>{card.signature || "用 AI 扩展自己的能力边界"}</p>
                    <p>信号强度：{signalStrength}%</p>
                    <p className="text-xs text-gray-400">创建时间：{new Date(card.createdAt).toLocaleString("zh-CN")}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-3">
                    <button onClick={handleDownload} className="btn-rb-fill justify-center">
                      {downloaded ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      {downloaded ? "已下载" : "下载身份卡"}
                    </button>
                    <button onClick={copyText} className="btn-rb-ghost justify-start">
                      {copied === "text" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                      {copied === "text" ? "已复制文案" : "复制分享文案"}
                    </button>
                    <button onClick={copyLink} className="btn-rb-ghost justify-start">
                      {copied === "link" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
                      {copied === "link" ? "已复制链接" : "复制分享链接"}
                    </button>
                    <button onClick={handleWebShare} className="btn-rb-ghost justify-start">
                      <Share2 className="h-4 w-4" />
                      系统分享
                    </button>
                    <button
                      onClick={() => window.open(getQZoneShareUrl(card.shareTitle, card.shareDescription, card.shareUrl, card.shareImageUrl), "_blank", "noopener")}
                      className="btn-rb-ghost justify-start"
                    >
                      <Trophy className="h-4 w-4" />
                      分享到 QQ 空间
                    </button>
                    <button onClick={() => setShowWechat(true)} className="btn-rb-ghost justify-start">
                      <MessageCircle className="h-4 w-4" />
                      微信分享
                    </button>
                    <button onClick={() => window.open(getWeiboShareUrl(shareText, card.shareUrl), "_blank", "noopener")} className="btn-rb-ghost justify-start">
                      <Share2 className="h-4 w-4" />
                      分享到微博
                    </button>
                    <button onClick={handleRegenerate} className="btn-rb-ghost justify-start">
                      <RefreshCw className="h-4 w-4" />
                      重新生成身份卡
                    </button>
                  </div>
                  {message && <p className="mt-4 text-sm text-cyan-100/70">{message}</p>}
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-gray-950">分享文案</p>
                  <p className="whitespace-pre-line rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-600">{shareText}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/map" className="btn-rb-ghost justify-center"><MapPin className="h-4 w-4" />地图</Link>
                  <Link href="/ranking" className="btn-rb-ghost justify-center"><Trophy className="h-4 w-4" />排行</Link>
                </div>
                <p className="text-center text-xs text-gray-400">AI 生成内容 · 仅供娱乐分享，不代表真实身份认证。</p>
              </aside>
            </div>
          )}
        </PageShell>
      </Section>

      {showWechat && card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-cyan-300/20 bg-slate-950 p-5 shadow-[0_0_80px_rgba(34,211,238,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="title-font text-2xl font-black text-white">微信分享方式</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/65">
                  1. 长按保存身份卡图片{"\n"}2. 复制下方分享文案{"\n"}3. 打开微信发送给好友或朋友圈
                </p>
              </div>
              <button onClick={() => setShowWechat(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/65">关闭</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[260px_1fr]">
              <img src={card.imageUrl} alt={card.shareTitle} className="w-full rounded-2xl border border-white/10" />
              <div>
                <p className="text-sm text-white/55">身份卡 ID</p>
                <p className="font-mono text-cyan-200">{card.cardId}</p>
                <p className="mt-4 text-sm text-white/55">分享链接</p>
                <p className="break-all text-cyan-100/80">{card.shareUrl}</p>
                <p className="mt-4 whitespace-pre-line rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white/75">{shareText}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={copyText} className="btn-rb-fill">复制文案</button>
                  <button onClick={handleDownload} className="btn-rb-ghost">下载图片</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
