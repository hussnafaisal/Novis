import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema=z.object({
  customer:z.object({name:z.string().min(2),email:z.string().email(),phone:z.string().min(5),city:z.string().min(2),address:z.string().min(5)}),
  items:z.array(z.object({id:z.string(),quantity:z.number().int().positive()})).min(1)
});

export async function POST(req:Request){
  const session=await requireRole("CUSTOMER");
  if(!session)return NextResponse.json({error:"Authentication required."},{status:401});
  const v=schema.safeParse(await req.json());
  if(!v.success)return NextResponse.json({error:"Invalid checkout data."},{status:400});
  try{
    let total=0;
    const items:any[]=[];
    for(const i of v.data.items){
      const p:any=await db.product.findUnique({where:{id:i.id}});
      if(!p||!p.active||p.stock<i.quantity)throw new Error(`Insufficient stock for ${p?.name||"item"}`);
      total+=p.salePrice*i.quantity;
      items.push({watchId:p.id,quantity:i.quantity,unitPrice:p.salePrice,productName:p.name,productImage:p.images?.[0]||""});
    }
    const id=`ORD-${Date.now()}`;
    const order=await db.order.create({data:{id,invoiceId:null,userId:session.sub,customer:v.data.customer.name,email:v.data.customer.email,phone:v.data.customer.phone,city:v.data.customer.city,address:v.data.customer.address,total,status:"Pending",createdAt:new Date().toISOString(),confirmedAt:null,items}});
    for(const i of items){const p:any=await db.product.findUnique({where:{id:i.watchId}});if(p)await db.product.update({where:{id:p.id},data:{stock:p.stock-i.quantity,unitsSold:p.unitsSold+i.quantity}});}
    return NextResponse.json({ok:true,id:order.id});
  }catch(e:any){return NextResponse.json({error:e.message||"Order failed."},{status:409});}
}
