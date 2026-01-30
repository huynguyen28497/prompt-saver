import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, initDb } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await initDb();
    await sql`DELETE FROM prompts WHERE id = ${id} AND user_id = ${session.user.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/prompts/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
