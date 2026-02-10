import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data: applications, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("nurse_user_id", session.user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Applications fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
