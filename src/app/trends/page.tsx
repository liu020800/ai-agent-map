"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingResponse = { tools: Array<{name:string;count:number}>; };

export default function TrendsPage() {
  const [data, setData] = useState<RankingResponse|null>(null);
  useEffect(() => { fetch("/api/ranking",{cache:"no-store"}).then(r=>r.json()).then(j=>setData(j as RankingResponse)).catch(()=>{}); }, []);

  const chartOption = useMemo(() => {
    if (!data || data.tools.length === 0) return null;
    const sorted = [...data.tools].sort((a,b)=>b.count-a.count);
    return {
      tooltip: { trigger:"axis" as const, backgroundColor:"#0a0a0a", borderColor:"rgba(255,255,255,0.1)", textStyle:{color:"#e5e5e5",fontSize:12} },
      grid: { left:"3%", right:"4%", bottom:"3%", containLabel:true },
      xAxis: { type:"value" as const, axisLabel:{color:"#525252"}, splitLine:{lineStyle:{color:"rgba(255,255,255,0.03)"}} },
      yAxis: { type:"category" as const, data:sorted.map(t=>t.name).reverse(), axisLabel:{color:"#e5e5e5",fontSize:12}, axisLine:{lineStyle:{color:"rgba(255,255,255,0.04)"}} },
      series: [{ type:"bar", data:sorted.map(t=>t.count).reverse(),
        itemStyle: { borderRadius:[0,6,6,0], color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#404040"},{offset:1,color:"#737373"}]} },
        emphasis: { itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#525252"},{offset:1,color:"#a3a3a3"}]}} },
        barWidth:"60%",
      }],
    };
  }, [data]);

  if (!data) {
    return (
      <main className="relative mx-auto flex min-h-[80vh] max-w-[1200px] items-center justify-center px-6">
        <ParticlesBG className="opacity-20" count={20}/>
        <SciFiLoader text="正在扫描 AI 装备信号..."/>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1200px] px-6 py-8">
      <ParticlesBG className="opacity-10" count={10}/>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-neutral-400"/>
          <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase">Trend Battlefield</p>
        </div>
        <BlurText text="AI 装备趋势战场" className="text-3xl font-black text-white sm:text-4xl" delay={100} direction="bottom"/>
        <p className="mt-2 text-sm text-neutral-500">基于用户提交数据，查看各 AI 装备的使用热度排名</p>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
        <SpotlightCard className="p-4" spotlightColor="rgba(99,102,241,0.06)">
          {chartOption ? <ReactECharts option={chartOption} style={{height:Math.max(400,(data?.tools.length??0)*45)}}/> : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-500">
              <BarChart3 className="h-8 w-8 text-neutral-600"/><p className="text-sm">暂无装备数据</p>
            </div>
          )}
        </SpotlightCard>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(data?.tools??[]).map((tool,i)=>(
            <motion.div key={tool.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.04}} whileHover={{y:-2}}>
              <SpotlightCard className="p-4" spotlightColor={i<3?"rgba(99,102,241,0.08)":"rgba(99,102,241,0.04)"}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${i<3?"text-white":"text-neutral-500"}`}>#{i+1}</span>
                  {i<3&&<Zap className="h-3 w-3 text-neutral-400"/>}
                </div>
                <p className="text-sm font-bold text-white mb-1 truncate">{tool.name}</p>
                <CountUp to={tool.count} className={`text-xl font-black ${i<3?"text-white":"text-neutral-300"}`} duration={1.2}/>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
