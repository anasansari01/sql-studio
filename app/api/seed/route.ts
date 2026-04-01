import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }

  return NextResponse.json({
    message: "Run `npm run db:seed` from the terminal to seed the database.",
  });
}