import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, {params}:{params:{id:string}}) {
  if (!await requireRole("ADMIN")) return NextResponse.json({error:"Forbidden"},{status:403});
  try {
    const body = await req.json();
    const data:any = {};
    for (const key of ["name","type","regularPrice","salePrice","costPrice","discount","stock","longDescription","movement","strap","waterResistance","images","features"]) if (body[key] !== undefined) data[key]=body[key];
    if (data.stock !== undefined) data.stock=Math.max(0, Number(data.stock));
    const p=await db.product.update({where:{id:params.id},data});
    return NextResponse.json(p);
  } catch(e:any) { return NextResponse.json({error:e.message||"Product update failed."},{status:400}); }
}

export async function DELETE(req: Request, {params}:{params:{id:string}}) {
  if (!await requireRole("ADMIN")) return NextResponse.json({error:"Forbidden"},{status:403});
  try { await db.product.update({where:{id:params.id},data:{active:false}}); return NextResponse.json({ok:true}); }
  catch(e:any) { return NextResponse.json({error:e.message||"Product delete failed."},{status:400}); }
}
