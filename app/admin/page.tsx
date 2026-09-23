import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";
import { parseProduct } from "@/lib/format";

export default async function Admin() {
  const session = await requireRole("ADMIN");
  if (!session) redirect("/admin/login");
  const products = (await db.product.findMany({ orderBy: { name: "asc" } })).map(parseProduct);
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
  const usage = await db.usage();
  const revenue = products.reduce((sum, p) => sum + p.unitsSold * p.salePrice, 0);
  const cost = products.reduce((sum, p) => sum + p.unitsSold * p.costPrice, 0);
  return <AdminClient initial={{ products, orders, revenue, cost, usage }} />;
}
