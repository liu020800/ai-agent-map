"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { levelName, computeLevel } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { FadeIn } from "@/components/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Shield, Swords, MapPin, FileText, Sparkles, Zap } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import DecryptedText from "@/components/react-bits/DecryptedText";

const APP_TOOLS = ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Claude", "Gemini", "通义千问", "腾讯元宝"];
const AGENT_TOOLS = ["Codex", "Claude Code", "OpenCode", "OpenClaw", "Hermes", "Cursor", "Dify", "n8n", "Trae", "CodeBuddy"];
const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","台湾","内蒙古","广西","西藏","宁夏","新疆","香港","澳门","其他"];
const FREQUENCIES = ["偶尔使用","每周使用","每天使用","工作主力","已经形成自动化工作流"];
const PURPOSES = ["日常聊天","写代码","写作","数据分析","自动化工作流","学习研究","创意设计","其他"];
const OCCUPATIONS = ["程序员","产品经理","设计师","学生","教师","自媒体","企业管理","自由职业","其他"];

const STEPS = [
  { icon: Swords, label: "选择装备" },
  { icon: FileText, label: "使用场景" },
  { icon: MapPin, label: "地区据点" },
  { icon: Shield, label: "生成档案" },
];

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
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prevLevelRef = useRef(1);
  const honeypotRef = useRef("");
  const submitTimeRef = useRef(Date.now());

  useEffect(() => { submitTimeRef.current = Date.now(); }, []);

  const toolOptions = userType === "app" ? APP_TOOLS : AGENT_TOOLS;
  const previewLevel = useMemo(() => computeLevel(userType, selectedTools), [userType, selectedTools]);
  const previewAvatar = useMemo(() => generateAvatarSvg(nickname + previewLevel + selectedTools.join(""), 20), [nickname, previewLevel, selectedTools]);
  const rarity = ["", "普通", "稀有", "史诗", "传说", "神话"][previewLevel];
  const rarityColor = ["", "text-slate-400", "text-blue-400", "text-purple-400", "text-amber-400", "text-red-400"][previewLevel];

  useEffect(() => {
    if (previewLevel > prevLevelRef.current) { setLevelUp(previewLevel); setTimeout(() => setLevelUp(null), 2500); }
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
        body: JSON.stringify({ nickname: nickname.trim() || undefined, province, city: city.trim() || undefined, occupation: occupation || undefined, user_type: userType, tools: selectedTools, primary_tool: primaryTool || selectedTools[0], usage_frequency: frequency, usage_purpose: purpose.length > 0 ? purpose : undefined, honeypot: honeypotRef.current || undefined, submit_duration_ms: Date.now() - submitTimeRef.current }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "提交失败");
      setStatus("success"); setResult(body);
    } catch (e) { setStatus("error"); setMessage(e instanceof Error ? e.message : "提交失败"); }
  }, [nickname, province, city, occupation, userType, selectedTools, primaryTool, frequency, purpose]);

  if (status === "success" && result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8 }}>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
            <Shield className="h-12 w-12 text-cyan-400" />
          </div>
        </motion.div>
        <FadeIn delay={0.3}>
          <h1 className="text-3xl font-bold text-white"><DecryptedText text="身份档案生成完成！" speed={40} /></h1>
          <p className="mt-2 text-slate-400">你的 AI 身份已录入全国 Agent 地图</p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-8 py-6">
            <p className="text-xs uppercase tracking-widest text-cyan-400">AI Level</p>
            <p className="mt-2 text-3xl font-black text-white">{result.ai_level_name}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.5}>
          <a href={`/share?slug=${result.card_slug}`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25">
            <Shield className="h-4 w-4" /> 查看我的 AI 身份卡
          </a>
        </FadeIn>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">AI 身份扫描</h1>
        <p className="mt-2 text-slate-400">完成以下步骤，生成你的 AI Agent 身份档案。</p>
      </FadeIn>

      {/* Steps */}
      <FadeIn delay={0.1}>
        <div className="mt-8 flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon; const active = i + 1 <= step; const current = i + 1 === step;
            return (
              <div key={i} className="flex-1">
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${current ? "bg-cyan-500/10 border border-cyan-500/30" : active ? "bg-white/[0.03]" : ""}`}>
                  <Icon className={`h-4 w-4 ${active ? "text-cyan-400" : "text-slate-600"}`} />
                  <span className={`text-xs font-medium ${active ? "text-white" : "text-slate-600"}`}>{s.label}</span>
                </div>
                <div className={`mt-1 h-1 rounded-full transition-all ${i + 1 <= step ? "bg-gradient-to-r from-cyan-500 to-indigo-500" : "bg-white/5"}`} />
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Level up */}
      <AnimatePresence>
        {levelUp && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 backdrop-blur-xl shadow-lg shadow-amber-500/20">
            <p className="text-center text-sm font-bold text-amber-300">⬆ LEVEL UP：<DecryptedText text={levelName(levelUp)} speed={30} /></p>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="text" name="website" value={honeypotRef.current} onChange={e => { honeypotRef.current = e.target.value; }} style={{ position: "absolute", left: "-9999px" }} tabIndex={-1} autoComplete="off" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6 space-y-5">
            <SpotlightCard className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-indigo-500/30" dangerouslySetInnerHTML={{ __html: previewAvatar }} />
              <div>
                <p className="text-sm font-bold text-white">{nickname || "未命名 Agent"}</p>
                <p className={`text-xs font-medium ${rarityColor}`}>★ {rarity} · {levelName(previewLevel)}</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white"><Swords className="h-4 w-4 text-cyan-400" />选择你的 AI 装备</h2>
                <div className="flex items-center gap-1 text-xs text-cyan-300"><Sparkles className="h-3 w-3" />{levelName(previewLevel)}</div>
              </div>
              <div className="mb-4 flex gap-2">
                {(["app", "agent"] as const).map(t => (
                  <button key={t} onClick={() => { setUserType(t); setSelectedTools([]); }}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${userType === t ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-white/5 text-slate-400 border border-white/10"}`}>
                    {t === "app" ? "AI App" : "AI Agent"}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {toolOptions.map(tool => {
                  const active = selectedTools.includes(tool);
                  return (
                    <SpotlightCard key={tool} spotlightColor={active ? "rgba(34, 211, 238, 0.2)" : "rgba(99, 102, 241, 0.1)"}
                      className={`cursor-pointer rounded-xl border p-3 text-left text-sm transition-all ${active ? "border-cyan-500/50 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/10" : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"}`}>
                      <div onClick={() => toggleTool(tool)}>
                        <span className="font-medium">{tool}</span>
                        {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 inline-block rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">已装备</motion.span>}
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
              {selectedTools.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs text-slate-500">主力装备</label>
                  <select value={primaryTool} onChange={e => setPrimaryTool(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none">
                    {selectedTools.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </SpotlightCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6 space-y-5">
            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><Zap className="h-4 w-4 text-cyan-400" />使用强度</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FREQUENCIES.map(f => (
                  <SpotlightCard key={f} spotlightColor={frequency === f ? "rgba(34, 211, 238, 0.2)" : "rgba(99, 102, 241, 0.1)"}
                    className={`cursor-pointer rounded-xl border p-3 text-left text-sm transition-all ${frequency === f ? "border-cyan-500/50 bg-cyan-500/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"}`}>
                    <div onClick={() => setFrequency(f)}>{f}</div>
                  </SpotlightCard>
                ))}
              </div>
            </SpotlightCard>
            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="mb-4 text-sm font-bold text-white">使用场景（可多选）</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PURPOSES.map(p => (
                  <SpotlightCard key={p} spotlightColor={purpose.includes(p) ? "rgba(34, 211, 238, 0.2)" : "rgba(99, 102, 241, 0.1)"}
                    className={`cursor-pointer rounded-xl border p-3 text-left text-sm transition-all ${purpose.includes(p) ? "border-cyan-500/50 bg-cyan-500/10 text-white" : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"}`}>
                    <div onClick={() => setPurpose(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>{p}</div>
                  </SpotlightCard>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6">
            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><MapPin className="h-4 w-4 text-cyan-400" />选择你的地区据点</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-400">昵称<input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="你的代号" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none" /></label>
                <label className="block text-sm text-slate-400">职业<select value={occupation} onChange={e => setOccupation(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-cyan-500/50 focus:outline-none"><option value="">请选择</option>{OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
                <label className="block text-sm text-slate-400">省份<select value={province} onChange={e => setProvince(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-cyan-500/50 focus:outline-none">{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
                <label className="block text-sm text-slate-400">城市<input value={city} onChange={e => setCity(e.target.value)} placeholder="例如：杭州" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none" /></label>
              </div>
            </SpotlightCard>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6">
            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><Shield className="h-4 w-4 text-cyan-400" />身份档案确认</h2>
              <div className="flex gap-4 mb-4">
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-indigo-500/30" dangerouslySetInnerHTML={{ __html: previewAvatar }} />
                <div>
                  <p className="text-lg font-bold text-white">{nickname || "未命名 Agent"}</p>
                  <p className={`text-sm font-medium ${rarityColor}`}>★ {rarity} · {levelName(previewLevel)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">地区据点</span><span className="text-white">{province}{city ? ` · ${city}` : ""}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">装备</span><span className="text-white">{selectedTools.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">主力装备</span><span className="text-cyan-300 font-medium">{primaryTool || selectedTools[0]}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">使用强度</span><span className="text-white">{frequency}</span></div>
              </div>
              {message && status === "error" && <p className="mt-3 text-center text-sm text-red-400">{message}</p>}
            </SpotlightCard>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeIn delay={0.2}>
        <div className="mt-6 flex gap-3">
          {step > 1 && <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200"><ArrowLeft className="h-4 w-4" /> 上一步</motion.button>}
          {step < 4 ? (
            <motion.button whileHover={canNext ? { scale: 1.02 } : {}} whileTap={canNext ? { scale: 0.98 } : {}} disabled={!canNext} onClick={() => setStep(s => s + 1)}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50">
              下一步 <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={status === "loading"} onClick={handleSubmit}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50">
              {status === "loading" ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 生成中...</> : <><Sparkles className="h-4 w-4" /> 生成我的 AI 身份卡</>}
            </motion.button>
          )}
        </div>
      </FadeIn>
    </main>
  );
}
