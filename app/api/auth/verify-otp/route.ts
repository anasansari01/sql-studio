import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/hashPassword";
import { createSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "Code must be 6 digits"),
  purpose: z.enum(["register", "login", "reset_password"]),
  name: z.string().min(2).max(60).optional(),
  password: z.string().min(8).max(72).optional(),
  newPassword: z.string().min(8).max(72).optional(),
});

type ErrorResponse = {
  error: string;
  code?: string;
};

function err(message: string, status: number, code?: string) {
  return NextResponse.json<ErrorResponse>(
    { error: message, code },
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return err("Invalid JSON body", 400, "INVALID_JSON");
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return err(parsed.error.errors[0].message, 400, "VALIDATION_ERROR");
    }

    const { email, code, purpose, name, password, newPassword } = parsed.data;
    const normalEmail = email.toLowerCase().trim();

    const otpResult = await verifyOtp(normalEmail, code, purpose);

    if (otpResult.status !== "ok") {
      const map = {
        not_found: ["No verification code found. Please request a new one.", 400, "OTP_NOT_FOUND"],
        expired: ["Code has expired. Please request a new one.", 400, "OTP_EXPIRED"],
        too_many_attempts: ["Too many incorrect attempts. Please request a new code.", 429, "OTP_RATE_LIMIT"],
        invalid: ["Incorrect code. Please try again.", 400, "OTP_INVALID"],
      } as const;

      const [message, status, codeName] = map[otpResult.status] ?? [
        "OTP verification failed",
        400,
        "OTP_UNKNOWN",
      ];

      return err(message, status, codeName);
    }

    if (purpose === "register") {
      if (!name || !password) {
        return err(
          "Name and password are required for registration.",
          400,
          "MISSING_FIELDS"
        );
      }

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalEmail))
        .limit(1);

      if (existing) {
        return err(
          "An account with this email already exists.",
          409,
          "USER_EXISTS"
        );
      }

      const passwordHash = await hashPassword(password);

      const [newUser] = await db
        .insert(users)
        .values({
          name: name.trim(),
          email: normalEmail,
          passwordHash,
          emailVerified: true,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      const token = await createSession(newUser);
      await setSessionCookie(token);

      return NextResponse.json(
        { user: newUser, message: "Account created successfully." },
        { status: 201 }
      );
    }

    if (purpose === "login") {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.email, normalEmail))
        .limit(1);

      if (!user) {
        return err("User not found.", 404, "USER_NOT_FOUND");
      }

      if (!user.emailVerified) {
        await db
          .update(users)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }

      const token = await createSession(user);
      await setSessionCookie(token);

      return NextResponse.json({
        user,
        message: "Logged in successfully.",
      });
    }

    if (purpose === "reset_password") {
      if (!newPassword) {
        return err(
          "New password is required.",
          400,
          "MISSING_PASSWORD"
        );
      }

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalEmail))
        .limit(1);

      if (!user) {
        return err("User not found.", 404, "USER_NOT_FOUND");
      }

      const passwordHash = await hashPassword(newPassword);

      await db
        .update(users)
        .set({
          passwordHash,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json({
        message: "Password reset successfully. You can now sign in.",
      });
    }

    return err("Invalid purpose.", 400, "INVALID_PURPOSE");
  } catch (err:any) {
    console.error("[POST /api/auth/verify-otp]", err);
    return err("Internal server error", 500, "SERVER_ERROR");
  }
}