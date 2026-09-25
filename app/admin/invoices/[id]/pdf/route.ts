import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { invoicePdf } from "@/lib/pdf";

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
  const { id } = await params;
  if(!await requireRole("ADMIN")) return new Response("Forbidden",{status:403});
  const orders:any[]=await db.order.findMany({}); const order=orders.find(o=>o.invoiceId===id);
  if(!order) return new Response("Invoice not found",{status:404});
  const pdf=invoicePdf(order);
  return new Response(pdf,{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${order.invoiceId}.pdf"`,"Content-Length":String(pdf.length)}});
}
