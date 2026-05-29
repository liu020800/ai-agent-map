"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Filter, Radio } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import CountUp from "@/components/react-bits/CountUp";
import BlurText from "@/components/react-bits/BlurText";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingData = { tools: Array<{name:string;count:number}>; provinces: Array<{name:string;value:number}>; levels: Array<{level:number;count:number}>; };

export default function MapPage() {
  const [data, setData] = useState<RankingData|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [userFilter, setUserFilter] = useState<"all"|"agent"|"app">("all");
  const [selectedTool, setSelectedTool] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/ranking",{cache:"no-store"}).then(res=>{if(!res.ok) throw new Error("加载失败");return res.json();}).then((json:RankingData)=>{if(active)setData(json);}).catch(err=>{if(active)setError(err instanceof Error?err.message:"加载失败");});
    return ()=>{active=false;};
  }, []);

  const sortedProvinces = useMemo(()=>[...(data?.provinces??[])].sort((a,b)=>b.value-a.value),[data]);
  const topTools = useMemo(()=>data?.tools.slice(0,10)??[],[data]);
  const totalSignals = useMemo(()=>sortedProvinces.reduce((s,p)=>s+p.value,0),[sortedProvinces]);

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
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"/><span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"/></span>
          <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase">Signal Radar</p>
        </div>
        <BlurText text="全国 AI 信号雷达" className="text-3xl font-black text-white sm:text-4xl" delay={100} direction="bottom"/>
        <p className="mt-2 text-sm text-neutral-500">已捕获 <span className="text-white font-bold">{totalSignals}</span> 个信号，覆盖 <span className="text-white font-bold">{sortedProvinces.length}</span> 个省份</p>
      </motion.div>

      {error&&<p className="mb-6 text-sm text-red-400 rounded-xl border border-red-500/20 bg-red-500/5 p-4">{error}</p>}

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500"><Filter className="h-3 w-3"/> 信号类型</div>
        {(["all","agent","app"] as const).map(f=>(
          <motion.button key={f} onClick={()=>setUserFilter(f)} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${userFilter===f?"bg-white/10 text-white border border-white/20":"bg-white/[0.03] text-neutral-400 border border-neutral-800 hover:border-neutral-700"}`}>
            {f==="all"?"全部信号":f==="agent"?"Agent 信号":"App 信号"}
          </motion.button>
        ))}
        {topTools.length>0&&(
          <select value={selectedTool} onChange={e=>setSelectedTool(e.target.value)} className="rounded-lg border border-neutral-800 bg-[#0a0a0a] px-3 py-2 text-xs text-neutral-400 focus:border-neutral-600 focus:outline-none">
            <option value="">所有装备</option>
            {topTools.map(t=><option key={t.name} value={t.name}>{t.name} ({t.count})</option>)}
          </select>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <SpotlightCard className="p-2" spotlightColor="rgba(99,102,241,0.06)">
            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              <ChinaMapChart data={data?.provinces??[]} filter={userFilter}/>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <SpotlightCard className="p-4" spotlightColor="rgba(99,102,241,0.06)">
            <div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 text-neutral-400"/><span className="text-sm font-bold text-white">据点排行</span></div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {sortedProvinces.slice(0,20).map((p,i)=>(
                <motion.div key={p.name} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.03}}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${i<3?"bg-white/5 border border-neutral-800":"hover:bg-white/[0.03]"}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${i<3?"bg-white/10 text-white":"bg-white/5 text-neutral-500"}`}>{i+1}</span>
                    <span className="text-sm font-medium text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {i<3&&<Radio className="h-3 w-3 text-neutral-400 animate-pulse"/>}
                    <CountUp to={p.value} className="text-sm font-bold text-white tabular-nums" duration={1}/>
                  </div>
                </motion.div>
              ))}
            </div>
            {sortedProvinces.length===0&&(
              <div className="flex flex-col items-center gap-3 py-12 text-neutral-500">
                <Radio className="h-8 w-8 text-neutral-600"/>
                <p className="text-sm text-center">这里还没有 Agent 信号，<br/>成为第一个点亮它的人。</p>
              </div>
            )}
          </SpotlightCard>
        </motion.div>
      </div>
    </main>
  );
}
