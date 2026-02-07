import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { forgotPasswordSchema } from "@/lib/validators";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getPasswordResetEmailHtml, getPasswordResetEmailText } from "@/lib/email-templates";
import {
  checkRateLimit,
  getClientIp,
  sanitizeEmail,
  generateSecureToken,
  RATE_LIMITS,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, RATE_LIMITS.FORGOT_PASSWORD);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please try again in ${rateLimit.retryAfter} seconds.`,
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
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(result.data.email);
    const supabase = createServerSupabase();

    // Check if user exists and get their name for personalization
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        nurse_profiles (
          first_name,
          last_name
        )
      `)
      .eq("email", email)
      .single();

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (userError || !user) {
      // Still wait a bit to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate a secure random token (256 bits = 32 bytes)
    const resetToken = await generateSecureToken(32);

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing unused tokens for this user
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("user_id", user.id)
      .eq("used", false);

    // Store the reset token
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error creating reset token:", tokenError);
      return NextResponse.json(
        { error: "Failed to process your request. Please try again." },
        { status: 500 }
      );
    }

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Get user name for email personalization
    const userProfile = Array.isArray(user.nurse_profiles)
      ? user.nurse_profiles[0]
      : user.nurse_profiles;

    const userName = userProfile?.first_name
      ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
      : email.split('@')[0];

    try {
      // Send email using Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Reset Your Password - Nurse Care Pro",
        html: getPasswordResetEmailHtml({
          userName,
          resetUrl,
          expiryTime: "1 hour",
        }),
        text: getPasswordResetEmailText({
          userName,
          resetUrl,
          expiryTime: "1 hour",
        }),
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't reveal email send failure to prevent email enumeration
        // Just log it and continue
      } else {
        console.log("Password reset email sent successfully:", emailData?.id);
      }
    } catch (emailError) {
      console.error("Exception sending email:", emailError);
      // Don't reveal to user
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account exists with this email, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
