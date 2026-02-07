import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { jobSchema } from "@/lib/validators";
import type { Job } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data: job, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ job: job as Job });
  } catch (error) {
    console.error("Job GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Auth check - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    // Verify the job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate with jobSchema (partial - allow updating individual fields)
    const parsed = jobSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Job update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job: updatedJob as Job });
  } catch (error) {
    console.error("Job PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Auth check - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    // Verify the job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Soft delete: set is_active to false
    const { data: deletedJob, error: deleteError } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .eq("id", id)
      .select("*")
      .single();

    if (deleteError) {
      console.error("Job soft delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete job" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Job deactivated successfully",
      job: deletedJob as Job,
    });
  } catch (error) {
    console.error("Job DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
