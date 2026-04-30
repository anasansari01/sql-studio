import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email:   z.string().email(),
  purpose: z.enum(["register", "login", "reset_password"]),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { email, purpose } = parsed.data;
    const normalEmail = email.toLowerCase().trim();

    const [existing] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, normalEmail))
      .limit(1);

    if (purpose === "register" && existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (purpose === "login" && !existing) {
      return NextResponse.json({ message: "OTP sent if account exists." });
    }

    if (purpose === "reset_password" && !existing) {
      return NextResponse.json({ message: "OTP sent if account exists." });
    }

    const code = await createOtp(normalEmail, purpose);
    await sendOtpEmail(normalEmail, code, purpose);

    return NextResponse.json({ message: "OTP sent. Check your inbox." });
  } catch (err) {
    console.error("[POST /api/auth/send-otp]", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}