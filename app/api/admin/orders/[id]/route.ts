import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const statuses = ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Return"] as const;
type Status = typeof statuses[number];
const nextStatus: Record<Status, Status | null> = {
  Pending: "Confirmed",
  Confirmed: "Out for Delivery",
  "Out for Delivery": "Delivered",
  Delivered: "Return",
  Return: null,
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await requireRole("ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const status = body.status as Status;
  if (!statuses.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const existing: any = await db.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const current = (existing.status || "Pending") as Status;
  if (current === status) return NextResponse.json(existing);
  if (nextStatus[current] !== status) {
    return NextResponse.json({ error: `Invalid order flow. ${current} can only move to ${nextStatus[current] || "no further status"}.` }, { status: 409 });
  }

  const data: any = { status };
  if (status === "Confirmed" && !existing.invoiceId) {
    const orders: any[] = await db.order.findMany({});
    const numbers = orders.map((o) => Number(String(o.invoiceId || "").replace(/^INV-/, ""))).filter(Number.isFinite);
    const nextNumber = (numbers.length ? Math.max(...numbers) : 1000) + 1;
    data.invoiceId = `INV-${nextNumber}`;
    data.confirmedAt = new Date().toISOString();
  }
  if (status === "Delivered") data.deliveredAt = new Date().toISOString();
  if (status === "Return") data.returnedAt = new Date().toISOString();

  const order = await db.order.update({ where: { id: params.id }, data });
  return NextResponse.json(order);
}
