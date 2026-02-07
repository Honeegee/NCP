import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data: profile } = await supabase
      .from("nurse_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();

    // Support adding multiple skills at once (comma-separated)
    const skillNames: string[] = Array.isArray(body.skills)
      ? body.skills
      : body.skill_name
        ? body.skill_name.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    if (skillNames.length === 0) {
      return NextResponse.json({ error: "No skills provided" }, { status: 400 });
    }

    const records = skillNames.map((name) => ({
      nurse_id: profile.id,
      skill_name: name,
      proficiency: body.proficiency || "basic",
    }));

    const { data, error } = await supabase
      .from("nurse_skills")
      .insert(records)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
