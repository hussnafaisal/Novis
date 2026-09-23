import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
export const runtime = "nodejs";
const allowed = new Map([["image/jpeg", ".jpg"],["image/png", ".png"],["image/webp", ".webp"],["image/gif", ".gif"]]);
export async function POST(req: Request) {
  if (!await requireRole("ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const form = await req.formData();
    const files = form.getAll("images").filter((x): x is File => x instanceof File);
    if (!files.length) return NextResponse.json({ error: "Please select at least one image." }, { status: 400 });
    if (files.length > 8) return NextResponse.json({ error: "You can upload up to 8 images." }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "uploads", "products"); await fs.mkdir(dir, { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      const ext = allowed.get(file.type); if (!ext) return NextResponse.json({ error: "Only JPG, PNG, WEBP or GIF images are supported." }, { status: 400 });
      if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Each image must be 5MB or smaller." }, { status: 400 });
      const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer())); urls.push(`/uploads/products/${name}`);
    }
    return NextResponse.json({ urls });
  } catch { return NextResponse.json({ error: "Image upload failed." }, { status: 500 }); }
}
