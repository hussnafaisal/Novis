import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "muttahir";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "muttahir123@";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid operator credentials." },
        { status: 401 }
      );
    }

    await createSession("ADMIN", "ADMIN");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }
}
