import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { extractTextFromPDF, extractTextFromDocx, extractTextFromDoc } from "@/lib/resume-parser";
import { extractResumeData } from "@/lib/data-extractor";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const profileId = formData.get("profile_id") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Determine nurse profile ID
    let nurseProfileId = profileId;

    if (!nurseProfileId) {
      const { data: profile } = await supabase
        .from("nurse_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      nurseProfileId = profile.id;
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${nurseProfileId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Extract text based on file type
    let extractedText = "";
    let parseWarning = "";
    try {
      if (fileExt === "pdf") {
        extractedText = await extractTextFromPDF(buffer);
      } else if (fileExt === "docx") {
        extractedText = await extractTextFromDocx(buffer);
      } else if (fileExt === "doc") {
        extractedText = await extractTextFromDoc(buffer);
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      parseWarning = `Text extraction failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`;
    }

    // Extract structured data from text
    let parsedData = null;
    if (extractedText) {
      parsedData = extractResumeData(extractedText);
    }

    // Save resume record in database
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        nurse_id: nurseProfileId,
        file_path: fileName,
        original_filename: file.name,
        file_type: fileExt,
        extracted_text: extractedText || null,
        parsed_data: parsedData,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save resume record" },
        { status: 500 }
      );
    }

    // Auto-populate profile fields from parsed data
    if (parsedData) {
      // Clear old extracted data before inserting new (prevent duplicates on re-upload)
      await supabase.from("nurse_certifications").delete().eq("nurse_id", nurseProfileId);
      await supabase.from("nurse_skills").delete().eq("nurse_id", nurseProfileId);
      await supabase.from("nurse_experience").delete().eq("nurse_id", nurseProfileId);
      await supabase.from("nurse_education").delete().eq("nurse_id", nurseProfileId);

      const profileUpdates: Record<string, unknown> = {};

      if (parsedData.summary) {
        profileUpdates.bio = parsedData.summary;
      }
      if (parsedData.graduation_year) {
        profileUpdates.graduation_year = parsedData.graduation_year;
      }
      if (parsedData.years_of_experience) {
        profileUpdates.years_of_experience = parsedData.years_of_experience;
      }
      if (parsedData.address) {
        profileUpdates.address = parsedData.address;
      }

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        await supabase
          .from("nurse_profiles")
          .update(profileUpdates)
          .eq("id", nurseProfileId);
      }

      // Insert extracted certifications
      if (parsedData.certifications && parsedData.certifications.length > 0) {
        const certRecords = parsedData.certifications.map((c) => ({
          nurse_id: nurseProfileId,
          cert_type: c.type,
          cert_number: c.number || null,
          score: c.score || null,
        }));
        await supabase.from("nurse_certifications").insert(certRecords);
      }

      // Insert extracted skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        const skillRecords = parsedData.skills.map((s) => ({
          nurse_id: nurseProfileId,
          skill_name: s,
          proficiency: "basic",
        }));
        await supabase.from("nurse_skills").insert(skillRecords);
      }

      // Insert extracted experience
      if (parsedData.experience && parsedData.experience.length > 0) {
        const expRecords = parsedData.experience
          .filter((e) => e.start_date)
          .map((e) => ({
            nurse_id: nurseProfileId,
            employer: e.employer || "Unknown",
            position: e.position || "Nurse",
            department: e.department || null,
            description: e.description || null,
            location: e.location || null,
            start_date: toDateString(e.start_date!),
            end_date: !e.end_date || /present|current/i.test(e.end_date)
              ? null
              : toDateString(e.end_date),
          }))
          .filter((e) => e.start_date); // drop records where date conversion failed
        if (expRecords.length > 0) {
          await supabase.from("nurse_experience").insert(expRecords);
        }
      }

      // Insert extracted education
      if (parsedData.education && parsedData.education.length > 0) {
        const eduRecords = parsedData.education
          .filter((e) => e.degree || e.institution)
          .map((e) => ({
            nurse_id: nurseProfileId,
            institution: e.institution || "Unknown",
            degree: e.degree || "Bachelor of Science in Nursing",
            field_of_study: e.field_of_study || null,
            graduation_year: e.year || null,
            institution_location: e.institution_location || null,
            start_date: e.start_date ? toDateString(e.start_date) : null,
            end_date: e.end_date ? toDateString(e.end_date) : null,
            status: e.status || null,
          }));
        if (eduRecords.length > 0) {
          await supabase.from("nurse_education").insert(eduRecords);
        }
      }
    }

    return NextResponse.json({
      message: "Resume uploaded and processed successfully",
      resume_id: resume.id,
      extracted_text: !!extractedText,
      parsed_data: parsedData,
      warning: parseWarning || undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : "Internal server error"}` },
      { status: 500 }
    );
  }
}

/** Convert "June 2020" or "May 2020 2020" to "2020-06-01" format for PostgreSQL DATE */
function toDateString(dateStr: string): string | null {
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const months: Record<string, string> = {
    jan: "01", january: "01", feb: "02", february: "02",
    mar: "03", march: "03", apr: "04", april: "04",
    may: "05", jun: "06", june: "06", jul: "07", july: "07",
    aug: "08", august: "08", sep: "09", september: "09",
    oct: "10", october: "10", nov: "11", november: "11",
    dec: "12", december: "12",
  };

  const match = dateStr.match(
    /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})/i
  );

  if (!match) return null;

  const year = match[2];
  const monthStr = match[1]?.toLowerCase();
  const month = monthStr ? (months[monthStr] || "01") : "01";

  return `${year}-${month}-01`;
}
