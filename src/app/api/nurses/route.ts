import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Auth check - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const cert = searchParams.get("cert");
    const minExp = searchParams.get("min_exp");

    // Build the base query joining nurse_profiles with users
    let query = supabase
      .from("nurse_profiles")
      .select(
        `
        *,
        user:users!nurse_profiles_user_id_fkey(email, role),
        certifications:nurse_certifications(*),
        skills:nurse_skills(*)
      `
      );

    // Text search on first_name or last_name
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }

    // Filter by minimum years of experience
    if (minExp) {
      const minExpNum = parseInt(minExp, 10);
      if (!isNaN(minExpNum)) {
        query = query.gte("years_of_experience", minExpNum);
      }
    }

    // Order by most recently updated
    query = query.order("updated_at", { ascending: false });

    const { data: nurses, error } = await query;

    if (error) {
      console.error("Nurses query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch nurses" },
        { status: 500 }
      );
    }

    // Post-query filter by certification type (requires checking nested data)
    let filteredNurses = nurses;
    if (cert) {
      filteredNurses = nurses?.filter(
        (nurse: { certifications: { cert_type: string }[] }) =>
          nurse.certifications?.some(
            (c: { cert_type: string }) =>
              c.cert_type.toLowerCase() === cert.toLowerCase()
          )
      );
    }

    return NextResponse.json({ nurses: filteredNurses });
  } catch (error) {
    console.error("Nurses list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
