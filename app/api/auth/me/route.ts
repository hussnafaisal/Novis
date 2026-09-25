import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") return NextResponse.json({ user: null }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
