import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs"; 

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}