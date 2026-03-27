import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { SafeUser } from "@/db/schema";

const COOKIE_NAME = "cipher_session";
const JWT_EXPIRY = "7d"; 
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; 

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env variable is not set.");
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  sub: string;
  jti: string;  
  name: string;
  email: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function getSession(): Promise<SafeUser | null> {
  try {
    const token = await getTokenFromCookie();
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.sub || !payload?.jti) return null;

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.jti, payload.jti),
          eq(sessions.userId, payload.sub),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return null;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

export async function createSession(user: SafeUser): Promise<string> {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

  await db.insert(sessions).values({
    userId: user.id,
    jti,
    expiresAt,
  });

  const token = await signToken({
    sub: user.id,
    jti,
    name: user.name,
    email: user.email,
  });

  return token;
}

export async function deleteSession(jti: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.jti, jti));
}