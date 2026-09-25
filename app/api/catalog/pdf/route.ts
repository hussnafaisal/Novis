import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseProduct } from "@/lib/format";
import { catalogPdf } from "@/lib/pdf";

export async function GET() {
  const products = (await db.product.findMany({ where: { active: true }, orderBy: { name: "asc" } })).map(parseProduct);
  const pdf = catalogPdf(products);
  return new NextResponse(pdf as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="novis-watch-catalogue.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
