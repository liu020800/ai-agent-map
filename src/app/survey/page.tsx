"use client";

import { useMemo, useState } from "react";
import { levelLabel } from "@/lib/level";

const APP_TOOLS = ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Gemini", "通义", "元宝"];
const AGENT_TOOLS = ["OpenClaw", "Hermes", "Codex", "Claude Code", "OpenCode", "Cursor", "Dify", "n8n Agent"];
const PROVINCES = ["北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "山东", "福建", "河南", "其他"];

export default function SurveyPage() {
  const [province, setProvince] = useState("上海");
  const [city, setCity] = useState("");
  const [userType, setUserType] = useState<"app" | "agent">("app");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resultLevel, setResultLevel] = useState<number | null>(null);

  const toolOptions = userType === "app" ? APP_TOOLS : AGENT_TOOLS;
  const canSubmit = useMemo(() => province.trim().length > 0 && selectedTools.length > 0 && status !== "loading", [province, selectedTools, status]);

  function toggleTool(tool: string) {
    setSelectedTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setMessage("");
    setResultLevel(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, city: city.trim() || undefined, user_type: userType, tools: selectedTools }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "提交失败");

      setStatus("success");
      setMessage("提交成功！感谢参与 AI Agent 使用情况调查。");
      setResultLevel(body.ai_level ?? null);
      setSelectedTools([]);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "提交失败");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">AI 使用情况调查</h1>
      <p className="mt-3 text-slate-300">选择你使用的工具，系统会根据结果计算你的 AI 使用等级。</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            省份/直辖市
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white">
              {PROVINCES.map((item) => (<option key={item} value={item}>{item}</option>))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            城市（可选）
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="例如：杭州" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white placeholder:text-slate-500" />
          </label>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p>你是哪类用户？</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => { setUserType("app"); setSelectedTools([]); }} className={`rounded-xl border px-4 py-3 text-left transition ${userType === "app" ? "border-indigo-400/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}>
              <span className="block text-base font-semibold">AI App 用户</span>
              <span>豆包 / DeepSeek / Kimi / ChatGPT 等</span>
            </button>
            <button type="button" onClick={() => { setUserType("agent"); setSelectedTools([]); }} className={`rounded-xl border px-4 py-3 text-left transition ${userType === "agent" ? "border-indigo-400/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}>
              <span className="block text-base font-semibold">AI Agent 用户</span>
              <span>Codex / Claude Code / Dify / n8n / Cursor 等</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p>你常用的工具（可多选）</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {toolOptions.map((tool) => {
              const active = selectedTools.includes(tool);
              return (
                <button key={tool} type="button" onClick={() => toggleTool(tool)} className={`rounded-xl border px-4 py-3 text-left transition ${active ? "border-indigo-400/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}>
                  {tool}
                </button>
              );
            })}
          </div>
        </div>

        <button disabled={!canSubmit} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition disabled:cursor-not-allowed disabled:opacity-60">
          {status === "loading" ? "提交中..." : "提交我的 AI 使用情况"}
        </button>

        {message ? <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{message}</p> : null}
        {status === "success" && resultLevel ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            你的 AI 等级：<span className="font-semibold text-white">{levelLabel(resultLevel)}</span>
          </div>
        ) : null}
      </form>
    </main>
  );
}
