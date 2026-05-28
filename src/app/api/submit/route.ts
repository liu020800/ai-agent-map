import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SurveyPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SurveyPayload;

    if (!body?.province || !Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json({ error: "province and at least one tool are required" }, { status: 400 });
    }

    const normalizedUserType = body.user_type === "agent" ? "agent" : "app";

    const { data, error } = await supabase
      .from("users")
      .insert({
        province: body.province,
        city: body.city ?? null,
        user_type: normalizedUserType,
        tools: body.tools,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
