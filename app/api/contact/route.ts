import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2).max(100), email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(), subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: Request) {
  try {
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ ok:false, error:result.error.issues[0]?.message || "Please check the form." }, { status:400 });
    const contact = await db.contact.create({ data:{ id:`MSG-${Date.now()}`, ...result.data, createdAt:new Date().toISOString() } });
    return NextResponse.json({ ok:true, id:contact.id });
  } catch { return NextResponse.json({ ok:false, error:"Unable to process your message right now." }, { status:500 }); }
}
