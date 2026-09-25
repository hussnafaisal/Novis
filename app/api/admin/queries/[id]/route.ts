import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const schema = z.object({ status:z.enum(["New","In Progress","Replied","Closed"]).optional(), reply:z.string().trim().max(5000).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id:string }> }) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error:body.error.issues[0]?.message || "Please enter valid query details." }, { status:400 });
    const { id } = await params;
    const current = (await db.contact.findMany()).find(q => q.id === id);
    if (!current) return NextResponse.json({ error:"Query not found." }, { status:404 });
    const data:any = { ...body.data };
    if (body.data.reply !== undefined) {
      if (body.data.reply.length > 0) { data.status = "Replied"; data.repliedAt = new Date().toISOString(); }
    }
    const query = await db.contact.update({ where:{id}, data });
    return NextResponse.json({ ok:true, query });
  } catch { return NextResponse.json({ error:"Unable to update this query right now." }, { status:500 }); }
}
