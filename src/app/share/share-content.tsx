"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { levelName } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { motion } from "framer-motion";
import { Download, RefreshCw, Sparkles, Shield, Swords, MapPin, Star, Wifi } from "lucide-react";
import SharePanel from "@/components/share-panel";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import ShinyText from "@/components/react-bits/ShinyText";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type CardData = { nickname:string;ai_level:number;ai_level_name:string;primary_tool:string;tools:string[];avatar_seed:string;province:string;created_at:string;user_number:number; };

const RARITY: Record<number,{name:string;color:string;border:string;label:string;accent:string}> = {
  1:{name:"普通",color:"text-neutral-500",border:"border-neutral-500/30",label:"R",accent:"#737373"},
  2:{name:"稀有",color:"text-blue-400",border:"border-blue-500/40",label:"SR",accent:"#3b82f6"},
  3:{name:"史诗",color:"text-purple-400",border:"border-purple-500/40",label:"SSR",accent:"#a855f7"},
  4:{name:"传说",color:"text-amber-400",border:"border-amber-500/40",label:"UR",accent:"#fbbf24"},
  5:{name:"神话",color:"text-red-400",border:"border-red-500/40",label:"LR",accent:"#ef4444"},
};
const POWER: Record<number,number> = {1:100,2:500,3:2000,4:8000,5:50000};

export default function ShareContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const cardRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<CardData|null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string|null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/cards/${slug}`).then(r=>r.ok?r.json():null).then(d=>{if(d){setCard(d);setName(d.nickname);setLevel(d.ai_level);setTool(d.primary_tool||d.tools?.[0]||"");}}).catch(()=>{}).finally(()=>setLoading(false));
  }, [slug]);

  const generateAiAvatar = useCallback(async () => {
    setAvatarLoading(true);
    try {
      const res = await fetch("/api/generate-avatar", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({seed:card?.avatar_seed||name+Date.now(),level:card?.ai_level||level,tools:card?.tools||[tool]})});
      const d = await res.json();
      if (d.url) setAiAvatarUrl(d.url);
    } catch{} finally {setAvatarLoading(false);}
  }, [card,name,level,tool]);

  useEffect(() => {if(card||slug) generateAiAvatar();}, [card,slug,generateAiAvatar]);

  const pixelAvatarSvg = useMemo(()=>generateAvatarSvg(card?.avatar_seed||name+level),[card?.avatar_seed,name,level]);
  const displayName = card?.nickname||name;
  const displayLevel = card?levelName(card.ai_level):levelName(level);
  const displayTool = card?.primary_tool||tool;
  const userNumber = card?.user_number;
  const currentLevel = card?.ai_level||level;
  const rarity = RARITY[currentLevel]||RARITY[1];
  const power = POWER[currentLevel]||100;

  const handleDownload = useCallback(async()=>{
    if(!cardRef.current) return;
    setGenerating(true);
    try{const dataUrl=await toPng(cardRef.current,{cacheBust:true,pixelRatio:2});const link=document.createElement("a");link.download=`ai-agent-card-${slug||"custom"}.png`;link.href=dataUrl;link.click();}finally{setGenerating(false);}
  },[slug]);

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-6">
        <ParticlesBG className="opacity-20" count={20} />
        <SciFiLoader text="正在扫描 AI 身份信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1100px] px-6 py-8">
      <ParticlesBG className="opacity-15" count={15} />

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-white/5 px-4 py-1.5 mb-3">
          <Wifi className="h-3 w-3 text-neutral-400"/>
          <span className="text-[10px] font-semibold tracking-[0.3em] text-neutral-400 uppercase">AI Agent Passport</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">{card?"你的 AI 身份档案":"生成 AI 身份卡"}</h1>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Passport Card */}
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <div ref={cardRef} className={`relative mx-auto max-w-[380px] overflow-hidden rounded-2xl border-2 ${rarity.border}`}
            style={{aspectRatio:"3/4",background:"#0a0a0a"}}>
            <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 50% 30%, ${rarity.accent}15, transparent 70%)`}} />
            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div className="absolute inset-x-0 h-px" style={{background:`linear-gradient(90deg, transparent, ${rarity.accent}40, transparent)`}}
                animate={{y:["-10%","110%"]}} transition={{repeat:Infinity,duration:4,ease:"linear"}} />
            </div>

            <div className="relative flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" style={{color:rarity.accent}}/>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{color:rarity.accent}}>AI AGENT</span>
                </div>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${rarity.color} ${rarity.border}`}>{rarity.label}</span>
              </div>

              <div className="flex justify-center mb-5">
                <div className={`relative h-28 w-28 rounded-xl border-2 overflow-hidden ${rarity.border}`}
                  style={{boxShadow:`0 0 30px ${rarity.accent}20`}}>
                  {aiAvatarUrl?<img src={aiAvatarUrl} alt="Avatar" className="h-full w-full object-cover"/>:<div className="h-full w-full" dangerouslySetInnerHTML={{__html:pixelAvatarSvg}}/>}
                  {avatarLoading&&<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"><Sparkles className="h-5 w-5 animate-pulse" style={{color:rarity.accent}}/></div>}
                </div>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-xl font-black text-white mb-1">{displayName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-3 w-3" style={{color:rarity.accent}}/>
                  <span className={`text-xs font-bold ${rarity.color}`}>{rarity.name}</span>
                  <span className="text-xs text-neutral-500">·</span>
                  <ShinyText text={displayLevel} className="text-xs font-medium" speed={4} color="#525252" shineColor="#d4d4d4"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-neutral-800 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-neutral-500 mb-1">战斗力</p>
                  <CountUp to={power} className="text-xl font-black text-white" duration={1.5}/>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-neutral-500 mb-1">编号</p>
                  <p className="text-xl font-black text-white">#{userNumber?String(userNumber).padStart(6,"0"):"000000"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-white/[0.02] p-3 mb-4">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-neutral-500"><Swords className="h-3 w-3"/> 已装备</p>
                <div className="flex flex-wrap gap-1.5">
                  {(card?.tools||[tool]).slice(0,4).map(t=>(
                    <span key={t} className="rounded-md border px-2 py-0.5 text-[10px] font-medium" style={{borderColor:`${rarity.accent}30`,color:rarity.accent,background:`${rarity.accent}10`}}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-3.5 w-3.5 text-neutral-400"/>
                <span className="text-xs text-neutral-400">{card?.province||"未知"}</span>
              </div>

              <div className="mt-auto border-t border-neutral-800 pt-3 flex items-center justify-between">
                <div><p className="text-[9px] text-neutral-600">扫码生成你的 AI 身份</p><p className="text-[8px] text-neutral-700">liusq.icu</p></div>
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-neutral-800 flex items-center justify-center"><span className="text-[8px] text-neutral-600">QR</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <div className="space-y-4">
            {!card&&(
              <SpotlightCard className="space-y-3 p-5" spotlightColor="rgba(99,102,241,0.06)">
                <label className="block text-sm text-neutral-400">昵称<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3 text-sm text-white focus:border-neutral-600 focus:outline-none"/></label>
                <label className="block text-sm text-neutral-400">AI 等级<select value={level} onChange={e=>setLevel(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3 text-sm text-white focus:border-neutral-600 focus:outline-none">{[1,2,3,4,5].map(lv=><option key={lv} value={lv}>{levelName(lv)}</option>)}</select></label>
                <label className="block text-sm text-neutral-400">主力工具<input value={tool} onChange={e=>setTool(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3 text-sm text-white focus:border-neutral-600 focus:outline-none"/></label>
                <motion.button onClick={generateAiAvatar} disabled={avatarLoading} whileHover={{scale:1.02}} whileTap={{scale:0.98}} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
                  <Sparkles className="h-4 w-4"/> {avatarLoading?"AI 生成中...":"生成 AI 头像"}
                </motion.button>
              </SpotlightCard>
            )}

            <SharePanel title="AI Agent 身份卡" userNumber={userNumber??null} levelName={displayLevel} primaryTool={displayTool} slug={slug} imageUrl={aiAvatarUrl||undefined} onDownload={handleDownload}/>

            <div className="flex gap-3">
              <motion.button onClick={handleDownload} disabled={generating} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
                <Download className="h-4 w-4"/> {generating?"生成中...":"保存身份卡"}
              </motion.button>
              <a href="/survey" className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-white/5 transition-colors">
                <RefreshCw className="h-4 w-4"/> 再测一次
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
