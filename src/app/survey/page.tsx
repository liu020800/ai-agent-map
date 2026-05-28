"use client";

import { useMemo, useState } from "react";
import { levelLabel } from "@/lib/level";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";

const APP_TOOLS = ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Gemini", "通义", "元宝"];
const AGENT_TOOLS = ["OpenClaw", "Hermes", "Codex", "Claude Code", "OpenCode", "Cursor", "Dify", "n8n Agent"];
const PROVINCES = [
  "北京", "天津", "上海", "重庆",
  "河北", "山西", "辽宁", "吉林", "黑龙江",
  "江苏", "浙江", "安徽", "福建", "江西", "山东",
  "河南", "湖北", "湖南", "广东", "海南",
  "四川", "贵州", "云南", "陕西", "甘肃", "青海",
  "台湾", "内蒙古", "广西", "西藏", "宁夏", "新疆",
  "香港", "澳门", "其他",
];
const FREQUENCIES = ["每天使用", "每周几次", "偶尔使用", "刚开始使用"];
const OCCUPATIONS = ["程序员", "产品经理", "设计师", "学生", "教师", "自媒体", "企业管理", "自由职业", "其他"];

export default function SurveyPage() {
  const [province, setProvince] = useState("上海");
  const [city, setCity] = useState("");
  const [userType, setUserType] = useState<"app" | "agent">("app");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("");
  const [occupation, setOccupation] = useState("");
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
        body: JSON.stringify({
          province,
          city: city.trim() || undefined,
          user_type: userType,
          tools: selectedTools,
          frequency: frequency || undefined,
          occupation: occupation || undefined,
        }),
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

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <ScaleIn>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </ScaleIn>
        <FadeIn delay={0.2}>
          <h1 className="text-3xl font-bold text-white">提交成功！</h1>
          <p className="mt-2 text-slate-300">{message}</p>
        </FadeIn>
        {resultLevel ? (
          <FadeIn delay={0.3}>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-8 py-6 backdrop-blur-sm">
              <p className="text-sm text-indigo-300">你的 AI 等级</p>
              <p className="mt-2 text-3xl font-bold text-white">{levelLabel(resultLevel)}</p>
            </div>
          </FadeIn>
        ) : null}
        <FadeIn delay={0.4}>
          <a href="/share" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25">
            生成分享卡片 <Send className="h-4 w-4" />
          </a>
        </FadeIn>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">AI 使用情况调查</h1>
        <p className="mt-3 text-slate-400">选择你使用的工具，系统会根据结果计算你的 AI 使用等级。</p>
      </FadeIn>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Region */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white">地区信息</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                省份/直辖市
                <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none">
                  {PROVINCES.map((item) => (<option key={item} value={item}>{item}</option>))}
                </select>
              </label>
              <label className="block text-sm text-slate-400">
                城市（可选）
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="例如：杭州" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none" />
              </label>
            </div>
          </div>
        </FadeIn>

        {/* User Type */}
        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white">用户类型</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                { key: "app" as const, title: "AI App 用户", desc: "豆包 / DeepSeek / Kimi / ChatGPT 等" },
                { key: "agent" as const, title: "AI Agent 用户", desc: "Codex / Claude Code / Dify / n8n / Cursor 等" },
              ]).map((opt) => (
                <motion.button
                  key={opt.key}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setUserType(opt.key); setSelectedTools([]); }}
                  className={`rounded-xl border px-4 py-4 text-left transition-all ${userType === opt.key ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}
                >
                  <span className="block text-sm font-semibold">{opt.title}</span>
                  <span className="mt-1 block text-xs opacity-70">{opt.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Tools */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white">常用工具（可多选）</h2>
            <StaggerContainer className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {toolOptions.map((tool) => {
                const active = selectedTools.includes(tool);
                return (
                  <StaggerItem key={tool}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleTool(tool)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${active ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}
                    >
                      {tool}
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </FadeIn>

        {/* Frequency & Occupation */}
        <FadeIn delay={0.25}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white">使用习惯</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                使用频率
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none">
                  <option value="">请选择</option>
                  {FREQUENCIES.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              </label>
              <label className="block text-sm text-slate-400">
                职业
                <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none">
                  <option value="">请选择</option>
                  {OCCUPATIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              </label>
            </div>
          </div>
        </FadeIn>

        {/* Submit */}
        <FadeIn delay={0.3}>
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.01 } : {}}
            whileTap={canSubmit ? { scale: 0.99 } : {}}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <><Send className="h-4 w-4" /> 提交我的 AI 使用情况</>
            )}
          </motion.button>
        </FadeIn>

        {message && status === "error" ? <p className="text-center text-sm text-red-400">{message}</p> : null}
      </form>
    </main>
  );
}

function ScaleIn({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>{children}</motion.div>;
}
