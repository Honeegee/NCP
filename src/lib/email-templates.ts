/**
 * Professional email templates for Nurse Care Pro
 */

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiryTime: string;
}

export function getPasswordResetEmailHtml({
  userName,
  resetUrl,
  expiryTime,
}: PasswordResetEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Nurse Care Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🏥 Nurse Care Pro
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Healthcare Platform
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">
                Hello <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">
                We received a request to reset your password for your Nurse Care Pro account. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 13px; color: #4b5563; margin: 0 0 20px 0;">
                ${resetUrl}
              </div>

              <!-- Security Info Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚠️ Security Information
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
                  <li style="margin-bottom: 4px;">This link will expire in <strong>${expiryTime}</strong></li>
                  <li style="margin-bottom: 4px;">If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>

              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; text-align: center;">
                This email was sent by <strong>Nurse Care Pro</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                For security reasons, this link will expire after ${expiryTime}.<br>
                Need help? Contact our support team.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer Note -->
        <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Nurse Care Pro. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailText({
  userName,
  resetUrl,
  expiryTime,
}: PasswordResetEmailProps): string {
  return `
Reset Your Password - Nurse Care Pro

Hello ${userName},

We received a request to reset your password for your Nurse Care Pro account.

Click the link below to create a new password:
${resetUrl}

SECURITY INFORMATION:
- This link will expire in ${expiryTime}
- If you didn't request this, please ignore this email
- Your password won't change until you create a new one

If you didn't request a password reset, you can safely ignore this email. Your account remains secure.

---
This email was sent by Nurse Care Pro
For security reasons, this link will expire after ${expiryTime}.
Need help? Contact our support team.

© ${new Date().getFullYear()} Nurse Care Pro. All rights reserved.
  `.trim();
}
