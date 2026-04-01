import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { assignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOpenAIClient } from "@/lib/openai";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { getGroqClient } from "@/lib/groq";

const hintSchema = z.object({
  assignmentId: z.string().uuid(),
  userQuery: z.string().max(5000).default(""),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to get hints." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = hintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { assignmentId, userQuery } = parsed.data;

    const [assignment] = await db
      .select({
        title: assignments.title,
        question: assignments.question,
        tables: assignments.tables,
        expectedColumns: assignments.expectedColumns,
      })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    const tableNames = (assignment.tables as string[]).join(", ");

    const systemPrompt = `You are a SQL tutor helping students learn by discovery.
Your ONLY job is to give ONE short, conceptual hint — a gentle nudge in the right direction.

STRICT RULES you must NEVER break:
1. Do NOT write any SQL code, not even a fragment.
2. Do NOT say "try SELECT ...", "use JOIN ...", or any SQL syntax at all.
3. Do NOT reveal the answer or the full approach.
4. Do NOT give more than 2-3 sentences.
5. Focus on the CONCEPT the student might be missing, not the implementation.
6. Be encouraging and Socratic — ask a guiding question if helpful.

Good hint examples:
- "Think about how you'd combine data from two tables — what do they have in common?"
- "You're close! Consider whether you need to filter the results after grouping them."
- "What if you thought about this as a 'what's missing' problem rather than 'what exists'?"

Bad hints (never do this):
- "Use SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON..."
- "The answer uses a LEFT JOIN with a WHERE clause checking for NULL."`;

    const userPrompt = `Assignment: "${assignment.title}"

Problem statement:
${assignment.question}

Available tables: ${tableNames}
${assignment.expectedColumns ? `Expected output columns: ${assignment.expectedColumns}` : ""}

${
  userQuery.trim()
    ? `Student's current SQL attempt:
\`\`\`sql
${userQuery.trim()}
\`\`\``
    : "The student hasn't written any query yet."
}

Give a single short hint (2-3 sentences max, NO SQL code).`;

    // const openai = getOpenAIClient();

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: userPrompt },
    //   ],
    //   max_tokens: 200,
    //   temperature: 0.7,
    // });

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const hint = completion.choices[0]?.message?.content?.trim();

    if (!hint) {
      return NextResponse.json(
        { error: "Could not generate a hint. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ hint });
  } catch (err: unknown) {
    console.error("[POST /api/hint]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate hint.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}