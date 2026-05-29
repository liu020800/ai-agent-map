"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { levelName, computeLevel } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Shield, Swords, MapPin, FileText, Sparkles, Zap, Check, User, Briefcase } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import DecryptedText from "@/components/react-bits/DecryptedText";
import BlurText from "@/components/react-bits/BlurText";

const APP_TOOLS = ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Claude", "Gemini", "通义千问", "腾讯元宝"];
const AGENT_TOOLS = ["Codex", "Claude Code", "OpenCode", "OpenClaw", "Hermes", "Cursor", "Dify", "n8n", "Trae", "CodeBuddy"];
const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","台湾","内蒙古","广西","西藏","宁夏","新疆","香港","澳门","其他"];
const FREQUENCIES = ["偶尔使用","每周使用","每天使用","工作主力","已经形成自动化工作流"];
const PURPOSES = ["日常聊天","写代码","写作","数据分析","自动化工作流","学习研究","创意设计","其他"];
const OCCUPATIONS = ["程序员","产品经理","设计师","学生","教师","自媒体","企业管理","自由职业","其他"];

const STEPS = [
  { icon: Swords, label: "选择装备", sub: "选择你使用的 AI 工具" },
  { icon: FileText, label: "使用场景", sub: "你的使用习惯和场景" },
  { icon: MapPin, label: "地区据点", sub: "你的所在位置" },
  { icon: Shield, label: "生成档案", sub: "确认并生成身份卡" },
];

const RARITY_NAMES = ["", "普通", "稀有", "史诗", "传说", "神话"];
const RARITY_COLORS = ["", "text-slate-400", "text-blue-400", "text-purple-400", "text-amber-400", "text-red-400"];
const RARITY_BORDER = ["", "border-slate-500/20", "border-blue-500/30", "border-purple-500/30", "border-amber-500/30", "border-red-500/30"];
const RARITY_GLOW = ["", "glow-r", "glow-sr", "glow-ssr", "glow-ur", "glow-lr"];

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [province, setProvince] = useState("上海");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [userType, setUserType] = useState<"app" | "agent">("agent");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [primaryTool, setPrimaryTool] = useState("");
  const [frequency, setFrequency] = useState("");
  const [purpose, setPurpose] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ ai_level: number; ai_level_name: string; card_slug: string; avatar_seed: string } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prevLevelRef = useRef(1);
  const honeypotRef = useRef("");
  const submitTimeRef = useRef(Date.now());

  useEffect(() => { submitTimeRef.current = Date.now(); }, []);

  const toolOptions = userType === "app" ? APP_TOOLS : AGENT_TOOLS;
  const previewLevel = useMemo(() => computeLevel(userType, selectedTools), [userType, selectedTools]);
  const previewAvatar = useMemo(() => generateAvatarSvg(nickname + previewLevel + selectedTools.join(""), 20), [nickname, previewLevel, selectedTools]);

  useEffect(() => {
    if (previewLevel > prevLevelRef.current) { setLevelUp(previewLevel); setTimeout(() => setLevelUp(null), 3000); }
    prevLevelRef.current = previewLevel;
  }, [previewLevel]);

  const canNext = step === 1 ? selectedTools.length > 0 : step === 2 ? frequency.length > 0 : step === 3 ? province.trim().length > 0 : true;

  function toggleTool(tool: string) {
    setSelectedTools(prev => {
      const next = prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool];
      if (!next.includes(primaryTool)) setPrimaryTool(next[0] || "");
      return next;
    });
  }

  const handleSubmit = useCallback(async () => {
    setStatus("loading"); setMessage("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || undefined, province, city: city.trim() || undefined,
          occupation: occupation || undefined, user_type: userType, tools: selectedTools,
          primary_tool: primaryTool || selectedTools[0], usage_frequency: frequency,
          usage_purpose: purpose.length > 0 ? purpose : undefined,
          honeypot: honeypotRef.current || undefined,
          submit_duration_ms: Date.now() - submitTimeRef.current,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "提交失败");
      setStatus("success"); setResult(body);
    } catch (e) { setStatus("error"); setMessage(e instanceof Error ? e.message : "提交失败"); }
  }, [nickname, province, city, occupation, userType, selectedTools, primaryTool, frequency, purpose]);

  if (status === "success" && result) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-2xl shadow-indigo-500/30">
          <Check className="h-10 w-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-black text-white">身份档案已生成</h1>
        <p className="text-slate-400">{result.ai_level_name}</p>
        <button onClick={() => router.push(`/share?slug=${result.card_slug}`)}
          className="btn-primary">
          <Shield className="h-4 w-4" /> 查看我的 AI Agent Passport
        </button>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1100px] px-6 py-8">
      {/* Level Up Animation */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -20 }}
            className="fixed inset-x-0 top-28 z-50 flex justify-center"
          >
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-8 py-4 backdrop-blur-xl shadow-2xl shadow-amber-500/20">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">Level Up!</p>
                  <p className="text-lg font-black text-white">{levelName(levelUp)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400 uppercase mb-2">Identity Scanner</p>
        <BlurText text="创建你的 AI 身份档案" className="text-3xl font-black text-white sm:text-4xl" delay={0.1} />
        <p className="mt-2 text-sm text-slate-500">完成以下步骤，生成你的 Agent 身份卡</p>
      </motion.div>

      {/* Layout: Steps + Content + Preview */}
      <div className="grid gap-6 lg:grid-cols-[200px_1fr_220px]">
        {/* Left: Step indicator */}
        <div className="hidden lg:block">
          <div className="sticky top-28 space-y-2">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const active = step === idx;
              const done = step > idx;
              return (
                <motion.div key={idx} animate={{ opacity: active ? 1 : 0.4 }} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${active ? "bg-indigo-500/10 border border-indigo-500/20" : ""}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${done ? "bg-emerald-500/20 text-emerald-400" : active ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500"}`}>
                    {done ? <Check className="h-4 w-4" /> : idx}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                    <p className="text-[10px] text-slate-600">{s.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile step bar */}
        <div className="flex items-center justify-center gap-2 lg:hidden">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${step > i ? "w-8 bg-indigo-500" : step === i + 1 ? "w-8 bg-indigo-500/50" : "w-4 bg-white/10"}`} />
          ))}
        </div>

        {/* Center: Content */}
        <div>
          <AnimatePresence mode="wait">
            {/* Step 1: Equipment */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                {/* User type toggle */}
                <div className="mb-6 flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                  {(["agent", "app"] as const).map((t) => (
                    <button key={t} onClick={() => { setUserType(t); setSelectedTools([]); setPrimaryTool(""); }}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${userType === t ? "bg-indigo-500/20 text-indigo-300 shadow-lg" : "text-slate-400 hover:text-white"}`}>
                      {t === "agent" ? "🤖 Agent 工具" : "📱 AI 应用"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {toolOptions.map((tool) => {
                    const selected = selectedTools.includes(tool);
                    return (
                      <motion.button key={tool} onClick={() => toggleTool(tool)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className={`relative rounded-xl border p-4 text-left transition-all ${selected
                          ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        }`}>
                        {selected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                        <p className="text-sm font-bold text-white">{tool}</p>
                        {selected && <p className="mt-1 text-[10px] font-semibold text-indigo-400">已装备</p>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Usage */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <SpotlightCard className="p-6" spotlightColor="rgba(99, 102, 241, 0.06)">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                    <Zap className="h-5 w-5 text-indigo-400" /> 使用频率
                  </h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {FREQUENCIES.map((f) => (
                      <motion.button key={f} onClick={() => setFrequency(f)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`rounded-xl border p-3.5 text-left text-sm transition-all ${frequency === f
                          ? "border-indigo-500/40 bg-indigo-500/10 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12]"}`}>
                        {f}
                        {frequency === f && <Check className="inline ml-2 h-3.5 w-3.5 text-indigo-400" />}
                      </motion.button>
                    ))}
                  </div>
                </SpotlightCard>

                <SpotlightCard className="mt-4 p-6" spotlightColor="rgba(99, 102, 241, 0.06)">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                    <FileText className="h-5 w-5 text-purple-400" /> 使用场景（可多选）
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {PURPOSES.map((p) => {
                      const sel = purpose.includes(p);
                      return (
                        <motion.button key={p} onClick={() => setPurpose(prev => sel ? prev.filter(x => x !== p) : [...prev, p])} whileTap={{ scale: 0.95 }}
                          className={`rounded-full border px-4 py-2 text-sm transition-all ${sel
                            ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                            : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12]"}`}>
                          {p}
                        </motion.button>
                      );
                    })}
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <SpotlightCard className="p-6" spotlightColor="rgba(34, 211, 238, 0.06)">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                    <MapPin className="h-5 w-5 text-cyan-400" /> 你的据点
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500">昵称</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="你的代号"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500">职业</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <select value={occupation} onChange={e => setOccupation(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white focus:border-indigo-500/40 focus:outline-none">
                          <option value="">请选择</option>
                          {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500">省份</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <select value={province} onChange={e => setProvince(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white focus:border-indigo-500/40 focus:outline-none">
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500">城市</label>
                      <input value={city} onChange={e => setCity(e.target.value)} placeholder="例如：杭州"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <SpotlightCard className="p-6" spotlightColor="rgba(99, 102, 241, 0.06)">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-5">
                    <Shield className="h-5 w-5 text-indigo-400" /> 身份档案确认
                  </h2>

                  <div className="flex gap-5 mb-6">
                    <div className={`h-24 w-24 overflow-hidden rounded-xl border-2 flex-shrink-0 ${RARITY_BORDER[previewLevel]} ${RARITY_GLOW[previewLevel]}`}
                      dangerouslySetInnerHTML={{ __html: previewAvatar }} />
                    <div className="flex-1">
                      <p className="text-2xl font-black text-white">{nickname || "未命名 Agent"}</p>
                      <p className={`mt-1 text-sm font-semibold ${RARITY_COLORS[previewLevel]}`}>
                        ★ {RARITY_NAMES[previewLevel]} · {levelName(previewLevel)}
                      </p>
                      {occupation && <p className="mt-1 text-xs text-slate-500">{occupation}</p>}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    {[
                      ["地区据点", `${province}${city ? ` · ${city}` : ""}`],
                      ["装备", selectedTools.join("、")],
                      ["主力装备", primaryTool || selectedTools[0]],
                      ["使用强度", frequency],
                      ...(purpose.length > 0 ? [["使用场景", purpose.join("、")]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-white text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}
                  </div>

                  {message && status === "error" && <p className="mt-4 text-center text-sm text-red-400">{message}</p>}
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(s => s - 1)}
                className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> 上一步
              </motion.button>
            )}
            {step < 4 ? (
              <motion.button whileHover={canNext ? { scale: 1.02 } : {}} whileTap={canNext ? { scale: 0.98 } : {}} disabled={!canNext}
                onClick={() => setStep(s => s + 1)} className="btn-primary ml-auto disabled:opacity-40 disabled:cursor-not-allowed">
                下一步 <ArrowRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={status === "loading"} onClick={handleSubmit}
                className="btn-primary ml-auto">
                {status === "loading"
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 生成中...</>
                  : <><Sparkles className="h-4 w-4" /> 生成我的 AI Agent Passport</>}
              </motion.button>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.06)">
              <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Live Preview</p>
              <div className={`mx-auto h-24 w-24 overflow-hidden rounded-xl border-2 ${RARITY_BORDER[previewLevel]} ${RARITY_GLOW[previewLevel]}`}
                dangerouslySetInnerHTML={{ __html: previewAvatar }} />
              <p className="mt-3 text-center text-sm font-bold text-white truncate">{nickname || "Agent"}</p>
              <div className="mt-2 flex justify-center">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${RARITY_COLORS[previewLevel]} ${RARITY_BORDER[previewLevel]}`}>
                  {RARITY_NAMES[previewLevel] || "—"}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">等级</span>
                  <span className="font-medium text-white">{levelName(previewLevel).split(" ")[0]}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">装备</span>
                  <span className="font-medium text-white">{selectedTools.length}</span>
                </div>
              </div>
              {/* Level progress */}
              <div className="mt-3">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                    animate={{ width: `${(previewLevel / 5) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </main>
  );
}
