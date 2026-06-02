"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Smartphone, Link2, Copy, Download, MessageCircle, QrCode, Send, PlaySquare } from "lucide-react";
import { getQQShareUrl, getQZoneShareUrl, getWeiboShareUrl, generateShareText } from "@/lib/wechat-share";

type SharePanelProps = {
  title: string;
  userNumber: number | null;
  levelName: string;
  primaryTool: string;
  slug: string | null;
  imageUrl?: string;
  onDownload: () => void;
};

export default function SharePanel({ title, userNumber, levelName, primaryTool, slug, imageUrl, onDownload }: SharePanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);

  const shareUrl = slug ? `https://liusq.icu/share?slug=${slug}` : "https://liusq.icu";
  const shareText = generateShareText(userNumber, levelName, primaryTool);
  const supportsNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    setOpen(true);
  }, [title, shareText, shareUrl]);

  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  }, [shareText]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  }, [shareUrl]);

  const platformSections = useMemo(() => ([
    {
      title: "核心操作",
      items: [
        { name: "保存图片", icon: Download, action: onDownload, hint: "下载 PNG 身份卡", color: "#00ffc8" },
        { name: copied === "text" ? "文案已复制" : "复制文案", icon: Copy, action: copyText, hint: "复制分享文案", color: "#a855f7" },
        { name: copied === "link" ? "链接已复制" : "复制链接", icon: Link2, action: copyLink, hint: "复制页面地址", color: "#00d4ff" },
        ...(supportsNativeShare ? [{ name: "系统分享", icon: Share2, action: handleNativeShare, hint: "调用系统分享面板", color: "#fbbf24" }] : []),
      ],
    },
    {
      title: "国内平台",
      items: [
        { name: "微信好友", icon: MessageCircle, action: () => { onDownload(); setOpen(false); }, hint: "保存图片后发给好友", color: "#22c55e" },
        { name: "朋友圈", icon: Smartphone, action: () => { onDownload(); setOpen(false); }, hint: "保存图片后发朋友圈", color: "#4ade80" },
        { name: "QQ", icon: Send, action: () => window.open(getQQShareUrl(title, shareText, shareUrl, imageUrl || ""), "_blank"), hint: "打开 QQ 分享", color: "#60a5fa" },
        { name: "QQ 空间", icon: QrCode, action: () => window.open(getQZoneShareUrl(title, shareText, shareUrl, imageUrl || ""), "_blank"), hint: "分享到 QQ 空间", color: "#38bdf8" },
        { name: "微博", icon: Share2, action: () => window.open(getWeiboShareUrl(shareText, shareUrl, imageUrl), "_blank"), hint: "分享到微博", color: "#fb7185" },
        { name: "小红书", icon: Copy, action: () => { copyText(); onDownload(); }, hint: "保存图片 + 文案发布", color: "#f43f5e" },
        { name: "抖音", icon: PlaySquare, action: () => { copyText(); onDownload(); }, hint: "保存图片 + 文案发布", color: "#e879f9" },
        { name: "B站", icon: PlaySquare, action: () => { copyText(); onDownload(); }, hint: "保存图片 + 发动态", color: "#60a5fa" },
      ],
    },
  ]), [copied, copyLink, copyText, handleNativeShare, imageUrl, onDownload, shareText, shareUrl, supportsNativeShare, title]);

  return (
    <>
      <motion.button onClick={handleNativeShare} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-lusion !px-5 !py-2.5 !text-xs">
        <Share2 className="h-4 w-4" /> 分享身份卡
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center" onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 100, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.98 }} transition={{ type: "spring", stiffness: 180, damping: 24 }} onClick={(event) => event.stopPropagation()} className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#07080d]/95 p-6 backdrop-blur-2xl sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,255,200,0.14),transparent_26%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.18),transparent_30%)]" />
              <div className="relative">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="title-font text-[10px] uppercase tracking-[0.3em] text-[#00ffc8]/65">Share Command Center</p>
                    <h3 className="mt-2 title-font text-2xl font-black text-white sm:text-3xl">分享到国内平台</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">优先调用系统分享；如果浏览器不支持，就使用这里的保存图片、复制文案和平台跳转方案。</p>
                  </div>
                  <button onClick={() => setOpen(false)} aria-label="关闭分享面板" className="rounded-full border border-white/[0.04] bg-white/[0.015] p-2 text-neutral-400 transition hover:text-white"><X className="h-5 w-5" aria-hidden="true" /></button>
                </div>

                <div className="mb-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[28px] border border-emerald-500/15 bg-emerald-500/5 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm text-emerald-300"><Smartphone className="h-4 w-4" /><span className="font-medium">微信分享提示</span></div>
                    <p className="text-sm leading-7 text-emerald-100/75">当前阶段先使用“保存图片 + 复制文案”的方式分享到微信好友或朋友圈，这样兼容性最好，也最适合移动端发布。</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-5">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/35">分享文案预览</p>
                    <p className="text-sm leading-7 text-white/72">{shareText}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/45">
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">{levelName}</span>
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">{primaryTool}</span>
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">{slug ? `slug:${slug}` : "homepage"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {platformSections.map((section) => (
                    <div key={section.title}>
                      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/35">
                        <div className="h-px flex-1 bg-white/10" />
                        <span>{section.title}</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((platform) => (
                          <motion.button key={platform.name} onClick={platform.action} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="group flex min-h-[120px] flex-col items-start justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-left transition-all hover:border-white/[0.16] hover:bg-white/[0.05]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.01]" style={{ boxShadow: `0 0 24px ${platform.color}20` }}>
                              <platform.icon className="h-4.5 w-4.5" style={{ color: platform.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{platform.name}</p>
                              <p className="mt-1 text-xs leading-5 text-white/42">{platform.hint}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
