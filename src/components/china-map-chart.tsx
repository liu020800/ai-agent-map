"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ReactECharts from "echarts-for-react";

echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

type MapChartProps = {
  data: Array<{ name: string; value: number }>;
};

const CHINA_GEO_URL = "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

export default function ChinaMapChart({ data }: MapChartProps) {
  const [geoLoaded, setGeoLoaded] = useState(false);
  const chartRef = useRef<ReactECharts | null>(null);

  useEffect(() => {
    let active = true;
    fetch(CHINA_GEO_URL)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        echarts.registerMap("china", json as Parameters<typeof echarts.registerMap>[1]);
        setGeoLoaded(true);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  const option = useMemo(
    () => ({
      tooltip: { trigger: "item", formatter: "{b}<br/>用户数：{c}" },
      visualMap: {
        min: 0,
        max,
        text: ["高", "低"],
        realtime: false,
        calculable: true,
        inRange: { color: ["#0f172a", "#1e3a5f", "#2563eb", "#7c3aed", "#f43f5e"] },
      },
      series: [
        {
          type: "map",
          map: "china",
          roam: true,
          label: { show: false },
          emphasis: { label: { show: true, color: "#fff" } },
          data,
        },
      ],
    }),
    [data, max]
  );

  if (!geoLoaded) {
    return <div className="grid h-[420px] place-items-center text-slate-400">地图数据加载中...</div>;
  }

  return (
    <ReactECharts
      ref={chartRef}
      style={{ height: 480 }}
      option={option}
      notMerge
      lazyUpdate
    />
  );
}
