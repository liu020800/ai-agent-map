"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, Share2, X, Check, MessageCircle, Smartphone } from "lucide-react";
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

  const platforms = [
    {
      name: "保存图片",
      icon: "🖼️",
      action: onDownload,
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "复制文案",
      icon: "📋",
      action: copyText,
      color: "from-blue-500 to-cyan-500",
      badge: copied === "text" ? "已复制!" : null,
    },
    {
      name: "复制链接",
      icon: "🔗",
      action: copyLink,
      color: "from-indigo-500 to-blue-500",
      badge: copied === "link" ? "已复制!" : null,
    },
    {
      name: "微信好友",
      icon: "💬",
      action: () => { onDownload(); setOpen(false); },
      color: "from-green-500 to-emerald-500",
      hint: "保存图片后发给好友",
    },
    {
      name: "朋友圈",
      icon: "📱",
      action: () => { onDownload(); setOpen(false); },
      color: "from-green-600 to-green-500",
      hint: "保存图片后发朋友圈",
    },
    {
      name: "QQ",
      icon: "🐧",
      action: () => window.open(getQQShareUrl(title, shareText, shareUrl, imageUrl || ""), "_blank"),
      color: "from-sky-500 to-blue-500",
    },
    {
      name: "QQ 空间",
      icon: "🌟",
      action: () => window.open(getQZoneShareUrl(title, shareText, shareUrl, imageUrl || ""), "_blank"),
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "微博",
      icon: "🔥",
      action: () => window.open(getWeiboShareUrl(shareText, shareUrl, imageUrl), "_blank"),
      color: "from-red-500 to-rose-500",
    },
    {
      name: "小红书",
      icon: "📕",
      action: () => { copyText(); onDownload(); },
      color: "from-red-600 to-red-400",
      hint: "保存图片 + 复制文案后发布",
    },
    {
      name: "抖音",
      icon: "🎵",
      action: () => { copyText(); onDownload(); },
      color: "from-slate-700 to-slate-500",
      hint: "保存图片 + 复制文案后发布",
    },
  ];

  return (
    <>
      {/* Trigger button */}
      <motion.button onClick={handleNativeShare} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="btn-lusion !text-xs !px-5 !py-2.5">
        <Share2 className="h-4 w-4" /> 分享身份卡
      </motion.button>

      {/* Share modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center" onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0a0a0f]/95 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">分享到</h3>
                <button onClick={() => setOpen(false)} className="rounded-full p-1 text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              {/* WeChat hint */}
              <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-medium">微信分享：</span>
                </div>
                <p className="mt-1 text-xs text-neutral-400">点击下方「保存图片」后，打开微信粘贴发送给好友或发朋友圈</p>
              </div>

              {/* Platform grid */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {platforms.map((p) => (
                  <motion.button key={p.name} onClick={p.action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.06]">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[10px] font-medium text-neutral-300">{p.badge || p.name}</span>
                    {p.hint && <span className="text-[9px] text-neutral-500">{p.hint}</span>}
                  </motion.button>
                ))}
              </div>

              {/* Share text preview */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] text-neutral-500">分享文案预览</p>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed">{shareText}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
