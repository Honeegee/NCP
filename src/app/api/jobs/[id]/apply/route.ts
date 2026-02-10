import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "nurse") {
      return NextResponse.json({ error: "Only nurses can apply" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, is_active")
      .eq("id", id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!job.is_active) {
      return NextResponse.json({ error: "Job is no longer active" }, { status: 400 });
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("nurse_user_id", session.user.id)
      .eq("job_id", id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 409 });
    }

    // Create application
    const { data: application, error } = await supabase
      .from("job_applications")
      .insert({
        nurse_user_id: session.user.id,
        job_id: id,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already applied" }, { status: 409 });
      }
      console.error("Apply error:", error);
      return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Apply POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
