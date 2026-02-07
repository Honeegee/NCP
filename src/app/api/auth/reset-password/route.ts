import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "@/lib/supabase";
import { resetPasswordSchema } from "@/lib/validators";
import {
  checkRateLimit,
  getClientIp,
  isValidTokenFormat,
  RATE_LIMITS,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`reset-password:${ip}`, RATE_LIMITS.RESET_PASSWORD);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
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
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = result.data;

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Find the reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);

    if (now > expiresAt) {
      // Mark as used even if expired
      await supabase
        .from("password_reset_tokens")
        .update({ used: true })
        .eq("id", resetToken.id);

      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Get current password hash to ensure new password is different
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", resetToken.user_id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", resetToken.user_id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetToken.id);

    // Invalidate all other unused tokens for this user for security
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("user_id", resetToken.user_id)
      .eq("used", false);

    return NextResponse.json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting password" },
      { status: 500 }
    );
  }
}
