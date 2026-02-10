import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { novu } from "@/lib/novu";
import { matchJobs } from "@/lib/job-matcher";
import type { NurseFullProfile, Job } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Get the nurse profile for the current logged-in user
    const { data: profile, error: profileError } = await supabase
      .from("nurse_profiles")
      .select(
        `
        *,
        user:users!nurse_profiles_user_id_fkey(email, role),
        experience:nurse_experience(*),
        certifications:nurse_certifications(*),
        education:nurse_education(*),
        skills:nurse_skills(*),
        resumes(*)
      `
      )
      .eq("user_id", session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Nurse profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Get all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true);

    if (jobsError) {
      console.error("Jobs fetch error:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Run the matching algorithm
    const matches = matchJobs(
      profile as NurseFullProfile,
      jobs as Job[]
    );

    // Notify nurse for top match if score >= 70
    if (matches.length > 0 && matches[0].match_score >= 70) {
      try {
        await novu.trigger("job-match-found", {
          to: { subscriberId: session.user.id },
          payload: {
            score: matches[0].match_score,
            jobTitle: matches[0].job.title,
            facility: matches[0].job.facility_name,
            jobId: matches[0].job.id,
          },
        });
      } catch (err) {
        console.error("Novu job-match-found trigger failed:", err);
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
