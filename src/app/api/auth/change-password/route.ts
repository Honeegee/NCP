import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { changePasswordSchema } from "@/lib/validators";
import {
  checkRateLimit,
  getClientIp,
  recordFailedLogin,
  clearFailedLogins,
  RATE_LIMITS,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const userEmail = session.user.email || "";

    // Rate limiting by user ID
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(
      `change-password:${userId}:${ip}`,
      RATE_LIMITS.CHANGE_PASSWORD
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password change attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '900',
          }
        }
      );
    }

    const body = await request.json();

    // Validate input
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Get user from database
    const supabase = createServerSupabase();
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      // Record failed attempt
      const lockout = recordFailedLogin(userEmail);

      if (lockout.shouldLockout) {
        return NextResponse.json(
          {
            error: "Too many failed attempts. Your account has been temporarily locked for 30 minutes.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Current password is incorrect. ${lockout.attemptsRemaining} attempts remaining before account lockout.`,
        },
        { status: 400 }
      );
    }

    // Clear any failed login attempts on successful verification
    clearFailedLogins(userEmail);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An error occurred while changing password" },
      { status: 500 }
    );
  }
}
