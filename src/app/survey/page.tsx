"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Compass,
  Copy,
  Cpu,
  Download,
  FileText,
  MapPin,
  RefreshCw,
  ScanLine,
  Shield,
  Sword,
  Zap,
} from "lucide-react";
import SplitText from "@/components/react-bits/SplitText";
import { PageShell, Section } from "@/components/ui";
import { generateAvatarSvg } from "@/lib/avatar";
import {
  SURVEY_TOOLS,
  SURVEY_SCENARIOS,
  SURVEY_PROVINCES,
  deriveRole,
  deriveAgentLevel,
  deriveSignalStrength,
  generateIdentityCard,
  generateIdentityId,
} from "@/lib/survey-service";
import { toolColor } from "@/data/mock";
import {
  createCardAndGenerateImage,
  getCardById,
  getCardByVisitorId,
  getOrCreateVisitorId,
  readCachedAgentCard,
  searchCardsByNickname,
  STORAGE_KEYS,
  type AgentCardRecord,
} from "@/lib/api-client";
import type { SurveyFormPayload } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;
type SubmitStatus = "idle" | "loading" | "success" | "error";

const STEPS: { key: Step; label: string; desc: string; icon: typeof Sword }[] = [
  { key: 1, label: "选择装备", desc: "装配 AI Agent 工具栈", icon: Sword },
  { key: 2, label: "使用场景", desc: "定义你的作战方式", icon: FileText },
  { key: 3, label: "地区据点", desc: "写入城市信号", icon: MapPin },
  { key: 4, label: "生成档案", desc: "生成 AI Agent Passport", icon: Shield },
];

const RARITY_NAME = ["普通", "普通", "稀有", "史诗", "传说", "神话"];
const RARITY_ACCENT = ["#737373", "#737373", "#22d3ee", "#a855f7", "#fbbf24", "#fb7185"];

export default function SurveyPage() {
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<"agent" | "app">("agent");
  const [tools, setTools] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [province, setProvince] = useState<string>(SURVEY_PROVINCES[1]);
  const [city, setCity] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [identityId, setIdentityId] = useState<string>(generateIdentityId());
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [existingCard, setExistingCard] = useState<AgentCardRecord | null>(null);
  const [recoverNickname, setRecoverNickname] = useState("");
  const [recoverResults, setRecoverResults] = useState<AgentCardRecord[]>([]);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [cardSeed, setCardSeed] = useState<string>(() =>
    typeof window === "undefined" ? "" : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  );

  useEffect(() => {
    let active = true;
    const visitorId = getOrCreateVisitorId();
    const cached = readCachedAgentCard();
    if (cached && active) setExistingCard(cached);
    const cardId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEYS.cardId) : "";
    const task = cardId ? getCardById(cardId) : getCardByVisitorId(visitorId);
    task.then((card) => {
      if (!active) return;
      if (card) {
        setExistingCard(card);
      } else {
        setExistingCard(null);
        window.localStorage.removeItem(STORAGE_KEYS.cardId);
        window.localStorage.removeItem(STORAGE_KEYS.cardCache);
      }
      setCheckingExisting(false);
    }).catch(() => {
      if (active) setCheckingExisting(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const role = useMemo(() => deriveRole(scenarios), [scenarios]);
  const level = useMemo(() => deriveAgentLevel(tools, userType), [tools, userType]);
  const signal = useMemo(() => deriveSignalStrength(level, scenarios.length), [level, scenarios.length]);
  const rarityAccent = RARITY_ACCENT[level] ?? "#22d3ee";
  const rarityName = RARITY_NAME[level] ?? "普通";

  const avatarSeed = useMemo(
    () => [nickname || "agent", userType, tools.join("|") || "none", String(level), cardSeed].join("-"),
    [nickname, userType, tools, level, cardSeed],
  );

  const avatarSvg = useMemo(
    () => generateAvatarSvg(avatarSeed, 200, level, tools[0] ?? ""),
    [avatarSeed, level, tools],
  );

  const toolCount = tools.length;
  const scenarioCount = scenarios.length;
  const provinceText = city ? `${province} · ${city}` : province;

  const buildPayload = useCallback(
    (): SurveyFormPayload => ({
      tools,
      scenarios,
      province,
      city,
      nickname: nickname.trim() || undefined,
      signature: signature.trim() || undefined,
      userType,
      roleTitle: role.title,
      agentLevel: level,
      signalStrength: signal,
      identityId,
      createdAt,
    }),
    [tools, scenarios, province, city, nickname, signature, userType, role.title, level, signal, identityId, createdAt],
  );

  const canNext = useMemo(() => {
    if (step === 1) return toolCount > 0;
    if (step === 2) return scenarioCount > 0;
    if (step === 3) return province.trim().length > 0 && city.trim().length > 0;
    return true;
  }, [step, toolCount, scenarioCount, province, city]);

  const toggleTool = (name: string) => {
    setTools((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));
  };

  const toggleScenario = (id: string) => {
    setScenarios((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const gotoNext = useCallback(() => {
    if (!canNext) return;
    if (step < 4) setStep((s) => ((s + 1) as Step));
  }, [canNext, step]);

  const gotoPrev = useCallback(() => {
    if (step > 1) setStep((s) => ((s - 1) as Step));
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setSubmitStatus("loading");
    setSubmitMessage("正在提交...");
    try {
      const visitorId = getOrCreateVisitorId();
      const card = await createCardAndGenerateImage({
        visitorId,
        nickname: nickname.trim() || "匿名 Agent",
        province,
        city: city.trim(),
        tools,
        scenarios,
        signature: signature.trim() || "用 AI 扩展自己的能力边界",
      });
      setExistingCard(card);
      setIdentityId(card.cardId);
      setCreatedAt(card.createdAt);
      setSubmitStatus("success");
      setSubmitMessage("已写入 AI Agent Map 全国图谱！");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err instanceof Error ? err.message : "提交失败，请重试");
    }
  }, [city, nickname, province, scenarios, signature, tools]);

  const regenerateAvatar = useCallback(() => {
    setCardSeed(Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  }, []);

  const regenerateCard = useCallback(async () => {
    regenerateAvatar();
    const newId = generateIdentityId();
    setIdentityId(newId);
    setCreatedAt(new Date().toISOString());
    try {
      const fresh = await generateIdentityCard(buildPayload());
      setIdentityId(fresh.identityId);
      setCreatedAt(fresh.createdAt);
    } catch {
      /* keep local identity */
    }
  }, [buildPayload, regenerateAvatar]);

  const handleDownload = useCallback(async () => {
    const node = document.querySelector("[data-passport-card]") as HTMLElement | null;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ai-agent-passport-${identityId}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2400);
    } catch {
      setDownloaded(false);
    }
  }, [identityId]);

  const handleCopyText = useCallback(() => {
    const text = `我是 ${role.title} ${nickname || "匿名 Agent"}，装备 ${tools.join(" + ")}，据点 ${provinceText}，信号强度 ${signal}。#AI Agent Map`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied("text");
        setTimeout(() => setCopied(null), 2000);
      });
    }
  }, [role.title, nickname, tools, provinceText, signal]);


  const handleGenerateAndShare = useCallback(async () => {
    setSubmitStatus("loading");
    setSubmitMessage("正在创建并保存专属 AI Agent 身份卡...");
    try {
      const card = await createCardAndGenerateImage({
        visitorId: getOrCreateVisitorId(),
        nickname: (nickname || "").trim() || "匿名 Agent",
        province,
        city: (city || "").trim(),
        tools,
        scenarios: SURVEY_SCENARIOS.filter((s) => scenarios.includes(s.id)).map((s) => s.name),
        signature: (signature || "").trim() || "用 AI 扩展自己的能力边界",
      });
      setExistingCard(card);
      setIdentityId(card.cardId);
      setCreatedAt(card.createdAt);
      setSubmitStatus("success");
      setSubmitMessage("身份卡已生成并保存，正在跳转到分享页...");
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = `/share?cardId=${encodeURIComponent(card.cardId)}`;
      }, 500);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "身份卡创建失败，请重试");
    }
  }, [city, nickname, province, scenarios, signature, tools]);

  const handleRecoverSearch = useCallback(async () => {
    if (!recoverNickname.trim()) return;
    setSubmitStatus("loading");
    setSubmitMessage("正在查询身份卡...");
    try {
      const results = await searchCardsByNickname(recoverNickname.trim());
      setRecoverResults(results);
      setSubmitStatus("idle");
      setSubmitMessage(results.length ? `找到 ${results.length} 张身份卡` : "没有找到匹配身份卡");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "查询失败，请稍后再试");
    }
  }, [recoverNickname]);

  if (existingCard && !checkingExisting) {
    return (
      <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
        <Section className="relative z-10" spacing="sm">
          <PageShell>
            <div className="mx-auto max-w-3xl rounded-[28px] border border-cyan-300/20 bg-black/40 p-6 text-center shadow-[0_0_54px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-8">
              <p className="title-font text-[11px] uppercase tracking-[0.32em] text-cyan-300">MY AGENT CARD</p>
              <h1 className="title-font mt-4 text-3xl font-black text-white sm:text-5xl">你已经拥有 AI Agent 身份卡</h1>
              <p className="mt-4 text-sm leading-7 text-white/65">
                为避免重复消耗生图额度，系统已识别到你的浏览器身份。刷新或再次进入不会重新生成图片。
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                {existingCard.imageUrl ? (
                  <img src={existingCard.imageUrl} alt={`${existingCard.nickname} 的 AI Agent 身份卡`} className="mx-auto max-h-[520px] w-full object-contain" />
                ) : (
                  <div className="p-10 text-white/60">身份卡图片暂不可用</div>
                )}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href={`/share?cardId=${encodeURIComponent(existingCard.cardId)}`} className="btn-rb-fill justify-center">
                  查看我的身份卡
                </Link>
                <button
                  type="button"
                  className="btn-rb-ghost justify-center"
                  onClick={() => navigator.clipboard?.writeText(existingCard.shareUrl)}
                >
                  复制分享链接
                </button>
                <button
                  type="button"
                  className="btn-rb-ghost justify-center"
                  onClick={() => {
                    if (window.confirm("重新生成会消耗一次图片生成额度，并替换当前身份卡。请前往分享页继续，确定打开吗？")) {
                      window.location.href = `/share?cardId=${encodeURIComponent(existingCard.cardId)}&regen=1`;
                    }
                  }}
                >
                  重新生成身份卡
                </button>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 text-sm font-semibold text-white">查询其他身份卡</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={recoverNickname} onChange={(e) => setRecoverNickname(e.target.value)} placeholder="输入昵称找回身份卡" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
                  <button type="button" onClick={handleRecoverSearch} className="btn-rb-ghost justify-center">查询</button>
                </div>
                {recoverResults.length > 0 && (
                  <div className="mt-3 grid gap-2 text-left">
                    {recoverResults.map((card) => (
                      <Link key={card.cardId} href={`/share?cardId=${encodeURIComponent(card.cardId)}`} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/75 hover:border-cyan-300/30">
                        {card.nickname} · {card.province}{card.city} · {card.cardId}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {submitMessage && <p className="mt-4 text-sm text-cyan-100/75">{submitMessage}</p>}
              <p className="mt-5 text-xs text-white/35">AI 生成内容 · 仅供娱乐分享，不代表真实身份认证。</p>
            </div>
          </PageShell>
        </Section>
      </main>
    );
  }

    return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-[rgba(34,211,238,0.18)] blur-[130px]" />
        <div className="absolute right-[6%] top-[14%] h-[26rem] w-[26rem] rounded-full bg-[rgba(168,85,247,0.16)] blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[rgba(251,191,36,0.10)] blur-[120px]" />
      </div>
      <div aria-hidden className="hero-noise" />

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          <motion.div
            initial={false}
            className="hero-panel relative mb-5 overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/[0.035] p-5 shadow-[0_0_54px_rgba(34,211,238,0.10)] sm:p-7"
          >
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-50" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
            </div>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.45fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2">
                  <ScanLine className="h-3.5 w-3.5 text-cyan-300/85" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Identity Creator</span>
                </div>
                <h1 className="title-font max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-white drop-shadow-[0_0_32px_rgba(34,211,238,0.32)] sm:text-5xl lg:text-[64px]">
                  创建你的 <span className="gradient-text-rb">AI Agent</span>
                  <br className="hidden sm:block" /> 身份档案
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/76 sm:text-lg">
                  选择你的装备、定义作战场景、写入城市信号，生成专属 AI Agent Passport。
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">总计 4 步 · 约 60 秒</span>
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">支持 12+ AI 工具</span>
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">支持 10 大场景</span>
                </div>
              </div>

              <StepProgress step={step} />
            </div>
          </motion.div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/45">
              <CircuitBoard className="h-3.5 w-3.5 text-cyan-300" /> 玩家阵营
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
              {[
                { key: "agent", label: "Agent 工作流玩家" },
                { key: "app", label: "通用 AI 用户" },
              ].map((opt) => {
                const active = userType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setUserType(opt.key as "agent" | "app")}
                    className={
                      "rounded-full px-3 py-1.5 text-xs transition " +
                      (active
                        ? "bg-gradient-to-r from-cyan-300/20 to-violet-300/20 text-white shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                        : "text-white/55 hover:text-white")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <div>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step-1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={Sword} step={1} title="选择装备" subtitle="多选你日常使用的 AI 工具。选得越多，等级越高。">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {SURVEY_TOOLS.map((tool) => {
                          const selected = tools.includes(tool.name);
                          return (
                            <ToolCard
                              key={tool.id}
                              name={tool.name}
                              desc={tool.desc}
                              tone={tool.tone}
                              category={tool.category}
                              selected={selected}
                              onClick={() => toggleTool(tool.name)}
                            />
                          );
                        })}
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={FileText} step={2} title="使用场景" subtitle="多选你的主要用途。系统会据此生成你的角色称号。">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {SURVEY_SCENARIOS.map((s) => {
                          const selected = scenarios.includes(s.id);
                          return (
                            <ScenarioCard key={s.id} name={s.name} desc={s.desc} tone={s.tone} selected={selected} onClick={() => toggleScenario(s.id)} />
                          );
                        })}
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={MapPin} step={3} title="地区据点" subtitle="选择城市 + 昵称 + 一句话签名。城市会写进全国信号图谱。">
                      <div className="grid gap-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="省份 / 据点" required>
                            <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full">
                              {SURVEY_PROVINCES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="城市 / 详细定位" required>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="例: 杭州 · 未来科技城" />
                          </Field>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="昵称" hint="选填 · 留空则生成『匿名 Agent』">
                            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的赛博代号" maxLength={24} />
                          </Field>
                          <Field label="一句话签名" hint="选填 · 写进身份卡的『座右铭』">
                            <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="例: 让 AI 替你写代码" maxLength={40} />
                          </Field>
                        </div>
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={Shield} step={4} title="生成 AI Agent Passport" subtitle="预览你的身份卡。提交后会把你的装备、角色、地区写进全国图谱。">
                      <div className="grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button onClick={regenerateCard} type="button" className="btn-rb-ghost !justify-start">
                            <RefreshCw className="h-4 w-4" /> 重新生成身份卡
                          </button>
                          <button onClick={handleDownload} type="button" className="btn-rb-ghost !justify-start">
                            {downloaded ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Download className="h-4 w-4" />}
                            {downloaded ? "已下载 PNG" : "下载身份卡 (PNG)"}
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button onClick={handleCopyText} type="button" className="btn-rb-ghost !justify-start">
                            {copied === "text" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                            {copied === "text" ? "已复制分享文案" : "复制分享文案"}
                          </button>
                          <button onClick={handleGenerateAndShare} type="button" disabled={submitStatus === "loading"} className="btn-rb-fill !justify-start disabled:opacity-60">
                            {submitStatus === "loading" ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" /> 正在装配身份卡...
                              </>
                            ) : submitStatus === "success" ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" /> 已生成！正在跳转分享页...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" /> 生成并分享身份卡
                              </>
                            )}
                          </button>
                        </div>

                        {submitMessage && (
                          <div
                            className={
                              "rounded-2xl border p-3 text-xs " +
                              (submitStatus === "success"
                                ? "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-200"
                                : submitStatus === "error"
                                ? "border-rose-300/20 bg-rose-300/[0.05] text-rose-200"
                                : "border-white/[0.06] bg-white/[0.02] text-white/60")
                            }
                          >
                            {submitMessage}
                          </div>
                        )}

                        {submitStatus === "success" && (
                          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3 text-xs text-cyan-200">
                            <CheckCircle2 className="h-4 w-4" />
                            你的 AI Agent Passport 已写入 <Link className="underline underline-offset-4" href="/map">全国图谱</Link>，可前往 <Link className="underline underline-offset-4" href="/share">分享页</Link> 获取链接。
                          </div>
                        )}
                      </div>
                    </StepShell>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={gotoPrev} disabled={step === 1} className="btn-rb-ghost disabled:opacity-40">
                  <ArrowLeft className="h-4 w-4" /> 上一步
                </button>
                {step < 4 ? (
                  <button type="button" onClick={gotoNext} disabled={!canNext} className="btn-rb-fill disabled:opacity-40">
                    下一步 <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link href="/map" className="btn-rb-ghost">
                    查看全国图谱 <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start" data-passport-card>
              <LivePreview
                nickname={nickname}
                role={role}
                level={level}
                rarityName={rarityName}
                rarityAccent={rarityAccent}
                tools={tools}
                scenarios={scenarios}
                province={province}
                city={city}
                signature={signature}
                avatarSvg={avatarSvg}
                identityId={identityId}
                signal={signal}
              />
            </aside>
          </div>
        </PageShell>
      </Section>
    </main>
  );
}


function StepProgress({ step }: { step: number }) {
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/40">
        <span>创建进度</span>
        <span className="text-cyan-300">STEP {String(step).padStart(2, "0")} / 04</span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300"
          style={{ boxShadow: "0 0 14px rgba(34,211,238,0.4)" }}
        />
      </div>
      <ol className="space-y-3">
        {STEPS.map((s) => {
          const active = s.key === step;
          const done = s.key < step;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition " +
                  (active
                    ? "border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : done
                    ? "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-300"
                    : "border-white/[0.06] bg-white/[0.02] text-white/40")
                }
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={"title-font text-sm font-bold " + (active ? "text-white" : done ? "text-emerald-200" : "text-white/40")}>
                  {String(s.key).padStart(2, "0")} · {s.label}
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/35">{s.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepShell({
  icon: Icon,
  step,
  title,
  subtitle,
  children,
}: {
  icon: typeof Sword;
  step: Step;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[0_0_55px_rgba(34,211,238,0.12)] backdrop-blur-2xl">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent" />
      <div className="relative z-10">
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">STEP {String(step).padStart(2, "0")} / 04</p>
          <h2 className="title-font mt-1 text-2xl font-black text-white sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
      </div>
      {children}
      </div>
    </div>
  );
}

function ToolCard({
  name,
  desc,
  tone,
  category,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  tone: string;
  category: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={
        "group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border p-4 text-left transition " +
        (selected
          ? "border-cyan-300/45 bg-cyan-300/[0.06] shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]")
      }
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: tone, boxShadow: `0 0 24px ${tone}55` }}
        />
      )}
      <div className="flex w-full items-center justify-between">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg border"
          style={{ borderColor: `${tone}55`, background: `${tone}18` }}
        >
          <Cpu className="h-3.5 w-3.5" style={{ color: tone }} />
        </span>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-300/[0.1] px-2 py-0.5 text-[10px] font-bold tracking-wider text-cyan-300">
            <Check className="h-3 w-3" /> 已装备
          </span>
        ) : (
          <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/40">
            {category}
          </span>
        )}
      </div>
      <p className="title-font text-base font-black text-white">{name}</p>
      <p className="text-[11px] leading-5 text-white/45">{desc}</p>
    </motion.button>
  );
}

function ScenarioCard({
  name,
  desc,
  tone,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  tone: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition " +
        (selected
          ? "border-cyan-300/45 bg-cyan-300/[0.06] shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]")
      }
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: tone, boxShadow: `0 0 22px ${tone}55` }}
        />
      )}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
        style={{ borderColor: `${tone}55`, background: `${tone}18` }}
      >
        <Compass className="h-4 w-4" style={{ color: tone }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="title-font text-sm font-black text-white">{name}</p>
          {selected && <Check className="h-3.5 w-3.5 text-cyan-300" />}
        </div>
        <p className="truncate text-[11px] text-white/45">{desc}</p>
      </div>
    </motion.button>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          {label} {required ? <span className="text-cyan-300">*</span> : null}
        </span>
        {hint ? <span className="text-[10px] text-white/35">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function LivePreview({
  nickname,
  role,
  level,
  rarityName,
  rarityAccent,
  tools,
  scenarios,
  province,
  city,
  signature,
  avatarSvg,
  identityId,
  signal,
}: {
  nickname: string;
  role: ReturnType<typeof deriveRole>;
  level: number;
  rarityName: string;
  rarityAccent: string;
  tools: string[];
  scenarios: string[];
  province: string;
  city: string;
  signature: string;
  avatarSvg: string;
  identityId: string;
  signal: number;
}) {
  const scenarioNames = SURVEY_SCENARIOS.filter((s) => scenarios.includes(s.id)).map((s) => s.name);
  const provinceText = city ? `${province} · ${city}` : province;
  const primaryTool = tools[0] ?? "未装配";
  const mainScenario = scenarioNames[0] ?? "等待选择";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-cyan-300/15 bg-black/35 px-4 py-3 backdrop-blur-xl">
        <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">实时身份卡</p>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-200">
          LIVE SYNC
        </span>
      </div>

      <div
        className="relative mx-auto aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-[28px] border bg-[#05060a] p-4 shadow-[0_0_52px_rgba(34,211,238,0.16)]"
        style={{
          borderColor: `${rarityAccent}66`,
          boxShadow: `0 0 72px ${rarityAccent}22, inset 0 0 40px rgba(255,255,255,0.035)`,
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_82%_76%,rgba(168,85,247,0.20),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_42%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 animate-[scan_3s_linear_infinite] bg-gradient-to-b from-cyan-300/20 via-cyan-300/5 to-transparent" />
        <div aria-hidden className="absolute left-4 top-4 h-8 w-8 border-l border-t" style={{ borderColor: rarityAccent }} />
        <div aria-hidden className="absolute right-4 top-4 h-8 w-8 border-r border-t" style={{ borderColor: rarityAccent }} />
        <div aria-hidden className="absolute bottom-4 left-4 h-8 w-8 border-b border-l" style={{ borderColor: rarityAccent }} />
        <div aria-hidden className="absolute bottom-4 right-4 h-8 w-8 border-b border-r" style={{ borderColor: rarityAccent }} />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="title-font text-[10px] uppercase tracking-[0.32em] text-cyan-200/65">AI AGENT PASSPORT</p>
              <p className="title-font mt-1 text-2xl font-black text-white">身份扫描器</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-white/40">ID</p>
              <p className="font-mono text-[11px] text-cyan-100">{identityId}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col items-center text-center">
            <div
              className="relative h-32 w-32 overflow-hidden rounded-[26px] border-2 bg-black/50"
              style={{
                borderColor: rarityAccent,
                boxShadow: `0 0 38px ${rarityAccent}66`,
              }}
              dangerouslySetInnerHTML={{ __html: avatarSvg }}
            />
            <p className="title-font mt-4 max-w-full truncate text-3xl font-black text-white">{nickname.trim() || "匿名 Agent"}</p>
            <p className="mt-1 text-sm font-bold" style={{ color: role.tone }}>{role.title}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span
                className="rounded-full border px-3 py-1 text-xs font-black"
                style={{ color: rarityAccent, borderColor: `${rarityAccent}66`, background: `${rarityAccent}14` }}
              >
                Lv. {String(level).padStart(2, "0")} · {rarityName}
              </span>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1 text-xs font-bold text-cyan-200">
                SIGNAL {signal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <PreviewStat label="装备" value={`${tools.length}`} tone="#22d3ee" />
            <PreviewStat label="场景" value={`${scenarioNames.length}`} tone="#a855f7" />
            <PreviewStat label="战力" value={signal.toLocaleString()} tone={rarityAccent} />
          </div>

          <div className="mt-4 space-y-2">
            <PassportLine label="城市据点" value={provinceText} tone="#22d3ee" />
            <div className="rounded-xl border border-white/[0.06] bg-black/35 p-2.5">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">装备</p>
              <div className="flex flex-wrap gap-1">
                {tools.length > 0 ? (
                  <>
                    {tools.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          color: toolColor(t, "#22d3ee"),
                          borderColor: `${toolColor(t, "#22d3ee")}40`,
                          background: `${toolColor(t, "#22d3ee")}10`
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {tools.length > 4 && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55">
                        +{tools.length - 4}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-white/40">未装备</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/35 p-2.5">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">场景</p>
              <div className="flex flex-wrap gap-1">
                {scenarioNames.length > 0 ? (
                  <>
                    {scenarioNames.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/75">
                        {s}
                      </span>
                    ))}
                    {scenarioNames.length > 4 && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55">
                        +{scenarioNames.length - 4}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-white/40">未选择</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-black/45 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">Share Signal</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/62">
              {signature.trim() || `我是 ${role.title}，装备 ${tools.length || 0} 件 AI 工具，正在点亮 ${provinceText} 的 Agent 信号。`}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="grid h-12 w-12 grid-cols-4 gap-0.5 rounded-lg border border-white/10 bg-white/90 p-1">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className="rounded-[1px] bg-black"
                    style={{ opacity: (index + signal) % 3 === 0 ? 0.18 : 0.9 }}
                  />
                ))}
              </div>
              <span className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-200/55">AI Agent Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassportLine({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/35 px-3 py-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</span>
      <span className="truncate text-right font-semibold" style={{ color: tone }}>{value}</span>
    </div>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-black/30 p-2">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }} />
      <p className="text-[9px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="title-font mt-0.5 truncate text-sm font-black" style={{ color: tone }}>{value}</p>
    </div>
  );
}

