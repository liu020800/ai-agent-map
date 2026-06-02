"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { MapChart, EffectScatterChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent, GeoComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ReactECharts from "echarts-for-react";
import SciFiLoader from "@/components/react-bits/SciFiLoader";

echarts.use([MapChart, EffectScatterChart, TooltipComponent, VisualMapComponent, GeoComponent, CanvasRenderer]);

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

const PROVINCE_CENTER: Record<string, [number, number]> = {
  北京: [116.40, 39.90], 天津: [117.20, 39.13], 上海: [121.47, 31.23], 重庆: [106.55, 29.56],
  河北: [114.48, 38.03], 山西: [112.55, 37.87], 辽宁: [123.43, 41.80], 吉林: [125.32, 43.90],
  黑龙江: [126.64, 45.75], 江苏: [118.78, 32.04], 浙江: [120.15, 30.28], 安徽: [117.27, 31.86],
  福建: [119.30, 26.08], 江西: [115.89, 28.68], 山东: [117.12, 36.65], 河南: [113.62, 34.75],
  湖北: [114.31, 30.52], 湖南: [112.98, 28.20], 广东: [113.27, 23.13], 海南: [110.35, 20.02],
  四川: [104.06, 30.67], 贵州: [106.71, 26.58], 云南: [102.71, 25.04], 陕西: [108.95, 34.27],
  甘肃: [103.84, 36.06], 青海: [101.78, 36.62], 台湾: [121.56, 25.04], 内蒙古: [111.67, 40.82],
  广西: [108.32, 22.82], 西藏: [91.11, 29.97], 宁夏: [106.27, 38.47], 新疆: [87.62, 43.82],
  香港: [114.17, 22.28], 澳门: [113.54, 22.19],
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMap();
  }, [loadMap]);

  const dataMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of DEFAULT_PROVINCES) m.set(p, 0);
    for (const d of data) m.set(d.name, d.value);
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const max = useMemo(() => Math.max(1, ...dataMap.map((d) => d.value)), [dataMap]);

  const scatterData = useMemo(
    () => dataMap
      .filter((item) => item.value > 0 && PROVINCE_CENTER[item.name])
      .map((item) => ({ name: item.name, value: [...PROVINCE_CENTER[item.name], item.value] })),
    [dataMap],
  );

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item" as const,
        backgroundColor: "rgba(8,10,16,0.92)",
        borderColor: "rgba(255,255,255,0.08)",
        textStyle: { color: "#e5e7eb", fontSize: 12 },
        formatter: (params: { name: string; value?: number | number[] }) => {
          const raw = Array.isArray(params.value) ? params.value[2] : params.value;
          return `${params.name}<br/>AI 信号：${raw ?? 0}`;
        },
      },
      visualMap: {
        min: 0,
        max,
        left: 16,
        bottom: 16,
        text: ["高热", "低热"],
        realtime: false,
        calculable: true,
        itemWidth: 10,
        itemHeight: 80,
        inRange: { color: ["#0b1220", "#163355", "#00d4ff", "#8b5cf6", "#fb7185"] },
        textStyle: { color: "rgba(255,255,255,0.5)" },
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
      },
      geo: {
        map: "china",
        roam: true,
        zoom: 1.05,
        label: { show: false },
        itemStyle: {
          borderColor: "rgba(255,255,255,0.14)",
          borderWidth: 1,
          areaColor: "#09111e",
          shadowColor: "rgba(0,212,255,0.08)",
          shadowBlur: 12,
        },
        emphasis: {
          label: { show: false },
          itemStyle: {
            areaColor: "#1e3a8a",
            borderColor: "#7dd3fc",
            shadowColor: "rgba(0,212,255,0.35)",
            shadowBlur: 20,
          },
        },
      },
      series: [
        {
          name: filter === "agent" ? "Agent 信号" : filter === "app" ? "App 信号" : "全部信号",
          type: "map" as const,
          map: "china",
          geoIndex: 0,
          roam: true,
          selectedMode: false,
          animationDuration: 800,
          animationDurationUpdate: 800,
          data: dataMap,
        },
        {
          type: "effectScatter" as const,
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: {
            period: 4,
            scale: 4,
            brushType: "stroke" as const,
          },
          symbolSize: (value: number[]) => Math.max(8, Math.min(22, 8 + value[2] * 1.4)),
          itemStyle: {
            color: "#00ffc8",
            shadowBlur: 20,
            shadowColor: "rgba(0,255,200,0.45)",
          },
          emphasis: {
            scale: true,
          },
          data: scatterData,
        },
      ],
    }),
    [dataMap, filter, max, scatterData],
  );

  if (loadError) {
    return (
      <div className="flex h-[480px] flex-col items-center justify-center gap-4 text-slate-400">
        <p>地图数据加载失败</p>
        <button onClick={loadMap} className="btn-lusion-outline !px-4 !py-2 !text-[11px]">重试加载</button>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="flex h-[480px] items-center justify-center">
        <SciFiLoader text="正在扫描全国 AI 信号..." />
      </div>
    );
  }

  return <ReactECharts ref={chartRef} style={{ height: 480 }} option={option} notMerge lazyUpdate />;
}
