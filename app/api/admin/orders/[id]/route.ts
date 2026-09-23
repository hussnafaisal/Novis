import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const statuses = ["Pending", "Confirmed", "Delivered"] as const;

type Status = typeof statuses[number];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await requireRole("ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const status = body.status as Status;
  if (!statuses.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const existing: any = await db.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const data: any = { status };
  if ((status === "Confirmed" || status === "Delivered") && !existing.invoiceId) {
    const orders: any[] = await db.order.findMany({});
    const numbers = orders.map((o) => Number(String(o.invoiceId || "").replace(/^INV-/, ""))).filter(Number.isFinite);
    const nextNumber = (numbers.length ? Math.max(...numbers) : 1000) + 1;
    data.invoiceId = `INV-${nextNumber}`;
    data.confirmedAt = new Date().toISOString();
  }

  const order = await db.order.update({ where: { id: params.id }, data });
  return NextResponse.json(order);
}
