import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

async function getNurseId(supabase: ReturnType<typeof createServerSupabase>, userId: string) {
  const { data } = await supabase
    .from("nurse_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id;
}

async function recalculateYearsOfExperience(
  supabase: ReturnType<typeof createServerSupabase>,
  nurseId: string
) {
  const { data: experiences } = await supabase
    .from("nurse_experience")
    .select("start_date, end_date")
    .eq("nurse_id", nurseId);

  if (!experiences || experiences.length === 0) {
    await supabase
      .from("nurse_profiles")
      .update({ years_of_experience: 0, updated_at: new Date().toISOString() })
      .eq("id", nurseId);
    return;
  }

  let totalMonths = 0;
  for (const exp of experiences) {
    if (!exp.start_date) continue;
    const start = new Date(exp.start_date);
    if (isNaN(start.getTime())) continue;
    const end =
      !exp.end_date || /present|current/i.test(exp.end_date)
        ? new Date()
        : new Date(exp.end_date);
    if (isNaN(end.getTime())) continue;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  const years = Math.floor(totalMonths / 12);
  await supabase
    .from("nurse_profiles")
    .update({ years_of_experience: years, updated_at: new Date().toISOString() })
    .eq("id", nurseId);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const nurseId = await getNurseId(supabase, session.user.id);
    if (!nurseId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();

    const validTypes = ["employment", "clinical_placement", "ojt", "volunteer"];
    const { data, error } = await supabase
      .from("nurse_experience")
      .update({
        employer: body.employer,
        position: body.position,
        type: validTypes.includes(body.type) ? body.type : "employment",
        department: body.department || null,
        location: body.location || null,
        description: body.description || null,
        start_date: body.start_date,
        end_date: body.end_date || null,
      })
      .eq("id", id)
      .eq("nurse_id", nurseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await recalculateYearsOfExperience(supabase, nurseId);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const nurseId = await getNurseId(supabase, session.user.id);
    if (!nurseId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("nurse_experience")
      .delete()
      .eq("id", id)
      .eq("nurse_id", nurseId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await recalculateYearsOfExperience(supabase, nurseId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
