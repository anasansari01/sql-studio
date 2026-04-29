import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const normalEmail = parsed.data.email.toLowerCase().trim();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalEmail))
      .limit(1);

    if (user) {
      const code = await createOtp(normalEmail, "reset_password");
      await sendOtpEmail(normalEmail, code, "reset_password");
    }

    return NextResponse.json({
      message: "If an account exists with that email, you'll receive a reset code shortly.",
    });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}