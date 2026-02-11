import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "./supabase";
import { getNovu } from "./novu";
import {
  checkAccountLockout,
  recordFailedLogin,
  clearFailedLogins,
  sanitizeEmail,
} from "./security";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = sanitizeEmail(credentials.email);

        // Check if account is locked out
        const lockout = checkAccountLockout(email);
        if (lockout.isLocked) {
          const minutesRemaining = Math.ceil((lockout.remainingTime || 0) / 60);
          throw new Error(
            `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`
          );
        }

        const supabase = createServerSupabase();
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password_hash, role")
          .eq("email", email)
          .single();

        if (error || !user) {
          // Record failed attempt even if user doesn't exist (to prevent enumeration)
          recordFailedLogin(email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          // Record failed login attempt
          const failedAttempt = recordFailedLogin(email);

          if (failedAttempt.shouldLockout) {
            throw new Error(
              "Too many failed login attempts. Your account has been temporarily locked for 30 minutes."
            );
          }

          return null;
        }

        // Clear failed attempts on successful login
        clearFailedLogins(email);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "nurse" | "admin" }).role;

        // Identify subscriber in Novu on login (idempotent)
        const novu = getNovu();
        if (novu) {
          try {
            await novu.subscribers.identify(user.id, {
              email: user.email!,
              firstName: (user as { firstName?: string }).firstName || user.name?.split(" ")[0],
              lastName: (user as { lastName?: string }).lastName || user.name?.split(" ").slice(1).join(" "),
              avatar: user.image || undefined,
            });

            // Subscribe nurses to the "nurses" topic for bulk notifications
            if ((user as { role: string }).role === "nurse") {
              await novu.topics.addSubscribers("nurses", {
                subscribers: [user.id],
              });
            }
          } catch (err) {
            console.error("Novu subscriber identify failed:", err);
          }
        }
      }

      // Fetch nurse profile for nurses (on every JWT update to keep name and picture current)
      // This runs when the token is created AND when session.update() is called
      if (token.role === "nurse" && token.id) {
        const supabase = createServerSupabase();
        const { data: profile } = await supabase
          .from("nurse_profiles")
          .select("first_name, last_name, profile_picture_url")
          .eq("user_id", token.id)
          .single();



        if (profile) {
          token.firstName = profile.first_name;
          token.lastName = profile.last_name;
          // Convert null or empty string to undefined
          token.profilePictureUrl = profile.profile_picture_url?.trim() || undefined;
        } else {
          // Clear if profile not found (should not happen)
          token.firstName = undefined;
          token.lastName = undefined;
          token.profilePictureUrl = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { firstName?: string }).firstName = token.firstName as string | undefined;
        (session.user as { lastName?: string }).lastName = token.lastName as string | undefined;
        (session.user as { profilePictureUrl?: string }).profilePictureUrl = token.profilePictureUrl as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
