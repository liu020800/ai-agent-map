"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Cpu,
  FileText,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  Sword,
  User,
  Wand2,
  Zap,
} from "lucide-react";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { computeLevel, levelName } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { PageShell, SectionHeader, AgentPassportCard } from "@/components/ui";
import { submitCard } from "@/lib/api-client";

const APP_GROUPS = [
  { label: "通用 AI", items: ["豆包", "DeepSeek", "Kimi", "ChatGPT", "Claude", "Gemini", "通义千问", "腾讯元宝"] },
];
const AGENT_GROUPS = [
  { label: "编程 Agent", items: ["Codex", "Claude Code", "OpenCode", "Cursor", "Trae", "CodeBuddy"] },
  { label: "自动化 Agent", items: ["Dify", "n8n", "Hermes", "OpenClaw"] },
];
const FREQUENCIES = ["偶尔使用", "每周使用", "每天使用", "工作主力", "已经形成自动化工作流"];
const PURPOSES = ["日常聊天", "写代码", "写作", "数据分析", "自动化工作流", "学习研究", "创意设计", "其他"];
const OCCUPATIONS = ["程序员", "产品经理", "设计师", "学生", "教师", "自媒体", "企业管理", "自由职业", "其他"];
const PROVINCES = ["北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾", "内蒙古", "广西", "西藏", "宁夏", "新疆", "香港", "澳门", "其他"];
const STEPS = [
  { label: "选择装备", desc: "装配你的核心 AI 工具", icon: Sword },
  { label: "使用场景", desc: "定义你的作战方式", icon: FileText },
  { label: "地区据点", desc: "写入你的城市信号", icon: MapPin },
  { label: "生成档案", desc: "确认并生成 Passport", icon: Shield },
];
const RARITY_NAME = ["普通", "普通", "稀有", "史诗", "传说", "神话"];
const RARITY_ACCENT = ["#737373", "#737373", "#22d3ee", "#a855f7", "#fbbf24", "#fb7185"];

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"app" | "agent">("agent");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [primaryTool, setPrimaryTool] = useState("");
  const [frequency, setFrequency] = useState("");
  const [purpose, setPurpose] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [province, setProvince] = useState("上海");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ ai_level: number; ai_level_name: string; card_slug: string; avatar_seed: string } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const submitTimeRef = useRef<number | null>(null);
  const honeypotRef = useRef("");
  const prevLevelRef = useRef(1);

  useEffect(() => {
    submitTimeRef.current = Date.now();
  }, []);

  const toolGroups = userType === "agent" ? AGENT_GROUPS : APP_GROUPS;
  const previewLevel = useMemo(() => computeLevel(userType, selectedTools), [userType, selectedTools]);
  const previewTitle = useMemo(() => levelName(previewLevel), [previewLevel]);
  const previewAvatar = useMemo(() => generateAvatarSvg(`${nickname}-${userType}-${selectedTools.join("|")}-${previewLevel}`, 80, previewLevel, selectedTools[0]), [nickname, userType, selectedTools, previewLevel]);
  const rarityAccent = RARITY_ACCENT[previewLevel] || "#22d3ee";
  const rarityName = RARITY_NAME[previewLevel] || "普通";
  const battlePower = 420 + previewLevel * 1800 + selectedTools.length * 360 + (purpose.length * 120);

  useEffect(() => {
    if (previewLevel > prevLevelRef.current) {
      setLevelUp(previewLevel);
      const timer = setTimeout(() => setLevelUp(null), 2400);
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = previewLevel;
  }, [previewLevel]);

  const canNext =
    step === 1 ? selectedTools.length > 0 :
    step === 2 ? !!frequency && purpose.length > 0 :
    step === 3 ? province.trim().length > 0 :
    true;

  const nextHint =
    step === 1 ? "至少装备 1 个工具后才能继续。" :
    step === 2 ? "请先选择使用频率，并至少选择 1 个使用场景。" :
    step === 3 ? "至少选择一个地区据点。" :
    "";

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) => {
      const next = prev.includes(tool) ? prev.filter((item) => item !== tool) : [...prev, tool];
      if (!next.includes(primaryTool)) setPrimaryTool(next[0] || "");
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const result = await submitCard({
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
        submit_duration_ms: submitTimeRef.current ? Date.now() - submitTimeRef.current : 0,
      });
      setResult(result);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "提交失败");
    }
  }, [nickname, province, city, occupation, userType, selectedTools, primaryTool, frequency, purpose]);

  if (status === "success" && result) {
    return (
      <main id="main-content" className="relative min-h-[88vh] overflow-hidden pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute left-[30%] top-[30%] h-48 w-48 rounded-full bg-violet-500/12 blur-3xl" />
        </div>
        <PageShell width="narrow">
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-cyan-300/25 bg-cyan-300/[0.08] shadow-[0_0_36px_rgba(34,211,238,0.18)]">
              <Check className="h-12 w-12 text-cyan-300" />
            </motion.div>
            <p className="title-font mb-3 text-[11px] uppercase tracking-[0.32em] text-cyan-300/75">Passport Ready</p>
            <h1 className="title-font text-4xl font-black text-white sm:text-5xl">身份档案已生成</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/65">你的 AI 玩家身份已经写入全国图谱，下一步可以进入专属 Passport 页面保存、分享并查看同城信号。</p>
            <div className="mt-6">
              <AgentPassportCard
                nickname={nickname || "Agent_Anonymous"}
                province={province + (city ? ` · ${city}` : "")}
                primaryTool={primaryTool || selectedTools[0] || "Codex"}
                tools={selectedTools}
                level={result.ai_level}
                levelName={result.ai_level_name}
                avatarSeed={result.avatar_seed}
                compact
                className="mx-auto"
              />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/share?slug=${result.card_slug}`} className="btn-lusion inline-flex"><Shield className="h-4 w-4" /> 查看我的 AI Agent Passport</Link>
              <Link href="/map" className="btn-lusion-outline inline-flex justify-center"><Radio className="h-4 w-4" /> 查看全国图谱</Link>
            </div>
          </div>
        </PageShell>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden pb-12 pt-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[8%] top-[14%] h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[30%] h-56 w-56 rounded-full bg-fuchsia-500/8 blur-3xl" />
      </div>

      <AnimatePresence>
        {levelUp && (
          <motion.div initial={{ opacity: 0, scale: 0.7, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1, y: -20 }} className="fixed inset-x-0 top-28 z-50 flex justify-center px-4">
            <div className="rounded-[24px] border border-amber-400/20 bg-[#090b11]/92 px-7 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/10"><Zap className="h-5 w-5 text-amber-300" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">LEVEL UP</p>
                  <p className="title-font text-lg font-black text-white">{previewTitle} · 身份等级提升</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageShell width="wide">
        <SectionHeader
          eyebrow="Identity Creator"
          title="创建你的 AI 身份档案"
          description="不再是普通长表单。这里是你的 Agent 角色创建器：装配工具、定义场景、标记据点，然后生成专属 AI Agent Passport。"
          align="center"
          accent="cyan"
          className="!mb-10"
        />

        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((item, index) => {
            const idx = index + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={item.label} className={(active ? "border-cyan-300/18 bg-cyan-300/[0.05]" : "border-white/[0.04] bg-white/[0.015]") + " rounded-[24px] border p-4 backdrop-blur-xl transition-all"}>
                <div className="mb-3 flex items-center justify-between">
                  <div className={(done ? "bg-cyan-300/15 text-cyan-300" : active ? "bg-white/10 text-white" : "bg-white/5 text-white/40") + " flex h-10 w-10 items-center justify-center rounded-2xl"}>
                    {done ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/30">0{idx}</span>
                </div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-6 text-white/40">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <LiquidGlassCard className="p-5 sm:p-6" mode="shader" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={30}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="title-font text-[11px] uppercase tracking-[0.28em] text-cyan-300/72">Step {step} / 4</p>
                  <h2 className="title-font mt-2 text-2xl font-black text-white sm:text-3xl">{STEPS[step - 1].label}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/45">{STEPS[step - 1].desc}</p>
                </div>
                <div className="rounded-full border border-white/[0.04] bg-white/[0.015] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/40">Agent Passport Builder</div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-6">
                    <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.015] p-4">
                      <div className="mb-4 flex rounded-xl border border-white/[0.04] bg-white/[0.01] p-1">
                        {(["agent", "app"] as const).map((type) => (
                          <button key={type} onClick={() => { setUserType(type); setSelectedTools([]); setPrimaryTool(""); }} className={(userType === type ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80") + " flex-1 rounded-xl py-3 text-sm font-semibold transition-all"}>
                            {type === "agent" ? "🤖 Agent 装备" : "📱 AI 应用"}
                          </button>
                        ))}
                      </div>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">选择你的核心装备</p>
                          <p className="mt-1 text-xs text-white/40">工具会决定你的等级、稀有度与身份标签。</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300/75"><Wand2 className="h-3 w-3" /> 已装备 {selectedTools.length}</div>
                      </div>
                      <div className="space-y-5">
                        {toolGroups.map((group) => (
                          <div key={group.label}>
                            <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/35">{group.label}</div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                              {group.items.map((tool) => {
                                const selected = selectedTools.includes(tool);
                                const primary = primaryTool === tool || (!primaryTool && selectedTools[0] === tool);
                                return (
                                  <motion.button key={tool} onClick={() => toggleTool(tool)} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className={(selected ? "border-cyan-300/30 bg-cyan-300/[0.07] shadow-[0_0_24px_rgba(34,211,238,0.08)]" : "border-white/[0.05] bg-[#0a0b12] hover:border-white/[0.10]") + " relative overflow-hidden rounded-[22px] border p-4 text-left transition-all"}>
                                    <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,.06),transparent)] opacity-70" />
                                    {selected ? <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300"><Check className="h-3 w-3 text-black" /></div> : null}
                                    <div className="relative">
                                      <p className="text-sm font-bold text-white">{tool}</p>
                                      <p className="mt-2 text-[11px] text-white/42">{selected ? (primary ? "主力装备" : "已装备") : "点击装备"}</p>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-5">
                    <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.015] p-4">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Zap className="h-5 w-5 text-cyan-300/75" /> 使用频率</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {FREQUENCIES.map((item) => (
                          <motion.button key={item} onClick={() => setFrequency(item)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={(frequency === item ? "border-cyan-300/28 bg-cyan-300/[0.08] text-white" : "border-white/[0.04] bg-[#0a0b12] text-white/58 hover:border-white/[0.10]") + " rounded-[20px] border p-4 text-left text-sm transition-all"}>
                            <p className="font-semibold">{item}</p>
                            <p className="mt-2 text-xs text-white/36">决定你的活跃度评级与战斗力档位。</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.015] p-4">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><FileText className="h-5 w-5 text-cyan-300/75" /> 使用场景</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {PURPOSES.map((item) => {
                          const selected = purpose.includes(item);
                          return (
                            <motion.button key={item} onClick={() => setPurpose((prev) => selected ? prev.filter((x) => x !== item) : [...prev, item])} whileTap={{ scale: 0.96 }} className={(selected ? "border-cyan-300/28 bg-cyan-300/[0.08] text-white" : "border-white/[0.04] bg-[#0a0b12] text-white/58 hover:border-white/[0.10]") + " rounded-full border px-4 py-2.5 text-sm transition-all"}>{item}</motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="grid gap-4 sm:grid-cols-2">
                    <FieldCard label="昵称 / 代号"><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="例如：Agent_0x3F" className="w-full rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-cyan-300/25 focus:outline-none" /></div></FieldCard>
                    <FieldCard label="职业身份"><div className="relative"><Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><select value={occupation} onChange={(e) => setOccupation(e.target.value)} style={{ colorScheme: "dark" }} className="w-full rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] py-3.5 pl-10 pr-10 text-sm text-white focus:border-cyan-300/25 focus:outline-none"><option value="" className="text-black">请选择</option>{OCCUPATIONS.map((item) => <option key={item} value={item} className="text-black">{item}</option>)}</select></div></FieldCard>
                    <FieldCard label="省份据点"><select value={province} onChange={(e) => setProvince(e.target.value)} style={{ colorScheme: "dark" }} className="w-full rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] py-3.5 px-4 pr-10 text-sm text-white focus:border-cyan-300/25 focus:outline-none">{PROVINCES.map((item) => <option key={item} value={item} className="text-black">{item}</option>)}</select></FieldCard>
                    <FieldCard label="城市信号"><div><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="例如：杭州 / 深圳" className="w-full rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] py-3.5 px-4 text-sm text-white placeholder:text-white/25 focus:border-cyan-300/25 focus:outline-none" /><div className="mt-3 flex flex-wrap gap-2"><QuickChip label="暂不透露城市" onClick={() => setCity("暂不透露")} /><QuickChip label="杭州" onClick={() => setCity("杭州")} /><QuickChip label="深圳" onClick={() => setCity("深圳")} /></div></div></FieldCard>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-5">
                    <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.015] p-5">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="title-font text-[11px] uppercase tracking-[0.28em] text-cyan-300/72">Final Confirm</p>
                          <h3 className="mt-2 text-xl font-black text-white">你的 AI Agent Passport 即将生成</h3>
                        </div>
                        <div className="rounded-full border border-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: rarityAccent }}>{rarityName}</div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-white/[0.04] bg-black/20 p-3">
                        {[
                          ["地区据点", province + (city ? ` · ${city}` : "")],
                          ["装备阵列", selectedTools.join("、") || "未选择"],
                          ["主力装备", primaryTool || selectedTools[0] || "未选择"],
                          ["使用频率", frequency || "未选择"],
                          ["使用场景", purpose.length > 0 ? purpose.join("、") : "未选择"],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="flex items-start justify-between gap-4 text-sm"><span className="text-white/38">{label}</span><span className="max-w-[65%] text-right font-medium text-white">{value}</span></div>
                        ))}
                      </div>
                    </div>
                    {message && status === "error" ? <div className="rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-sm text-red-300">{message}</div> : null}
                  </motion.div>
                )}
              </AnimatePresence>

              <input defaultValue="" onChange={(e) => { honeypotRef.current = e.target.value; }} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.04] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>{!canNext && step < 4 ? <p className="text-sm text-amber-300/88">{nextHint}</p> : <p className="text-sm text-white/38">每一步都会实时更新右侧身份卡预览。</p>}</div>
                <div className="flex gap-3 self-end sm:self-auto">
                  <button onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1 || status === "loading"} className="btn-lusion-outline !px-4 !py-3 !text-xs disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> 上一步</button>
                  {step < 4 ? (
                    <button onClick={() => canNext && setStep((prev) => Math.min(4, prev + 1))} disabled={!canNext || status === "loading"} className="btn-lusion !px-5 !py-3 !text-xs disabled:opacity-40">下一步 <ArrowRight className="h-4 w-4" /></button>
                  ) : (
                    <button onClick={handleSubmit} disabled={status === "loading"} className="btn-lusion !px-5 !py-3 !text-xs disabled:opacity-40">{status === "loading" ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Shield className="h-4 w-4" />}{status === "loading" ? "正在生成身份卡..." : "生成我的 AI Agent Passport"}</button>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <LiquidGlassCard className="overflow-hidden p-0" mode="prominent" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={30}>
              <div className="relative overflow-hidden p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.14),transparent_30%)]" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between"><div><p className="title-font text-[10px] uppercase tracking-[0.3em] text-cyan-300/72">Live Preview</p><h3 className="title-font mt-2 text-xl font-black text-white">AI Agent Passport</h3></div><div className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/42">L{previewLevel}</div></div>
                  <div className="relative overflow-hidden rounded-[28px] border border-white/[0.04] bg-[#07080d] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]" style={{ boxShadow: `0 0 36px ${rarityAccent}18` }}>
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" /></div>
                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between gap-3"><div><p className="title-font text-[10px] uppercase tracking-[0.3em] text-white/38">AI AGENT PASSPORT</p><p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">Identity verified</p></div><div className="rounded-full border border-white/[0.04] px-3 py-1 text-[10px] font-bold" style={{ color: rarityAccent }}>{rarityName}</div></div>
                      <div className="mb-4 grid grid-cols-[1fr_auto] items-start gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4"><div><p className="text-[10px] uppercase tracking-[0.22em] text-white/35">玩家编号</p><p className="title-font mt-2 text-2xl font-black text-white">#0001024</p><p className="mt-2 text-[11px] text-white/40">{previewTitle}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.01]" style={{ boxShadow: `0 0 20px ${rarityAccent}18` }}><Cpu className="h-5 w-5" style={{ color: rarityAccent }} /></div></div>
                      <div className="mb-5 flex justify-center"><div className="relative h-36 w-36 overflow-hidden rounded-[28px] border-2 border-white/[0.04] bg-black/30" dangerouslySetInnerHTML={{ __html: previewAvatar }} /></div>
                      <div className="mb-4 text-center"><h4 className="title-font text-2xl font-black text-white">{nickname || "Agent_Anonymous"}</h4><p className="mt-2 text-sm font-semibold text-cyan-300">{previewTitle}</p></div>
                      <div className="mb-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3 text-center"><p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/30">战斗力</p><p className="title-font text-lg font-black text-white">{battlePower.toLocaleString()}</p></div><div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3 text-center"><p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/30">地区</p><p className="text-sm font-semibold text-white">{province}{city ? ` · ${city}` : ""}</p></div></div>
                      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4"><div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35"><Radio className="h-3.5 w-3.5 text-cyan-300/75" /> 主力工具</div><div className="flex flex-wrap gap-2">{(selectedTools.length > 0 ? selectedTools : [userType === "agent" ? "Codex" : "DeepSeek"]).slice(0, 4).map((tool) => <span key={tool} className="rounded-full border px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: `${rarityAccent}33`, color: rarityAccent, background: `${rarityAccent}12` }}>{tool}</span>)}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </PageShell>
    </main>
  );
}

function FieldCard({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.015] p-4"><label className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-white/35">{label}</label>{children}</div>;
}

function QuickChip({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5 text-[11px] text-white/55 transition-colors hover:text-white">{label}</button>;
}
