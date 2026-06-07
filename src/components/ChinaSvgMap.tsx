"use client";

import { useEffect, useMemo, useState } from "react";

type Feature = {
  type: "Feature";
  properties?: { name?: string };
  geometry?: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

type GeoJson = {
  type: "FeatureCollection";
  features: Feature[];
};

type MapDatum = {
  name: string;
  value: number;
};

const ALIAS: Record<string, string> = {
  北京市: "北京",
  天津市: "天津",
  上海市: "上海",
  重庆市: "重庆",
  河北省: "河北",
  山西省: "山西",
  辽宁省: "辽宁",
  吉林省: "吉林",
  黑龙江省: "黑龙江",
  江苏省: "江苏",
  浙江省: "浙江",
  安徽省: "安徽",
  福建省: "福建",
  江西省: "江西",
  山东省: "山东",
  河南省: "河南",
  湖北省: "湖北",
  湖南省: "湖南",
  广东省: "广东",
  海南省: "海南",
  四川省: "四川",
  贵州省: "贵州",
  云南省: "云南",
  陕西省: "陕西",
  甘肃省: "甘肃",
  青海省: "青海",
  台湾省: "台湾",
  内蒙古自治区: "内蒙古",
  广西壮族自治区: "广西",
  西藏自治区: "西藏",
  宁夏回族自治区: "宁夏",
  新疆维吾尔自治区: "新疆",
  香港特别行政区: "香港",
  澳门特别行政区: "澳门",
};

function normalizeName(name = "") {
  return ALIAS[name] || name;
}

function projectPoint(point: number[], bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number }) {
  const [lng, lat] = point;
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 88 + 6;
  return [x, y];
}

function ringPath(ring: number[][], bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number }) {
  return ring
    .map((point, index) => {
      const [x, y] = projectPoint(point, bounds);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function featurePath(feature: Feature, bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number }) {
  if (!feature.geometry) return "";
  if (feature.geometry.type === "Polygon") {
    return (feature.geometry.coordinates as number[][][]).map((ring) => ringPath(ring, bounds)).join(" ");
  }
  return (feature.geometry.coordinates as number[][][][])
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring, bounds)))
    .join(" ");
}

function collectBounds(features: Feature[]) {
  const points: number[][] = [];
  for (const feature of features) {
    if (!feature.geometry) continue;
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as number[][][]]
        : (feature.geometry.coordinates as number[][][][]);
    for (const polygon of polygons) {
      for (const ring of polygon) points.push(...ring);
    }
  }
  const lngs = points.map((point) => point[0]);
  const lats = points.map((point) => point[1]);
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

function featureCenter(feature: Feature, bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number }) {
  const points: number[][] = [];
  if (!feature.geometry) return [50, 50];
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);
  for (const polygon of polygons) {
    for (const ring of polygon) points.push(...ring);
  }
  const lng = points.reduce((sum, point) => sum + point[0], 0) / Math.max(points.length, 1);
  const lat = points.reduce((sum, point) => sum + point[1], 0) / Math.max(points.length, 1);
  return projectPoint([lng, lat], bounds);
}

function heatColor(value: number, max: number) {
  const ratio = max > 0 ? value / max : 0;
  if (value <= 0) return "#e8e8e8";
  if (ratio > 0.78) return "rgba(17, 17, 17, 0.86)";
  if (ratio > 0.52) return "rgba(17, 17, 17, 0.64)";
  if (ratio > 0.28) return "rgba(17, 17, 17, 0.42)";
  return "rgba(17, 17, 17, 0.22)";
}

export default function ChinaSvgMap({ data = [] }: { data?: MapDatum[] }) {
  const [geoJson, setGeoJson] = useState<GeoJson | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/maps/china.json")
      .then((res) => res.json())
      .then((json: GeoJson) => {
        if (active) setGeoJson(json);
      })
      .catch(() => {
        if (active) setGeoJson(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const valueMap = useMemo(() => new Map(data.map((item) => [item.name, item.value])), [data]);
  const max = useMemo(() => Math.max(1, ...data.map((item) => item.value)), [data]);

  const renderData = useMemo(() => {
    if (!geoJson?.features?.length) return null;
    const bounds = collectBounds(geoJson.features);
    return {
      bounds,
      features: geoJson.features.map((feature) => {
        const name = normalizeName(feature.properties?.name);
        const value = valueMap.get(name) ?? 0;
        return {
          name,
          value,
          path: featurePath(feature, bounds),
          center: featureCenter(feature, bounds),
        };
      }),
    };
  }, [geoJson, valueMap]);

  if (!renderData) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        全国信号预览
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl bg-neutral-50">
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="中国地图省份热力预览">
        <defs>
          <radialGradient id="chinaSvgDot" cx="50%" cy="50%" r="50%">
            <stop stopColor="#111111" stopOpacity="0.32" />
            <stop offset="1" stopColor="#111111" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g>
          {renderData.features.map((feature) => {
            const isHovered = hovered === feature.name;
            return (
              <path
                key={feature.name}
                d={feature.path}
                fill={isHovered ? "rgba(17, 17, 17, 0.9)" : heatColor(feature.value, max)}
                stroke="#ffffff"
                strokeWidth={isHovered ? 0.32 : 0.16}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => setHovered(feature.name)}
                onMouseLeave={() => setHovered(null)}
                className="transition-colors duration-200"
              />
            );
          })}
        </g>
        {renderData.features
          .filter((feature) => feature.value > 0)
          .map((feature) => {
            const [x, y] = feature.center;
            const radius = Math.max(0.75, Math.min(2.4, 0.7 + (feature.value / max) * 2.4));
            return (
              <g key={`${feature.name}-dot`}>
                <circle cx={x} cy={y} r={radius * 2.2} fill="url(#chinaSvgDot)" opacity="0.2" />
                <circle cx={x} cy={y} r={radius * 0.75} fill="#111111" opacity="0.72" />
              </g>
            );
          })}
      </svg>
      {hovered && (
        <div className="pointer-events-none absolute left-4 top-4 rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white">
          <span className="font-medium">{hovered}</span>
          <span className="ml-2 text-white/70">用户 {valueMap.get(hovered) ?? 0}</span>
        </div>
      )}
    </div>
  );
}
