import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, initDb } from "@/lib/db";
import type { PromptEntry } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();
    const rows = await sql`
      SELECT id, content, title, context, description, tags, ai_tool, use_case, rating, from_image, created_at, updated_at
      FROM prompts
      WHERE user_id = ${session.user.id}
      ORDER BY updated_at DESC
    `;
    const prompts: PromptEntry[] = rows.map((r) => ({
      id: r.id,
      content: r.content,
      title: r.title,
      context: r.context ?? undefined,
      description: r.description ?? undefined,
      tags: r.tags ?? [],
      aiTool: r.ai_tool ?? undefined,
      useCase: r.use_case ?? undefined,
      rating: r.rating ?? undefined,
      fromImage: r.from_image ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return NextResponse.json(prompts);
  } catch (err) {
    console.error("GET /api/prompts error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();
    const body = (await request.json()) as PromptEntry;
    const {
      id,
      content,
      title,
      context,
      description,
      tags,
      aiTool,
      useCase,
      rating,
      fromImage,
    } = body;
    const now = new Date().toISOString();
    const createdAt = body.createdAt || now;
    const updatedAt = now;

    await sql`
      INSERT INTO prompts (id, user_id, content, title, context, description, tags, ai_tool, use_case, rating, from_image, created_at, updated_at)
      VALUES (
        ${id},
        ${session.user.id},
        ${content},
        ${title},
        ${context ?? null},
        ${description ?? null},
        ${tags ?? []},
        ${aiTool ?? null},
        ${useCase ?? null},
        ${rating ?? null},
        ${fromImage ?? false},
        ${createdAt},
        ${updatedAt}
      )
    `;

    const entry: PromptEntry = {
      id,
      content,
      title,
      context: context || undefined,
      description: description || undefined,
      tags: tags ?? [],
      aiTool: aiTool || undefined,
      useCase: useCase || undefined,
      rating: rating ?? undefined,
      fromImage: fromImage ?? undefined,
      createdAt,
      updatedAt,
    };
    return NextResponse.json(entry);
  } catch (err) {
    console.error("POST /api/prompts error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save prompt" },
      { status: 500 }
    );
  }
}
