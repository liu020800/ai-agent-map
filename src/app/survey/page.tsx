"use client";

import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Download,
  FileText,
  MapPin,
  Radio,
  RefreshCw,
  ScanLine,
  Shield,
  Sparkles,
  Sword,
  Wand2,
} from "lucide-react";
import { PageShell, Section } from "@/components/ui";
import { generateAvatarSvg } from "@/lib/avatar";
import { submitCard } from "@/lib/api-client";
import {
  SURVEY_TOOLS,
  SURVEY_SCENARIOS,
  SURVEY_PROVINCES,
  deriveRole,
  deriveAgentLevel,
  deriveSignalStrength,
  submitSurvey,
  generateIdentityCard,
  generateIdentityId,
  buildIdentityId as buildIdentityIdFromSeed,
} from "@/lib/survey-service";
import { toolColor } from "@/data/mock";
import type { SurveyFormPayload } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;
type SubmitStatus = "idle" | "loading" | "success" | "error";

const STEPS: { key: Step; label: string; desc: string; icon: typeof Sword }[] = [
  { key: 1, label: "选择装备", desc: "装配你的 AI Agent 工具栈", icon: Sword },
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
  const [result, setResult] = useState<{ ai_level: number; ai_level_name: string; card_slug: string; avatar_seed: string } | null>(null);
  const [identityId, setIdentityId] = useState<string>(generateIdentityId());
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [cardSeed, setCardSeed] = useState<string>(() =>
    typeof window === "undefined" ? "" : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  );

  const identityCardRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(0);

  const role = useMemo(() => deriveRole(scenarios), [scenarios]);
  const level = useMemo(() => deriveAgentLevel(tools, userType), [tools, userType]);
  const signal = useMemo(() => deriveSignalStrength(level, scenarios.length), [level, scenarios.length]);
  const rarityAccent = RARITY_ACCENT[level] ?? "#22d3ee";
  const rarityName = RARITY_NAME[level] ?? "普通";

  const avatarSeed = useMemo(() => {
    if (result?.avatar_seed) return result.avatar_seed;
    return [nickname || "agent", userType, tools.join("|") || "none", String(level), cardSeed].join("-");
  }, [result, nickname, userType, tools, level, cardSeed]);

  const avatarSvg = useMemo(
    () => generateAvatarSvg(avatarSeed, 200, level, tools[0] ?? ""),
    [avatarSeed, level, tools],
  );

  const toolCount = tools.length;
  const scenarioCount = scenarios.length;

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

  const goNext = () => {
    if (!canNext) return;
    setStep((current) => (current < 4 ? ((current + 1) as Step) : current));
  };

  const goPrev = () => setStep((current) => (current > 1 ? ((current - 1) as Step) : current));

  const regenerateAvatar = () => {
    setCardSeed(Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  };

  const handleSubmit = async () => {
    setSubmitStatus("loading");
    setSubmitMessage("");
    const payload = buildPayload();
    try {
      const res = await submitCard({
        nickname: payload.nickname,
        province: payload.province,
        city: payload.city,
        user_type: payload.userType,
        tools: payload.tools,
        primary_tool: payload.tools[0],
        usage_frequency: "工作主力",
        usage_purpose: payload.scenarios,
        submit_duration_ms: Date.now() - startedAt.current,
      });
      setResult(res);
      setIdentityId(buildIdentityIdFromSeed(res.avatar_seed || avatarSeed));
      setCreatedAt(new Date().toISOString());
      setSubmitStatus("success");
      setSubmitMessage("信号已写入全国图谱");
    } catch (error) {
      const fallback = await submitSurvey(payload);
      setIdentityId(fallback.identityId);
      setCreatedAt(fallback.createdAt);
      setSubmitStatus("success");
      setSubmitMessage(error instanceof Error ? "本地预览已生成, 服务暂不可达" : "本地预览已生成");
    }
  };

  const shareText = useMemo(() => {
    const name = nickname.trim() || "匿名 Agent";
    const provinceText = city ? province + " · " + city : province;
    const toolList = tools.slice(0, 3).join("、") || "尚未装配";
    return "我是 " + name + ", " + role.title + ", " + rarityName + " 等级 " + level + "。主用工具: " + toolList + "。城市据点: " + provinceText + "。已在 AI Agent Map 生成我的身份卡 → " + (typeof window !== "undefined" ? window.location.origin : "https://liusq.icu");
  }, [nickname, role.title, rarityName, level, tools, province, city]);

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied("text");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const copyLink = async () => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      await navigator.clipboard.writeText(base + (result?.card_slug ? "/share?slug=" + result.card_slug : "/survey"));
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const downloadCard = useCallback(async () => {
    if (!identityCardRef.current) return;
    try {
      const dataUrl = await toPng(identityCardRef.current, { quality: 0.95, pixelRatio: 2, backgroundColor: "#05060a" });
      const link = document.createElement("a");
      link.download = "ai-agent-card-" + identityId + ".png";
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2400);
    } catch {
      setDownloaded(false);
    }
  }, [identityId]);

  const regenerateCard = async () => {
    regenerateAvatar();
    setIdentityId(generateIdentityId());
    setCreatedAt(new Date().toISOString());
    try {
      const fresh = await generateIdentityCard(buildPayload());
      setIdentityId(fresh.identityId);
      setCreatedAt(fresh.createdAt);
    } catch {
      /* keep local identity */
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-24 pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(34,211,238,0.16), transparent 28%), radial-gradient(circle at 88% 6%, rgba(168,85,247,0.14), transparent 30%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.10), transparent 36%)",
        }}
      />
      <div aria-hidden className="hero-noise" />

      <Section className="relative z-10" spacing="md">
        <PageShell width="wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hero-panel relative overflow-hidden rounded-[28px] p-6 sm:p-10"
          >
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-50" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
            </div>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2">
                  <ScanLine className="h-3.5 w-3.5 text-cyan-300/85" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Identity Creator</span>
                </div>
                <h1 className="title-font text-balance text-3xl font-black leading-[1.05] text-white sm:text-4xl lg:text-[58px]">
                  <span className="block">创建你的 AI Agent 身份档案</span>
                  <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                    四步生成, 立刻点亮地图
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                  选择你的装备、定义作战场景、写入城市信号, 生成专属 AI Agent Passport。每张卡都会永久写入全国图谱, 并出现在趋势榜、地区榜与角色榜里。
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
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

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 backdrop-blur-xl sm:p-7">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <StepShell key="step-1" title="Step 1 · 选择你的 AI 装备" hint="至少选择 1 个工具, 你可以随时调整">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {SURVEY_TOOLS.filter((tool) => userType === "agent" ? tool.category !== "app" : true).map((tool) => {
                        const active = tools.includes(tool.name);
                        return (
                          <SelectableCard
                            key={tool.id}
                            active={active}
                            accent={tool.tone}
                            label={tool.name}
                            description={tool.desc}
                            onClick={() => toggleTool(tool.name)}
                            category={categoryLabel(tool.category)}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-white/55">
                        已选 <span className="title-font text-base font-black text-white">{toolCount}</span> 件装备
                        {toolCount >= 3 ? <span className="ml-2 text-cyan-300">· 火力充足</span> : null}
                      </p>
                      <PrimaryNav step={step} onPrev={goPrev} onNext={goNext} canNext={canNext} />
                    </div>
                  </StepShell>
                ) : null}

                {step === 2 ? (
                  <StepShell key="step-2" title="Step 2 · 你的作战场景" hint="根据选择会自动派发角色称号">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {SURVEY_SCENARIOS.map((sc) => {
                        const active = scenarios.includes(sc.id);
                        return (
                          <SelectableCard
                            key={sc.id}
                            active={active}
                            accent={sc.tone}
                            label={sc.name}
                            description={sc.desc}
                            onClick={() => toggleScenario(sc.id)}
                            category="场景"
                          />
                        );
                      })}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-white/55">
                        已选 <span className="title-font text-base font-black text-white">{scenarioCount}</span> 个场景 · 角色: <span style={{ color: role.tone }} className="font-semibold">{role.title}</span>
                      </p>
                      <PrimaryNav step={step} onPrev={goPrev} onNext={goNext} canNext={canNext} />
                    </div>
                  </StepShell>
                ) : null}

                {step === 3 ? (
                  <StepShell key="step-3" title="Step 3 · 你的城市据点" hint="城市字段必填, 其他可以留空">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FieldInput label="省份" hint="选择你的省份信号中心">
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:shadow-[0_0_24px_-6px_rgba(34,211,238,0.4)]"
                        >
                          {SURVEY_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </FieldInput>

                      <FieldInput label="城市" hint="必填, 写入地图信号点">
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="例如: 张江、徐汇、滨江"
                          className="w-full rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:shadow-[0_0_24px_-6px_rgba(34,211,238,0.4)]"
                        />
                      </FieldInput>

                      <FieldInput label="昵称 (可选)" hint="留空则使用「匿名 Agent」">
                        <input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="你的 Agent 称号"
                          className="w-full rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:shadow-[0_0_24px_-6px_rgba(34,211,238,0.4)]"
                        />
                      </FieldInput>

                      <FieldInput label="一句话签名 (可选)" hint="展示在身份卡背面的副标题">
                        <input
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder="例如: 把 IDE 与 AI 接通的指挥官"
                          className="w-full rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:shadow-[0_0_24px_-6px_rgba(34,211,238,0.4)]"
                        />
                      </FieldInput>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-white/55">
                        城市: <span className="text-white">{city.trim() || "未填写"}</span> · 省份: <span className="text-white">{province}</span>
                      </p>
                      <PrimaryNav step={step} onPrev={goPrev} onNext={goNext} canNext={canNext} />
                    </div>
                  </StepShell>
                ) : null}

                {step === 4 ? (
                  <StepShell key="step-4" title="Step 4 · 你的 AI Agent Passport" hint="完成提交后, 卡片将永久写入全国图谱">
                    <IdentityCardPreview
                      ref={identityCardRef}
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
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                        {submitMessage ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 text-cyan-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {submitMessage}
                          </span>
                        ) : null}
                        {result?.card_slug ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono">
                            slug: {result.card_slug}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={regenerateCard} className="btn-lusion-outline !px-4 !py-2.5 !text-[11px]">
                          <RefreshCw className="h-3.5 w-3.5" /> 重新生成
                        </button>
                        <button type="button" onClick={downloadCard} className="btn-lusion-outline !px-4 !py-2.5 !text-[11px]">
                          <Download className="h-3.5 w-3.5" /> {downloaded ? "已下载 ✓" : "下载身份卡"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitStatus === "loading"}
                          className="btn-lusion !px-5 !py-2.5 !text-[11px] disabled:opacity-60"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {submitStatus === "loading" ? "写入中..." : "提交并点亮地图"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={copyShare} className="btn-lusion-outline !px-4 !py-2 !text-[11px]">
                        <Wand2 className="h-3.5 w-3.5" /> {copied === "text" ? "已复制 ✓" : "复制分享文案"}
                      </button>
                      <button type="button" onClick={copyLink} className="btn-lusion-outline !px-4 !py-2 !text-[11px]">
                        <Radio className="h-3.5 w-3.5" /> {copied === "link" ? "已复制 ✓" : "复制卡片链接"}
                      </button>
                      <Link href="/map" className="btn-lusion-outline !px-4 !py-2 !text-[11px]">
                        <MapPin className="h-3.5 w-3.5" /> 查看地图
                      </Link>
                      <button type="button" onClick={goPrev} className="btn-lusion-outline !px-4 !py-2 !text-[11px]">
                        <ArrowLeft className="h-3.5 w-3.5" /> 返回调整
                      </button>
                    </div>
                  </StepShell>
                ) : null}
              </AnimatePresence>
            </div>

            <SidePreview
              role={role}
              level={level}
              rarityName={rarityName}
              rarityAccent={rarityAccent}
              tools={tools}
              scenarios={scenarios}
              signal={signal}
              province={province}
              city={city}
              avatarSvg={avatarSvg}
              nickname={nickname}
            />
          </div>
        </PageShell>
      </Section>
    </main>
  );
}

function StepProgress({ step }: { step: Step }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/30 p-5">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Progress · 4 Steps</p>
      <h2 className="mt-2 title-font text-lg font-black text-white">角色创建器</h2>
      <ol className="mt-5 space-y-3">
        {STEPS.map((entry) => {
          const active = step === entry.key;
          const done = step > entry.key;
          return (
            <li
              key={entry.key}
              className={
                "relative flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition " +
                (active
                  ? "border-cyan-300/30 bg-cyan-300/[0.06]"
                  : done
                    ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                    : "border-white/[0.05] bg-white/[0.015]")
              }
            >
              <span
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black " +
                  (active
                    ? "border-cyan-300/40 bg-black/40 text-cyan-200"
                    : done
                      ? "border-emerald-300/30 bg-black/40 text-emerald-200"
                      : "border-white/[0.06] bg-black/30 text-white/55")
                }
              >
                {done ? <Check className="h-4 w-4" /> : entry.key}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{entry.label}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.22em] text-white/40">{entry.desc}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-white/35" aria-hidden />
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.span
          className="block h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-300"
          initial={false}
          animate={{ width: ((step / STEPS.length) * 100) + "%" }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        />
      </div>
    </div>
  );
}

function StepShell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="title-font text-xl font-black text-white sm:text-2xl">{title}</h2>
        <p className="text-xs text-white/45">{hint}</p>
      </div>
      {children}
    </motion.div>
  );
}

function SelectableCard({
  active,
  accent,
  label,
  description,
  onClick,
  category,
}: {
  active: boolean;
  accent: string;
  label: string;
  description: string;
  onClick: () => void;
  category: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition " +
        (active
          ? "border-transparent bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.025]")
      }
      style={
        active
          ? {
              borderColor: accent,
              boxShadow: "0 0 24px -6px " + accent + ", inset 0 1px 0 rgba(255,255,255,0.06)",
              transform: "translateY(-1px)",
            }
          : undefined
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={active ? undefined : { boxShadow: "0 0 24px -8px " + accent + "55" }}
      />
      {active ? (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-black"
          style={{ background: accent, boxShadow: "0 0 14px " + accent }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: active ? accent : "rgba(255,255,255,0.4)" }}
        >
          {category}
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: "0 0 6px " + accent }}
        />
      </div>
      <p className="text-base font-black text-white">{label}</p>
      <p className="text-xs leading-5 text-white/45">{description}</p>
    </button>
  );
}

function FieldInput({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/45">
        <span>{label}</span>
        <span className="text-white/30">{hint}</span>
      </span>
      {children}
    </label>
  );
}

function PrimaryNav({
  step,
  onPrev,
  onNext,
  canNext,
}: {
  step: Step;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  if (step === 4) return null;
  return (
    <div className="flex items-center gap-2">
      {step > 1 ? (
        <button type="button" onClick={onPrev} className="btn-lusion-outline !px-4 !py-2.5 !text-[11px]">
          <ArrowLeft className="h-3.5 w-3.5" /> 上一步
        </button>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="btn-lusion !px-5 !py-2.5 !text-[11px] disabled:opacity-50"
      >
        下一步 <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function categoryLabel(category: string): string {
  switch (category) {
    case "agent": return "编程 Agent";
    case "app": return "通用 AI";
    case "automation": return "自动化";
    case "local": return "本地模型";
    default: return "装备";
  }
}

function SidePreview({
  role,
  level,
  rarityName,
  rarityAccent,
  tools,
  scenarios,
  signal,
  province,
  city,
  avatarSvg,
  nickname,
}: {
  role: ReturnType<typeof deriveRole>;
  level: number;
  rarityName: string;
  rarityAccent: string;
  tools: string[];
  scenarios: string[];
  signal: number;
  province: string;
  city: string;
  avatarSvg: string;
  nickname: string;
}) {
  const scenarioNames = SURVEY_SCENARIOS.filter((s) => scenarios.includes(s.id)).map((s) => s.name);
  return (
    <aside className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-cyan-300">
        <Cpu className="h-4 w-4" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Live Preview</p>
          <h3 className="title-font text-lg font-black text-white">实时档案</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PreviewStat label="等级" value={"Lv. " + String(level).padStart(2, "0")} tone={rarityAccent} />
        <PreviewStat label="稀有度" value={rarityName} tone={rarityAccent} />
        <PreviewStat label="信号强度" value={signal.toLocaleString()} tone="#22d3ee" />
        <PreviewStat label="角色" value={role.title} tone={role.tone} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/30 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">头像预览</p>
        <div className="mt-3 flex justify-center">
          <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30" dangerouslySetInnerHTML={{ __html: avatarSvg }} />
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-white">{nickname || "匿名 Agent"}</p>
        <p className="text-center text-[11px] text-white/45">{province}{city ? " · " + city : ""}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/30 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">已选装备</p>
        {tools.length === 0 ? (
          <p className="mt-2 text-xs text-white/45">尚未选择</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tools.map((name) => (
              <span
                key={name}
                className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                style={{ color: toolColor(name), borderColor: toolColor(name) + "55", background: toolColor(name) + "1a" }}
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/30 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">作战场景</p>
        {scenarioNames.length === 0 ? (
          <p className="mt-2 text-xs text-white/45">尚未选择</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scenarioNames.map((name) => (
              <span key={name} className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/72">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-black/30 p-3">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, " + tone + ", transparent)" }} />
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-1 truncate text-sm font-black" style={{ color: tone }}>{value}</p>
    </div>
  );
}

type PreviewRole = ReturnType<typeof deriveRole>;

const IdentityCardPreview = forwardRef<HTMLDivElement, IdentityCardPreviewProps>(({
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
}, ref) => {
  const scenarioNames = SURVEY_SCENARIOS.filter((s) => scenarios.includes(s.id)).map((s) => s.name);
  const primaryTool = tools[0];
  const provinceText = city ? province + " · " + city : province;
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[28px] border border-white/[0.08] p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, rgba(34,211,238,0.10), rgba(168,85,247,0.10), rgba(236,72,153,0.10))",
        boxShadow: "0 28px 90px rgba(0,0,0,0.32), 0 0 60px " + rarityAccent + "22",
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: rarityAccent + "22" }} />
      <div aria-hidden className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full blur-3xl" style={{ background: "rgba(34,211,238,0.18)" }} />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">AI Agent Passport</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/55">Identity verified · {rarityName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold" style={{ color: rarityAccent, borderColor: rarityAccent + "55", background: rarityAccent + "12" }}>
              Lv. {String(level).padStart(2, "0")}
            </span>
            <span className="rounded-full border border-white/[0.06] bg-black/30 px-2.5 py-0.5 font-mono text-[10px] text-white/65">
              {identityId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">玩家</p>
            <h3 className="title-font mt-1 text-3xl font-black text-white sm:text-4xl">{nickname.trim() || "匿名 Agent"}</h3>
            <p className="mt-2 text-sm font-semibold" style={{ color: role.tone }}>{role.title}</p>
            {signature.trim() ? <p className="mt-2 text-sm text-white/55">「{signature}」</p> : null}
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/55">
              <MapPin className="h-3.5 w-3.5 text-cyan-300" /> {provinceText}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div
              className="relative h-32 w-32 overflow-hidden rounded-[24px] border-2 border-white/[0.06] bg-black/30"
              style={{ boxShadow: "0 0 32px " + rarityAccent + "55" }}
              dangerouslySetInnerHTML={{ __html: avatarSvg }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">装备</p>
            <p className="title-font mt-1 text-xl font-black text-white">{tools.length}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">场景</p>
            <p className="title-font mt-1 text-xl font-black text-white">{scenarioNames.length}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">信号</p>
            <p className="title-font mt-1 text-xl font-black" style={{ color: rarityAccent }}>{signal.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">主力工具</p>
            {tools.length === 0 ? (
              <p className="mt-2 text-sm text-white/45">尚未选择</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tools.slice(0, 4).map((name) => (
                  <span
                    key={name}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{ color: toolColor(name), borderColor: toolColor(name) + "55", background: toolColor(name) + "1a" }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">主用场景</p>
            {scenarioNames.length === 0 ? (
              <p className="mt-2 text-sm text-white/45">尚未选择</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scenarioNames.slice(0, 3).map((name) => (
                  <span key={name} className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/72">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.24em] text-white/40">
          <span>AI Agent Map</span>
          <span>Primary: {primaryTool ?? "未装配"}</span>
        </div>
      </div>
    </div>
  );
});

IdentityCardPreview.displayName = "IdentityCardPreview";

type IdentityCardPreviewProps = {
  nickname: string;
  role: PreviewRole;
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
};
