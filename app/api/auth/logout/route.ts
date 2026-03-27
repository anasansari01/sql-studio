import { NextResponse } from "next/server";
import {
  getTokenFromCookie,
  verifyToken,
  deleteSession,
  clearSessionCookie,
} from "@/lib/auth";

export async function POST() {
  try {
    const token = await getTokenFromCookie();

    if (token) {
      const payload = await verifyToken(token);
      if (payload?.jti) {
        await deleteSession(payload.jti);
      }
    }

    await clearSessionCookie();

    return NextResponse.json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("[POST /api/auth/logout]", err);
    await clearSessionCookie();
    return NextResponse.json({ message: "Logged out." });
  }
}