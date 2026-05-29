"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { levelName } from "@/lib/level";
import { motion } from "framer-motion";
import { Trophy, MapPin, BarChart3, Swords, Crown, Medal, Zap } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";
import GradientText from "@/components/react-bits/GradientText";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingData = { tools: Array<{name:string;count:number}>; provinces: Array<{name:string;value:number}>; levels: Array<{level:number;count:number}>; };

const RANK_ICONS = [Crown, Trophy, Medal];

export default function RankingPage() {
  const [data, setData] = useState<RankingData|null>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking",{cache:"no-store"}).then(async res=>{if(!res.ok)throw new Error("加载失败");if(active)setData(await res.json());}).catch(e=>{if(active)setError(e instanceof Error?e.message:"加载失败");});
    return ()=>{active=false;};
  }, []);

  const levelMax = useMemo(()=>Math.max(1,...((data?.levels??[]).map(l=>l.count))),[data]);

  if (!data && !error) {
    return (
      <main className="relative mx-auto flex min-h-[80vh] max-w-[1200px] items-center justify-center px-6">
        <ParticlesBG className="opacity-20" count={25}/>
        <SciFiLoader text="正在扫描全国 AI 信号..."/>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1200px] px-6 py-8">
      <ParticlesBG className="opacity-10" count={15}/>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-neutral-400"/>
          <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase">Leaderboard</p>
        </div>
        <BlurText text="全国 AI 排行榜" className="text-3xl font-black text-white sm:text-4xl" delay={100} direction="bottom"/>
        <p className="mt-2 text-sm text-neutral-500">基于真实用户数据的装备热度、据点分布与等级排名</p>
      </motion.div>

      {error&&<p className="mb-6 text-sm text-red-400 rounded-xl border border-red-500/20 bg-red-500/5 p-4">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tools */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <SpotlightCard className="p-5" spotlightColor="rgba(251,191,36,0.06)">
            <div className="flex items-center gap-2 mb-5"><Swords className="h-4 w-4 text-neutral-400"/><span className="text-sm font-bold text-white">热门装备榜</span></div>
            <div className="space-y-1">
              {(data?.tools??[]).slice(0,10).map((item,i)=>{
                const Icon = RANK_ICONS[i]||null;
                return (
                  <motion.div key={item.name} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.05}} whileHover={{x:4}}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${i<3?"bg-white/5 border border-white/[0.08]":"hover:bg-white/[0.03]"}`}>
                    <span className="flex items-center gap-2.5">
                      {Icon?<Icon className="h-4 w-4 text-neutral-400"/>:<span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-neutral-500">{i+1}</span>}
                      <span className="text-sm font-medium text-white">{item.name}</span>
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">{item.count}</span>
                  </motion.div>
                );
              })}
              {data&&data.tools.length===0&&<div className="flex flex-col items-center gap-2 py-8"><Zap className="h-6 w-6 text-neutral-600"/><p className="text-center text-sm text-neutral-500">还没有 Agent 信号</p></div>}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Provinces */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <SpotlightCard className="p-5" spotlightColor="rgba(34,211,238,0.06)">
            <div className="flex items-center gap-2 mb-5"><MapPin className="h-4 w-4 text-neutral-400"/><span className="text-sm font-bold text-white">据点排行</span></div>
            <div className="space-y-1">
              {(data?.provinces??[]).slice(0,10).map((item,i)=>(
                <motion.div key={item.name} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.05}} whileHover={{x:4}}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-all">
                  <span className="flex items-center gap-2.5">
                    <span className={`flex h-4 w-4 items-center justify-center text-[10px] font-bold ${i<3?"text-white":"text-neutral-500"}`}>{i+1}</span>
                    <span className="text-sm font-medium text-white">{item.name}</span>
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">{item.value}</span>
                </motion.div>
              ))}
              {data&&data.provinces.length===0&&<p className="py-8 text-center text-sm text-neutral-500">暂无据点数据</p>}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Levels */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <SpotlightCard className="p-5" spotlightColor="rgba(168,85,247,0.06)">
            <div className="flex items-center gap-2 mb-5"><BarChart3 className="h-4 w-4 text-neutral-400"/><span className="text-sm font-bold text-white">等级分布</span></div>
            <div className="space-y-3">
              {(data?.levels??[]).map((item,i)=>(
                <motion.div key={item.level} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.08}}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{levelName(item.level)}</span>
                    <CountUp to={item.count} className="text-sm font-bold text-white tabular-nums" duration={1}/>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div initial={{width:0}} animate={{width:`${Math.min(100,(item.count/levelMax)*100)}%`}} transition={{delay:0.4+i*0.1,duration:0.8}}
                      className="h-full rounded-full bg-white"/>
                  </div>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </main>
  );
}
