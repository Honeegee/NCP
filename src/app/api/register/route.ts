import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "@/lib/supabase";
import { stepBasicInfoSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate basic info including password strength
    const validationResult = stepBasicInfoSchema.safeParse({
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      email: body.email || '',
      password: body.password || '',
      mobile_number: body.mobile_number || '',
      location_type: body.location_type || 'philippines',
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const {
      email,
      password,
      first_name,
      last_name,
      mobile_number,
      location_type,
      professional_status,
      employment_status,
      certifications,
      years_of_experience,
      specialization,
      school_name,
      graduation_year,
      internship_experience,
    } = body;

    if (!email || !password || !first_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ email, password_hash, role: "nurse" })
      .select("id")
      .single();

    if (userError || !user) {
      console.error("User creation error:", userError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Parse years of experience
    const parsedYearsOfExperience = years_of_experience
      ? parseInt(years_of_experience, 10) || 0
      : 0;

    // Parse graduation year for students
    const parsedGraduationYear = graduation_year
      ? parseInt(graduation_year, 10) || null
      : null;

    // Create nurse profile
    const { data: profile, error: profileError } = await supabase
      .from("nurse_profiles")
      .insert({
        user_id: user.id,
        first_name,
        last_name: last_name || "",
        phone: mobile_number || "",
        country: location_type === "overseas" ? "Overseas" : "Philippines",
        location_type: location_type || "philippines",
        professional_status: professional_status || "registered_nurse",
        employment_status: employment_status || null,
        specialization: specialization || null,
        school_name: school_name || null,
        internship_experience: internship_experience || null,
        graduation_year: parsedGraduationYear,
        years_of_experience: parsedYearsOfExperience,
        profile_complete: true,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      console.error("Profile creation error:", profileError);
      // Rollback: delete the user
      await supabase.from("users").delete().eq("id", user.id);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Insert certifications
    if (certifications && certifications.length > 0) {
      const certRecords = certifications
        .filter((c: { cert_type: string }) => c.cert_type)
        .map((c: { cert_type: string; cert_number?: string; score?: string }) => ({
          nurse_id: profile.id,
          cert_type: c.cert_type,
          cert_number: c.cert_number || null,
          score: c.score || null,
        }));

      if (certRecords.length > 0) {
        await supabase.from("nurse_certifications").insert(certRecords);
      }
    }

    // Insert education record for students
    if (professional_status === "nursing_student" && school_name) {
      await supabase.from("nurse_education").insert({
        nurse_id: profile.id,
        institution: school_name,
        degree: "Bachelor of Science in Nursing",
        graduation_year: parsedGraduationYear,
      });
    }

    return NextResponse.json({
      message: "Registration successful",
      user_id: user.id,
      profile_id: profile.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
