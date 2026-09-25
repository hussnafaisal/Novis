import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  return NextResponse.json({ queries: await db.contact.findMany() });
}
