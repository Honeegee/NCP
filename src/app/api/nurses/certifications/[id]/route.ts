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

    const { data, error } = await supabase
      .from("nurse_certifications")
      .update({
        cert_type: body.cert_type,
        cert_number: body.cert_number || null,
        score: body.score || null,
        issue_date: body.issue_date || null,
        expiry_date: body.expiry_date || null,
        verified: body.verified || false,
      })
      .eq("id", id)
      .eq("nurse_id", nurseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
      .from("nurse_certifications")
      .delete()
      .eq("id", id)
      .eq("nurse_id", nurseId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
