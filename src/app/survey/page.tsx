"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { levelName, computeLevel } from "@/lib/level";
import { FadeIn } from "@/components/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Zap } from "lucide-react";

const APP_TOOLS = ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Claude", "Gemini", "通义千问", "腾讯元宝"];
const AGENT_TOOLS = ["Codex", "Claude Code", "OpenCode", "OpenClaw", "Hermes", "Cursor", "Dify", "n8n", "Trae", "CodeBuddy"];
const PROVINCES = [
  "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
  "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
  "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾",
  "内蒙古", "广西", "西藏", "宁夏", "新疆", "香港", "澳门", "其他",
];
const FREQUENCIES = ["偶尔使用", "每周使用", "每天使用", "工作主力", "已经形成自动化工作流"];
const PURPOSES = ["日常聊天", "写代码", "写作", "数据分析", "自动化工作流", "学习研究", "创意设计", "其他"];
const OCCUPATIONS = ["程序员", "产品经理", "设计师", "学生", "教师", "自媒体", "企业管理", "自由职业", "其他"];

const TOTAL_STEPS = 4;

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [province, setProvince] = useState("上海");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [userType, setUserType] = useState<"app" | "agent">("app");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [primaryTool, setPrimaryTool] = useState("");
  const [frequency, setFrequency] = useState("");
  const [purpose, setPurpose] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ ai_level: number; ai_level_name: string; card_slug: string; avatar_seed: string } | null>(null);

  // Anti-spam
  const honeypotRef = useRef("");
  const submitTimeRef = useRef(Date.now());

  useEffect(() => {
    submitTimeRef.current = Date.now();
  }, []);

  const toolOptions = userType === "app" ? APP_TOOLS : AGENT_TOOLS;
  const previewLevel = useMemo(() => computeLevel(userType, selectedTools), [userType, selectedTools]);

  const canNext = useMemo(() => {
    if (step === 1) return province.trim().length > 0;
    if (step === 2) return selectedTools.length > 0;
    if (step === 3) return frequency.length > 0;
    return true;
  }, [step, province, selectedTools, frequency]);

  function toggleTool(tool: string) {
    setSelectedTools((prev) => {
      const next = prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool];
      if (!next.includes(primaryTool)) setPrimaryTool(next[0] || "");
      return next;
    });
  }

  function togglePurpose(p: string) {
    setPurpose((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  const handleSubmit = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    const duration = Date.now() - submitTimeRef.current;

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || undefined,
          province,
          city: city.trim() || undefined,
          occupation: occupation || undefined,
          user_type: userType,
          tools: selectedTools,
          primary_tool: primaryTool || selectedTools[0],
          usage_frequency: frequency,
          usage_purpose: purpose.length > 0 ? purpose : undefined,
          honeypot: honeypotRef.current || undefined,
          submit_duration_ms: duration,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "提交失败");
      setStatus("success");
      setResult(body);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "提交失败");
    }
  }, [nickname, province, city, occupation, userType, selectedTools, primaryTool, frequency, purpose]);

  if (status === "success" && result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle2 className="h-10 w-10 text-emerald-400" /></div>
        </motion.div>
        <FadeIn delay={0.2}>
          <h1 className="text-3xl font-bold text-white">提交成功！</h1>
          <p className="mt-2 text-slate-400">你是第 <span className="font-bold text-indigo-300">{result.ai_level}</span> 级 AI 用户</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-8 py-6 backdrop-blur-sm">
            <p className="text-sm text-indigo-300">你的 AI 等级</p>
            <p className="mt-2 text-3xl font-bold text-white">{result.ai_level_name}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="flex gap-3">
            <a href={`/share?slug=${result.card_slug}`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25">
              <Send className="h-4 w-4" /> 查看我的卡片
            </a>
            <a href="/ranking" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm">查看排行榜</a>
          </div>
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

      {/* Progress bar */}
      <FadeIn delay={0.1}>
        <div className="mt-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? "bg-gradient-to-r from-indigo-500 to-blue-500" : "bg-white/10"}`} />
              <p className={`mt-1 text-xs ${i + 1 <= step ? "text-indigo-300" : "text-slate-600"}`}>
                {["基础信息", "工具选择", "使用强度", "确认提交"][i]}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Honeypot - hidden field */}
      <input type="text" name="website" value={honeypotRef.current} onChange={(e) => { honeypotRef.current = e.target.value; }} style={{ position: "absolute", left: "-9999px", opacity: 0 }} tabIndex={-1} autoComplete="off" />

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">基础信息</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-400">
                  昵称（可选）
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的昵称" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none" />
                </label>
                <label className="block text-sm text-slate-400">
                  职业
                  <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none">
                    <option value="">请选择</option>
                    {OCCUPATIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-400">
                  省份/直辖市
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none">
                    {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-400">
                  城市（可选）
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="例如：杭州" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">你是哪类用户？</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([
                  { key: "app" as const, title: "AI App 用户", desc: "豆包 / DeepSeek / Kimi / ChatGPT 等" },
                  { key: "agent" as const, title: "AI Agent 用户", desc: "Codex / Claude Code / Dify / n8n 等" },
                ]).map((opt) => (
                  <motion.button key={opt.key} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setUserType(opt.key); setSelectedTools([]); setPrimaryTool(""); }}
                    className={`rounded-xl border px-4 py-4 text-left transition-all ${userType === opt.key ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                    <span className="block text-sm font-semibold">{opt.title}</span>
                    <span className="mt-1 block text-xs opacity-70">{opt.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Tool Selection */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">选择工具（可多选）</h2>
                <div className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  <Zap className="h-3 w-3" /> {levelName(previewLevel)}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {toolOptions.map((tool) => {
                  const active = selectedTools.includes(tool);
                  return (
                    <motion.button key={tool} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => toggleTool(tool)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${active ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                      {tool}
                    </motion.button>
                  );
                })}
              </div>

              {selectedTools.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-400">主力工具</label>
                  <select value={primaryTool} onChange={(e) => setPrimaryTool(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none">
                    {selectedTools.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Usage */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">使用强度</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FREQUENCIES.map((f) => (
                  <motion.button key={f} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setFrequency(f)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${frequency === f ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                    {f}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">使用 AI 的主要目的（可多选）</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PURPOSES.map((p) => (
                  <motion.button key={p} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => togglePurpose(p)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition-all ${purpose.includes(p) ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">确认信息</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">地区</span><span className="text-white">{province}{city ? ` · ${city}` : ""}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">用户类型</span><span className="text-white">{userType === "agent" ? "AI Agent 用户" : "AI App 用户"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">工具</span><span className="text-white">{selectedTools.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">主力工具</span><span className="text-white">{primaryTool || selectedTools[0]}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">使用强度</span><span className="text-white">{frequency}</span></div>
                {purpose.length > 0 && <div className="flex justify-between"><span className="text-slate-400">使用目的</span><span className="text-white">{purpose.join(", ")}</span></div>}
                <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-slate-400">AI 等级</span><span className="font-bold text-indigo-300">{levelName(previewLevel)}</span></div>
              </div>
            </div>
            {message && status === "error" ? <p className="mt-4 text-center text-sm text-red-400">{message}</p> : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <FadeIn delay={0.2}>
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" /> 上一步
            </motion.button>
          )}
          {step < TOTAL_STEPS ? (
            <motion.button type="button" whileHover={canNext ? { scale: 1.02 } : {}} whileTap={canNext ? { scale: 0.98 } : {}}
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50">
              下一步 <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={status === "loading"}
              onClick={handleSubmit}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50">
              {status === "loading" ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 提交中...</>
              ) : (
                <><Send className="h-4 w-4" /> 提交</>
              )}
            </motion.button>
          )}
        </div>
      </FadeIn>
    </main>
  );
}
