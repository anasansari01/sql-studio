import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/hashPassword";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { z } from "zod";

const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalEmail))
      .limit(1);

    const dummyHash = "$2a$12$placeholderHashToPreventTimingAttackEnumeration";
    const hash      = user?.passwordHash ?? dummyHash;
    const isValid   = await verifyPassword(password, hash);

    if (!user || !isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please click 'Continue with Google'." },
        { status: 400 }
      );
    }

    const code = await createOtp(normalEmail, "login");
    await sendOtpEmail(normalEmail, code, "login");

    return NextResponse.json({
      requiresOtp: true,
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}