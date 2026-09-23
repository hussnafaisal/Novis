import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
function esc(v: string) { return v.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
function makePdf(lines: string[]) {
  const content = ["BT", "/F1 10 Tf", "50 780 Td", ...lines.flatMap(line => [`(${esc(line.slice(0, 105))}) Tj`, "0 -18 Td"]), "ET"].join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",`<< /Length ${Buffer.byteLength(content,"utf8")} >>\nstream\n${content}\nendstream`];
  let pdf="%PDF-1.4\n"; const offsets=[0]; objects.forEach((o,i)=>{offsets[i+1]=Buffer.byteLength(pdf,"utf8");pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;}); const xref=Buffer.byteLength(pdf,"utf8"); pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; for(let i=1;i<=objects.length;i++)pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`; pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`; return Buffer.from(pdf,"utf8");
}
export async function GET(_: Request,{params}:{params:{id:string}}){
  if(!await requireRole("ADMIN"))return new Response("Forbidden",{status:403}); const orders:any[]=await db.order.findMany({}); const order=orders.find(o=>o.invoiceId===params.id); if(!order)return new Response("Invoice not found",{status:404});
  const lines=["SVESTON LUXURY AI SUITE","INVOICE",`Invoice: ${order.invoiceId}`,`Order: ${order.id}`,`Date: ${new Date(order.createdAt).toLocaleString()}`,`Status: ${order.status}`,"",`Customer: ${order.customer}`,`Email: ${order.email}`,`Phone: ${order.phone||"-"}`,`Address: ${order.address||"-"}, ${order.city||"-"}`,"","ITEMS",...order.items.map((i:any)=>`${i.productName} | Qty ${i.quantity} | Rs. ${Number(i.unitPrice).toLocaleString()} | Rs. ${(i.unitPrice*i.quantity).toLocaleString()}`),"",`TOTAL: Rs. ${Number(order.total).toLocaleString()}`,"Payment: Cash on Delivery"];
  return new Response(makePdf(lines),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${order.invoiceId}.pdf"`}});
}
