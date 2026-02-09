import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { matchJobs } from "@/lib/job-matcher";
import type { NurseFullProfile, Job } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    const { data: profile, error: profileError } = await supabase
      .from("nurse_profiles")
      .select(
        `
        *,
        user:users(email, role),
        experience:nurse_experience(*),
        certifications:nurse_certifications(*),
        education:nurse_education(*),
        skills:nurse_skills(*),
        resumes(*)
      `
      )
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Nurse profile not found" }, { status: 404 });
    }

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true);

    if (jobsError) {
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const matches = matchJobs(profile as NurseFullProfile, jobs as Job[]);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Nurse matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
