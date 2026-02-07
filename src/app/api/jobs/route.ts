import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { jobSchema } from "@/lib/validators";
import type { Job } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const employmentType = searchParams.get("employment_type");

    // Only return active jobs
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true);

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (employmentType) {
      query = query.eq("employment_type", employmentType);
    }

    query = query.order("created_at", { ascending: false });

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Jobs query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs as Job[] });
  } catch (error) {
    console.error("Jobs list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate with jobSchema
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        ...parsed.data,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Job creation error:", error);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job: job as Job }, { status: 201 });
  } catch (error) {
    console.error("Job POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
