import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { profileUpdateSchema } from "@/lib/validators";
import type { NurseFullProfile } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data: profile, error } = await supabase
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

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Nurse profile not found", details: error.message },
        { status: 404 }
      );
    }
    
    if (!profile) {
      return NextResponse.json(
        { error: "Nurse profile not found" },
        { status: 404 }
      );
    }

    // Non-admin users can only view their own profile
    if (
      session.user.role !== "admin" &&
      profile.user_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ profile: profile as NurseFullProfile });
  } catch (error) {
    console.error("Nurse profile GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Fetch the profile to check ownership
    const { data: existingProfile, error: fetchError } = await supabase
      .from("nurse_profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .single();

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
      return NextResponse.json(
        { error: "Nurse profile not found", details: fetchError.message },
        { status: 404 }
      );
    }
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: "Nurse profile not found" },
        { status: 404 }
      );
    }

    // Must be the owner or an admin
    if (
      session.user.role !== "admin" &&
      existingProfile.user_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate the update payload
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("nurse_profiles")
      .update(updates)
      .eq("id", profileId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Nurse profile PUT error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
