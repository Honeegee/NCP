import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const profileId = formData.get("profile_id") as string;

    if (!file || !profileId) {
      return NextResponse.json(
        { error: "File and profile ID are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, GIF, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // First, get the current nurse profile to check ownership
    const { data: profile, error: profileError } = await supabase
      .from("nurse_profiles")
      .select("user_id")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this profile
    if (profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only upload pictures to your own profile" },
        { status: 403 }
      );
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${profileId}-${Date.now()}.${fileExt}`;
    let filePath = fileName; // Don't include bucket name in path since it's already in .from("profile-pictures")

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage - try profile-pictures bucket first, fall back to resumes bucket
    let uploadError = null;
    let bucketName = "profile-pictures";
    
    // Try profile-pictures bucket first
    const { error: picError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });
    
    uploadError = picError;
    
    // If profile-pictures bucket doesn't exist, use resumes bucket with a different path
    if (picError && (picError.message?.includes("bucket") || picError?.statusCode === '404')) {
      filePath = `profile-images/${fileName}`;
      bucketName = "resumes";
      const { error: resumeError } = await supabase.storage
        .from("resumes")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      
      uploadError = resumeError;
    }

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Update nurse profile with the new picture URL
    const { error: updateError } = await supabase
      .from("nurse_profiles")
      .update({ profile_picture_url: publicUrl })
      .eq("id", profileId);

    if (updateError) {
      console.error("Update error:", updateError);
      // Try to delete the uploaded file if update fails
      await supabase.storage.from("profile-pictures").remove([filePath]);
      return NextResponse.json(
        { error: "Failed to update profile with picture" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profile_id");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // First, get the current nurse profile to check ownership and get current picture URL
    const { data: profile, error: profileError } = await supabase
      .from("nurse_profiles")
      .select("user_id, profile_picture_url")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this profile
    if (profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete pictures from your own profile" },
        { status: 403 }
      );
    }

    // If there's no picture, nothing to delete
    if (!profile.profile_picture_url) {
      return NextResponse.json({
        success: true,
        message: "No profile picture to delete",
      });
    }

    // Extract file path from URL and determine bucket
    const url = new URL(profile.profile_picture_url);
    const pathParts = url.pathname.split("/");
    
    // Determine which bucket the file is in based on URL path
    let bucketName = "profile-pictures";
    let filePath = "";
    
    // Check if URL contains storage path pattern
    const storageIndex = pathParts.findIndex(part => part === "storage" || part === "v1");
    if (storageIndex !== -1 && storageIndex + 2 < pathParts.length) {
      // The bucket name is typically after /storage/v1/object/
      bucketName = pathParts[storageIndex + 2];
      filePath = pathParts.slice(storageIndex + 3).join("/");
    } else {
      // Fallback: try to extract from path
      const profilePicsIndex = pathParts.indexOf("profile-pictures");
      const resumesIndex = pathParts.indexOf("resumes");
      
      if (profilePicsIndex !== -1) {
        bucketName = "profile-pictures";
        filePath = pathParts.slice(profilePicsIndex).join("/");
      } else if (resumesIndex !== -1) {
        bucketName = "resumes";
        filePath = pathParts.slice(resumesIndex).join("/");
      } else {
        // Default to profile-pictures bucket
        bucketName = "profile-pictures";
        filePath = pathParts.slice(-1)[0]; // Just the filename
      }
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      // Continue anyway - we'll still update the profile
    }

    // Update nurse profile to remove picture URL
    const { error: updateError } = await supabase
      .from("nurse_profiles")
      .update({ profile_picture_url: null })
      .eq("id", profileId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Profile picture delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}