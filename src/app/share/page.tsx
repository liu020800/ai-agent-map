"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { levelLabel } from "@/lib/level";

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export default function SharePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");
  const [generating, setGenerating] = useState(false);

  const shareText = useMemo(
    () => `我是${name}，${levelLabel(level)}，主力工具：${tool}`,
    [name, level, tool]
  );

  async function handleDownload() {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "ai-agent-share.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">生成分享卡片</h1>
      <p className="mt-3 text-slate-300">填写信息后一键生成可分享的等级卡片图片。</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <label className="block text-sm text-slate-300">
            你的昵称
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" />
          </label>

          <label className="block text-sm text-slate-300">
            AI 等级
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white">
              {LEVEL_OPTIONS.map((lv) => (
                <option key={lv} value={lv}>{levelLabel(lv)}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            主力工具
            <input value={tool} onChange={(e) => setTool(e.target.value)} placeholder="例如：Codex + Claude Code" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white placeholder:text-slate-500" />
          </label>

          <button onClick={handleDownload} disabled={generating} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition disabled:cursor-not-allowed disabled:opacity-60">
            {generating ? "生成中..." : "下载分享图片"}
          </button>
        </section>

        <section className="flex items-stretch">
          <div ref={cardRef} className="flex w-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-blue-600/20 to-slate-900 p-6 text-left shadow-xl">
            <div>
              <p className="text-sm text-indigo-200">AI Agent 用户身份卡</p>
              <p className="mt-3 text-2xl font-semibold text-white">{name}</p>
              <p className="mt-2 text-sm text-indigo-100">{levelLabel(level)}</p>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              主力工具：{tool}
            </div>
            <p className="mt-6 text-xs text-indigo-200">ai-agent-map.com（示例）</p>
          </div>
        </section>
      </div>

      <p className="mt-6 text-sm text-slate-400">分享文案：{shareText}</p>
    </main>
  );
}
