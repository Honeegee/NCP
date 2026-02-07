import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check environment variables
    const hasSecret = !!process.env.NEXTAUTH_SECRET;
    const hasUrl = !!process.env.NEXTAUTH_URL;
    const nodeEnv = process.env.NODE_ENV;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      nodeEnv,
      environment: {
        hasNEXTAUTH_SECRET: hasSecret,
        hasNEXTAUTH_URL: hasUrl,
      },
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
      },
      checks: {
        secretConfigured: hasSecret ? "✓ OK" : "✗ MISSING - Required for session encryption",
        urlConfigured: hasUrl ? "✓ OK" : "⚠ Missing (optional, but recommended for non-localhost)",
        sessionCreated: session ? "✓ Session exists" : "✗ No session - Check login flow",
      },
    };

    return NextResponse.json(diagnostics, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostics check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
