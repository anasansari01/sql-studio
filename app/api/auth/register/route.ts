import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters").max(60),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalEmail = email.toLowerCase().trim();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const code = await createOtp(normalEmail, "register");
    await sendOtpEmail(normalEmail, code, "register");

    return NextResponse.json({
      requiresOtp: true,
      message: "Verification code sent. Please check your email.",
      email: normalEmail,
    });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}