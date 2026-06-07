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
  Code2,
  Compass,
  Copy,
  Download,
  FileText,
  HardDrive,
  MapPin,
  MessageCircle,
  RefreshCw,
  ScanLine,
  Shield,
  Sword,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
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
import { displayLevel } from "@/lib/display";

type Step = 1 | 2 | 3 | 4;
type SubmitStatus = "idle" | "loading" | "success" | "error";

const STEPS: { key: Step; label: string; desc: string; icon: typeof Sword }[] = [
  { key: 1, label: "选择工具", desc: "选择常用 AI 工具", icon: Sword },
  { key: 2, label: "使用场景", desc: "选择主要用途", icon: FileText },
  { key: 3, label: "地区信息", desc: "填写省份城市", icon: MapPin },
  { key: 4, label: "生成身份卡", desc: "保存并分享", icon: Shield },
];

const RARITY_NAME = ["普通", "普通", "稀有", "史诗", "传说", "神话"];
const RARITY_ACCENT = ["#737373", "#737373", "#22d3ee", "#a855f7", "#fbbf24", "#fb7185"];
const COMMON_TOOL_NAMES = new Set([
  "Codex",
  "Claude Code",
  "ChatGPT",
  "Claude",
  "DeepSeek",
  "Dify",
  "Ollama",
  "n8n",
  "Cursor",
  "OpenCode",
  "OpenClaw",
  "Hermes",
  "Docker",
  "NAS",
]);

const AGENT_PRIORITY_TOOLS = ["Codex", "Claude Code", "OpenCode", "Cursor", "Dify", "n8n"];
const APP_PRIORITY_TOOLS = ["ChatGPT", "OpenAI", "DeepSeek", "豆包", "Kimi", "通义千问"];

export default function SurveyPage() {
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<"agent" | "app">("agent");
  const [tools, setTools] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [province, setProvince] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [identityId, setIdentityId] = useState<string>("AAM-2026-0000");
  const [createdAt, setCreatedAt] = useState<string>("2026-01-01T00:00:00.000Z");
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [existingCard, setExistingCard] = useState<AgentCardRecord | null>(null);
  const [recoverNickname, setRecoverNickname] = useState("");
  const [recoverResults, setRecoverResults] = useState<AgentCardRecord[]>([]);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [cardSeed, setCardSeed] = useState<string>("demo-card-seed");

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
  const provinceText = province && city ? `${province} · ${city}` : "待填写";
  const sortedSurveyTools = useMemo(() => {
    const priority = userType === "agent" ? AGENT_PRIORITY_TOOLS : APP_PRIORITY_TOOLS;
    return [...SURVEY_TOOLS].sort((a, b) => {
      const aRank = priority.indexOf(a.name);
      const bRank = priority.indexOf(b.name);
      if (aRank !== -1 || bRank !== -1) {
        return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
      }
      const aCommon = COMMON_TOOL_NAMES.has(a.name) ? 0 : 1;
      const bCommon = COMMON_TOOL_NAMES.has(b.name) ? 0 : 1;
      if (aCommon !== bCommon) return aCommon - bCommon;
      return a.name.localeCompare(b.name, "zh-CN");
    });
  }, [userType]);
  const commonTools = useMemo(() => sortedSurveyTools.filter((tool) => COMMON_TOOL_NAMES.has(tool.name)), [sortedSurveyTools]);
  const moreTools = useMemo(() => sortedSurveyTools.filter((tool) => !COMMON_TOOL_NAMES.has(tool.name)), [sortedSurveyTools]);

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
    const text = `我是 ${role.title} ${nickname || "匿名 Agent"}，常用 ${tools.join(" + ")}，地区 ${provinceText}，欢迎来看看我的 AI 身份卡。#AI Agent Map`;
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
            <div className="app-card-strong mx-auto max-w-3xl rounded-[28px] p-6 text-center sm:p-8">
              <p className="app-soft title-font text-[11px] uppercase tracking-[0.32em]">MY AGENT CARD</p>
              <h1 className="app-heading title-font mt-4 text-3xl font-black sm:text-5xl">你已经拥有 AI Agent 身份卡</h1>
              <p className="app-muted mt-4 text-sm leading-7">
                为避免重复消耗生图额度，系统已识别到你的浏览器身份。刷新或再次进入不会重新生成图片。
              </p>
              <div className="app-card-muted mt-6 overflow-hidden rounded-2xl">
                {existingCard.imageUrl ? (
                  <img src={existingCard.imageUrl} alt={`${existingCard.nickname} 的 AI Agent 身份卡`} className="mx-auto max-h-[520px] w-full object-contain" />
                ) : (
                  <div className="app-muted p-10">身份卡图片暂不可用</div>
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
              <div className="app-card mt-6 rounded-2xl p-4">
                <p className="app-heading mb-3 text-sm font-semibold">查询其他身份卡</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={recoverNickname} onChange={(e) => setRecoverNickname(e.target.value)} placeholder="输入昵称找回身份卡" className="app-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none" />
                  <button type="button" onClick={handleRecoverSearch} className="btn-rb-ghost justify-center">查询</button>
                </div>
                {recoverResults.length > 0 && (
                  <div className="mt-3 grid gap-2 text-left">
                    {recoverResults.map((card) => (
                      <Link key={card.cardId} href={`/share?cardId=${encodeURIComponent(card.cardId)}`} className="app-card-muted rounded-xl p-3 text-sm hover:border-[var(--app-border-strong)]">
                        {card.nickname} · {card.province}{card.city} · {card.cardId}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {submitMessage && <p className="app-muted mt-4 text-sm">{submitMessage}</p>}
              <p className="app-soft mt-5 text-xs">AI 生成内容 · 仅供娱乐分享，不代表真实身份认证。</p>
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
            className="hero-panel relative mb-5 overflow-hidden rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-50" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
            </div>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.45fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2">
                  <ScanLine className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-blue-600">生成身份卡</span>
                </div>
                <h1 className="title-font max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-gray-950 sm:text-5xl lg:text-[64px]">
                  生成你的 <span className="text-blue-700">AI 身份卡</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-gray-600 sm:text-lg">
                  选几个常用工具，填写昵称和地区，生成一张可以保存和分享的身份卡。
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">总计 4 步 · 约 60 秒</span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">支持 50+ AI 工具</span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">支持 10 大场景</span>
                </div>
              </div>

              <StepProgress step={step} />
            </div>
          </motion.div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs tracking-[0.16em] text-gray-500">
              <CircuitBoard className="h-3.5 w-3.5 text-blue-600" /> 用户类型
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-950")
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
                  <motion.div key="step-1" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={Sword} step={1} title="选择常用工具" subtitle="多选你日常使用的 AI 工具，先选常用的就好。">
                      <div className="space-y-5">
                        <ToolGroup title="常用工具" hint="推荐先从这里选择">
                          {commonTools.map((tool) => {
                            const selected = tools.includes(tool.name);
                            return (
                              <ToolCard
                                key={tool.id}
                                name={tool.name}
                                desc={tool.desc}
                                category={tool.category}
                                selected={selected}
                                onClick={() => toggleTool(tool.name)}
                              />
                            );
                          })}
                        </ToolGroup>
                        <ToolGroup title="更多工具" hint="如果你还在用其他工具，也可以继续补充">
                          {moreTools.map((tool) => {
                            const selected = tools.includes(tool.name);
                            return (
                              <ToolCard
                                key={tool.id}
                                name={tool.name}
                                desc={tool.desc}
                                category={tool.category}
                                selected={selected}
                                onClick={() => toggleTool(tool.name)}
                              />
                            );
                          })}
                        </ToolGroup>
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={FileText} step={2} title="使用场景" subtitle="多选你的主要用途。系统会据此生成你的角色称号。">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {SURVEY_SCENARIOS.map((s) => {
                          const selected = scenarios.includes(s.id);
                          return (
                            <ScenarioCard key={s.id} name={s.name} desc={s.desc} selected={selected} onClick={() => toggleScenario(s.id)} />
                          );
                        })}
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step-3" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={MapPin} step={3} title="地区信息" subtitle="填写城市、昵称和一句话签名，城市会进入全国玩家地图统计。">
                      <div className="grid gap-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="省份 / 据点" required>
                            <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full">
                              <option value="">待填写</option>
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
                            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的昵称" maxLength={24} />
                          </Field>
                          <Field label="一句话签名" hint="选填 · 写进身份卡">
                            <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="例: 让 AI 替你写代码" maxLength={40} />
                          </Field>
                        </div>
                      </div>
                    </StepShell>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step-4" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <StepShell icon={Shield} step={4} title="生成 AI 身份卡" subtitle="预览你的身份卡。提交后会把工具、角色和地区写进全国统计。">
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
                                <RefreshCw className="h-4 w-4 animate-spin" /> 正在生成身份卡...
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
                            你的 AI 身份卡已写入 <Link className="underline underline-offset-4" href="/map">全国玩家地图</Link>，可前往 <Link className="underline underline-offset-4" href="/share">分享页</Link> 获取链接。
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
  const progress = Math.round((step / STEPS.length) * 100);
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/40">
        <span>创建进度</span>
        <span className="text-cyan-300">STEP {String(step).padStart(2, "0")} / 04</span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={false}
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
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors duration-150 " +
                  (active
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : done
                    ? "border-neutral-300 bg-neutral-100 text-neutral-700"
                    : "border-neutral-200 bg-white text-neutral-300")
                }
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={"text-sm font-medium " + (active ? "text-neutral-950" : done ? "text-neutral-600" : "text-neutral-300")}>
                  {String(s.key).padStart(2, "0")} · {s.label}
                </p>
                <p className="truncate text-[11px] text-neutral-400">{s.desc}</p>
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
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="relative z-10">
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-[11px] text-neutral-500">Step {String(step).padStart(2, "0")} / 04</p>
          <h2 className="mt-1 text-xl font-medium text-neutral-950 sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        </div>
      </div>
      {children}
      </div>
    </div>
  );
}

function ToolGroup({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">{title}</h3>
          <p className="mt-1 text-xs text-neutral-400">{hint}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function ToolCard({
  name,
  desc,
  category,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  category: string;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = toolIconFor(category, name);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: 0, scale: 1 }}
      whileTap={{ scale: 0.99 }}
      className={
        "group relative grid min-h-[72px] grid-cols-[32px_1fr_auto] items-center gap-3 overflow-hidden rounded-lg border p-3 text-left transition-colors duration-150 " +
        (selected
          ? "border-neutral-400 bg-neutral-50"
          : "border-neutral-200 bg-white hover:bg-neutral-50")
      }
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-r bg-neutral-950"
        />
      )}
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
        >
          <Icon className="h-3.5 w-3.5 text-neutral-700" />
        </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-950">{name}</p>
        <p className="line-clamp-1 text-xs leading-5 text-neutral-500">{desc}</p>
      </div>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-2 py-0.5 text-[10px] text-neutral-700">
            <Check className="h-3 w-3" /> 已选
          </span>
        ) : (
          <span className="text-[10px] text-neutral-400">
            {category}
          </span>
        )}
    </motion.button>
  );
}

function toolIconFor(category: string, name: string) {
  if (category === "agent" || ["Codex", "Claude Code", "OpenCode", "Cursor"].includes(name)) return Terminal;
  if (category === "automation" || ["Dify", "n8n"].includes(name)) return Workflow;
  if (category === "local" || ["Ollama", "LM Studio", "Docker", "NAS"].includes(name)) return HardDrive;
  if (["ChatGPT", "OpenAI", "Claude", "DeepSeek", "豆包", "Kimi", "通义千问"].includes(name)) return MessageCircle;
  return Code2;
}

function ScenarioCard({
  name,
  desc,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: 0, scale: 1 }}
      whileTap={{ scale: 0.99 }}
      className={
        "group relative flex items-center gap-3 overflow-hidden rounded-lg border p-3 text-left transition-colors duration-150 " +
        (selected
          ? "border-neutral-400 bg-neutral-50"
          : "border-neutral-200 bg-white hover:bg-neutral-50")
      }
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-r bg-neutral-950"
        />
      )}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
      >
        <Compass className="h-4 w-4 text-neutral-700" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-neutral-950">{name}</p>
          {selected && <Check className="h-3.5 w-3.5 text-neutral-700" />}
        </div>
        <p className="truncate text-xs text-neutral-500">{desc}</p>
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
        <span className="text-xs font-medium text-neutral-600">
          {label} {required ? <span className="text-neutral-950">*</span> : null}
        </span>
        {hint ? <span className="text-[11px] text-neutral-400">{hint}</span> : null}
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
  const provinceText = province && city ? `${province} · ${city}` : "待填写";
  const previewSignature = signature.trim() || (tools.length > 0 && scenarioNames.length > 0 && province.trim() !== "" && city.trim() !== "" ? `我是 ${role.title}，常用 ${tools.length} 个 AI 工具，来自 ${provinceText}。` : "完成选择后自动生成");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <p className="text-sm font-medium text-neutral-950">实时身份卡</p>
        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500">
          实时预览
        </span>
      </div>

      <div
        className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex min-h-[520px] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <p className="text-xs text-neutral-500">AI 身份卡</p>
              <p className="mt-1 text-2xl font-medium tracking-[-0.03em] text-neutral-950">工具栈名片</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-neutral-400">ID</p>
              <p className="font-mono text-[11px] text-neutral-600">{identityId}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="absolute inset-3 rounded-lg border border-neutral-300" />
                <div className="absolute bottom-4 left-4 h-6 w-10 rotate-[-24deg] rounded border border-neutral-400" />
                <div className="absolute right-4 top-5 h-2 w-2 rounded-full bg-neutral-950" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-medium tracking-[-0.03em] text-neutral-950">{nickname.trim() || "匿名 Agent"}</p>
                <p className="mt-1 text-sm text-neutral-600">{role.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-700">
                    {displayLevel(level)} · {rarityName}
                  </span>
                  <span className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-700">
                    活跃度 {signal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <PreviewStat label="工具" value={tools.length ? `${tools.length}` : "待选择"} tone={rarityAccent} />
            <PreviewStat label="场景" value={scenarioNames.length ? `${scenarioNames.length}` : "待选择"} tone={rarityAccent} />
            <PreviewStat label="活跃度" value={signal.toLocaleString()} tone={rarityAccent} />
          </div>

          <div className="mt-4 space-y-2">
            <PassportLine label="地区" value={provinceText} tone={rarityAccent} />
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <p className="mb-2 text-xs text-neutral-500">常用工具</p>
              <div className="flex flex-wrap gap-1">
                {tools.length > 0 ? (
                  <>
                    {tools.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700"
                      >
                        {t}
                      </span>
                    ))}
                    {tools.length > 4 && (
                      <span className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-500">
                        +{tools.length - 4}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-neutral-400">待选择</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <p className="mb-2 text-xs text-neutral-500">使用场景</p>
              <div className="flex flex-wrap gap-1">
                {scenarioNames.length > 0 ? (
                  <>
                    {scenarioNames.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700">
                        {s}
                      </span>
                    ))}
                    {scenarioNames.length > 4 && (
                      <span className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-500">
                        +{scenarioNames.length - 4}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-neutral-400">待选择</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">分享签名</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-700">
              {previewSignature}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-950">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-[11px] text-neutral-400">AI Agent Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassportLine({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="truncate text-right text-sm font-medium text-neutral-950">{value}</span>
    </div>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
      <p className="text-[11px] text-neutral-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium tabular-nums text-neutral-950">{value}</p>
    </div>
  );
}

