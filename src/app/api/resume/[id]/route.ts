import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerSupabase();

    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("id, file_path, original_filename, file_type, nurse_id, nurse:nurse_profiles!inner(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Allow access if admin or if nurse owns the resume
    const nurse = resume.nurse as unknown as { user_id: string };
    if (session.user.role !== "admin" && nurse.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a signed URL valid for 1 hour
    const { data: signedData, error: signError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 3600);

    if (signError || !signedData) {
      return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      filename: resume.original_filename,
      file_type: resume.file_type,
    });
  } catch (error) {
    console.error("Resume URL error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerSupabase();

    // Get the resume and verify ownership
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("id, file_path, nurse_id, nurse:nurse_profiles!inner(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check ownership
    const nurse = resume.nurse as unknown as { user_id: string };
    if (nurse.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete file from storage
    await supabase.storage.from("resumes").remove([resume.file_path]);

    // Delete resume record from database
    const { error: deleteError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
