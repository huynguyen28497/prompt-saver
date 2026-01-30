import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();
    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    await initDb();
    const [existing] = await sql`
      SELECT id FROM users WHERE email = ${trimmedEmail}
    `;
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${trimmedEmail}, ${passwordHash})
      RETURNING id, email, created_at
    `;
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
