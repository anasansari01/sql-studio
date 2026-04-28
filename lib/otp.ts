import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { otpCodes } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";

const OTP_EXPIRY_MS   = 10 * 60 * 1000;
const MAX_ATTEMPTS    = 5;
const BCRYPT_ROUNDS   = 10;            


export function generateOtpCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
}


export async function createOtp(
  email: string,
  purpose: "register" | "login" | "reset_password"
): Promise<string> {
  const code     = generateOtpCode();
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db
    .delete(otpCodes)
    .where(and(eq(otpCodes.email, email.toLowerCase()), eq(otpCodes.purpose, purpose)));

  await db.insert(otpCodes).values({
    email: email.toLowerCase(),
    codeHash,
    purpose,
    attempts: 0,
    expiresAt,
  });

  return code;
}

export type OtpVerifyResult =
  | { status: "ok" }
  | { status: "invalid" | "expired" | "too_many_attempts" | "not_found" };

export async function verifyOtp(
  email: string,
  code: string,
  purpose: "register" | "login" | "reset_password"
): Promise<OtpVerifyResult> {
  await db.delete(otpCodes).where(lt(otpCodes.expiresAt, new Date()));

  const [record] = await db
    .select()
    .from(otpCodes)
    .where(
      and(eq(otpCodes.email, email.toLowerCase()), eq(otpCodes.purpose, purpose))
    )
    .limit(1);

  if (!record) return { status: "not_found" };

  if (record.expiresAt < new Date()) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
    return { status: "expired" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { status: "too_many_attempts" };
  }

  const matches = await bcrypt.compare(code.trim(), record.codeHash);

  if (!matches) {
    await db
      .update(otpCodes)
      .set({ attempts: record.attempts + 1 })
      .where(eq(otpCodes.id, record.id));
    return { status: "invalid" };
  }

  await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
  return { status: "ok" };
}


export async function hasPendingOtp(
  email: string,
  purpose: "register" | "login" | "reset_password"
): Promise<boolean> {
  const [record] = await db
    .select({ id: otpCodes.id, expiresAt: otpCodes.expiresAt })
    .from(otpCodes)
    .where(
      and(eq(otpCodes.email, email.toLowerCase()), eq(otpCodes.purpose, purpose))
    )
    .limit(1);

  return !!record && record.expiresAt > new Date();
}