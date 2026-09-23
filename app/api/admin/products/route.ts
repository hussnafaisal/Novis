import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2), type: z.string().min(2),
  regularPrice: z.number().nonnegative(), salePrice: z.number().nonnegative(), costPrice: z.number().nonnegative(),
  discount: z.number().min(0).max(100), stock: z.number().int().min(0),
  images: z.array(z.string().min(1)).min(1), features: z.array(z.string()).default([]),
  longDescription: z.string().default(""), movement: z.string().default("Japanese Quartz"),
  strap: z.enum(["Stainless Steel","Authentic Leather","Rubber"]), waterResistance: z.string().default("30M")
});

export async function POST(req: Request) {
  if (!await requireRole("ADMIN")) return NextResponse.json({error:"Forbidden"},{status:403});
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({error:"Please provide valid product details."},{status:400});
  try { const product = await db.product.create({data: parsed.data}); return NextResponse.json(product,{status:201}); }
  catch (e:any) { return NextResponse.json({error:e.message || "Could not create product."},{status:400}); }
}
