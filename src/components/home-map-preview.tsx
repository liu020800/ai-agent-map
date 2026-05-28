"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });

type ProvinceStat = { name: string; value: number };

export default function HomeMapPreview() {
  const [provinces, setProvinces] = useState<ProvinceStat[]>([]);

  useEffect(() => {
    fetch("/api/ranking", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setProvinces(j.provinces || []))
      .catch(() => {});
  }, []);

  return <ChinaMapChart data={provinces} />;
}
