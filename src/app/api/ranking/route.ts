import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type UserRow = {
  tools: string[] | null;
  province: string | null;
  ai_level: number | null;
};

export async function GET() {
  const { data, error } = await supabase.from("users").select("tools, province, ai_level").limit(50000);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed to load ranking data" }, { status: 500 });
  }

  const toolMap = new Map<string, number>();
  const provinceMap = new Map<string, number>();
  const levelMap = new Map<number, number>();

  for (const row of data as UserRow[]) {
    const tools = row.tools ?? [];
    for (const tool of tools) {
      toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
    }
    if (row.province) {
      provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
    }
    const level = row.ai_level ?? 1;
    levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
  }

  const tools = Array.from(toolMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const provinces = Array.from(provinceMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const levels = Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({
    level,
    count: levelMap.get(level) ?? 0,
  }));

  return NextResponse.json({ tools, provinces, levels });
}
