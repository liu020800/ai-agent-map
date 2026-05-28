"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ReactECharts from "echarts-for-react";

echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

// Province name normalization: DataV JSON uses short names like "北京市" -> need to match "北京"
const PROVINCE_ALIAS: Record<string, string> = {
  "北京市": "北京", "天津市": "天津", "上海市": "上海", "重庆市": "重庆",
  "河北省": "河北", "山西省": "山西", "辽宁省": "辽宁", "吉林省": "吉林",
  "黑龙江省": "黑龙江", "江苏省": "江苏", "浙江省": "浙江", "安徽省": "安徽",
  "福建省": "福建", "江西省": "江西", "山东省": "山东", "河南省": "河南",
  "湖北省": "湖北", "湖南省": "湖南", "广东省": "广东", "海南省": "海南",
  "四川省": "四川", "贵州省": "贵州", "云南省": "云南", "陕西省": "陕西",
  "甘肃省": "甘肃", "青海省": "青海", "台湾省": "台湾",
  "内蒙古自治区": "内蒙古", "广西壮族自治区": "广西", "西藏自治区": "西藏",
  "宁夏回族自治区": "宁夏", "新疆维吾尔自治区": "新疆",
  "香港特别行政区": "香港", "澳门特别行政区": "澳门",
};

function normalizeName(name: string): string {
  return PROVINCE_ALIAS[name] || name;
}

type MapChartProps = {
  data: Array<{ name: string; value: number }>;
  filter?: "all" | "agent" | "app";
};

const DEFAULT_PROVINCES = [
  "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
  "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
  "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾",
  "内蒙古", "广西", "西藏", "宁夏", "新疆", "香港", "澳门",
];

export default function ChinaMapChart({ data, filter }: MapChartProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const chartRef = useRef<ReactECharts | null>(null);

  const loadMap = useCallback(async () => {
    try {
      setLoadError(false);
      const res = await fetch("/maps/china.json");
      if (!res.ok) throw new Error("Failed to load map");
      const json = await res.json();
      // Normalize province names in GeoJSON features
      if (json.features) {
        for (const f of json.features) {
          if (f.properties?.name) {
            f.properties.name = normalizeName(f.properties.name);
          }
        }
      }
      echarts.registerMap("china", json);
      setMapLoaded(true);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  // Merge with default provinces to ensure all show even with 0 data
  const dataMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of DEFAULT_PROVINCES) m.set(p, 0);
    for (const d of data) m.set(d.name, d.value);
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const max = useMemo(() => Math.max(1, ...dataMap.map((d) => d.value)), [dataMap]);

  const option = useMemo(
    () => ({
      tooltip: { trigger: "item" as const, formatter: "{b}<br/>用户数：{c}" },
      visualMap: {
        min: 0,
        max,
        text: ["高", "低"],
        realtime: false,
        calculable: true,
        inRange: { color: ["#0f172a", "#1e3a5f", "#2563eb", "#7c3aed", "#f43f5e"] },
        textStyle: { color: "#94a3b8" },
      },
      series: [
        {
          type: "map" as const,
          map: "china",
          roam: true,
          label: { show: false },
          emphasis: { label: { show: true, color: "#fff", fontSize: 12 } },
          data: dataMap,
        },
      ],
    }),
    [dataMap, max]
  );

  if (loadError) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-4 text-slate-400">
        <p>地图数据加载失败</p>
        <button onClick={loadMap} className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/30">重试</button>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          地图加载中...
        </div>
      </div>
    );
  }

  return <ReactECharts ref={chartRef} style={{ height: 480 }} option={option} notMerge lazyUpdate />;
}
