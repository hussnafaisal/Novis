
function esc(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "");
}

function formatInvoiceDate(value: string | Date) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "pm" : "am";

  return `${day}/${month}/${year}, ${hour12}:${minutes} ${ampm}`;
}

export function invoicePdf(order: any) {
  const lines: string[] = [];

  const text = (
    x: number,
    y: number,
    t: string,
    size = 11,
    bold = false
  ) => {
    lines.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${esc(
        t
      )}) Tj ET`
    );
  };

  text(50, 790, "Novis LUXURY AI SUITE", 20, true);

  text(
    50,
    765,
    `INVOICE ${order.invoiceId || "—"}`,
    13,
    true
  );

  text(50, 742, `Order: ${order.id || "—"}`);

  text(
    50,
    722,
    `Date: ${formatInvoiceDate(order.createdAt)}`
  );

  text(50, 692, "BILL TO", 11, true);

  text(50, 672, String(order.customer || "—"));

  text(50, 654, String(order.email || "—"));

  text(50, 636, String(order.phone || "—"));

  text(
    50,
    618,
    `${order.address || ""}, ${order.city || ""}`.trim()
  );

  let y = 575;

  text(50, y, "PRODUCT", 10, true);
  text(330, y, "QTY", 10, true);
  text(390, y, "UNIT", 10, true);
  text(475, y, "TOTAL", 10, true);

  y -= 24;

  for (const i of order.items || []) {
    const unitPrice = Number(i.unitPrice || 0);
    const quantity = Number(i.quantity || 0);
    const total = unitPrice * quantity;

    text(
      50,
      y,
      String(i.productName || i.watchId || "Product").slice(0, 42)
    );

    text(330, y, String(quantity));

    text(
      390,
      y,
      `Rs. ${unitPrice.toLocaleString("en-PK")}`
    );

    text(
      475,
      y,
      `Rs. ${total.toLocaleString("en-PK")}`
    );

    y -= 22;
  }

  y -= 15;

  const grandTotal = Number(order.total || 0);

  text(350, y, "GRAND TOTAL", 12, true);

  text(
    475,
    y,
    `Rs. ${grandTotal.toLocaleString("en-PK")}`,
    12,
    true
  );

  y -= 45;

  text(
    50,
    y,
    `Status: ${order.status || "Pending"}`
  );

  text(
    50,
    y - 20,
    "Payment: Cash on Delivery"
  );

  text(
    50,
    y - 55,
    "This invoice was generated automatically after order confirmation.",
    9
  );

  const stream = lines.join("\n");

  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,

    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,

    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,

    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>
stream
${stream}
endstream`,

    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,

    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
  ];

  let pdf = "%PDF-1.4\n";

  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));

    pdf += `${i + 1} 0 obj
${objects[i]}
endobj
`;
  }

  const xref = Buffer.byteLength(pdf, "latin1");

  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n 
`;
  }

  pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xref}
%%EOF`;

  return Buffer.from(pdf, "latin1");
}


export function catalogPdf(products: any[]) {
  const PAGE_W = 595;
  const PAGE_H = 842;
  const margin = 42;
  const cardW = 245;
  const cardH = 170;
  const gap = 20;
  const pages: string[][] = [];

  let page: string[] = [];
  let y = 790;
  let index = 0;
  const add = (line: string) => page.push(line);
  const newPage = () => { if (page.length) pages.push(page); page = []; y = 790; };
  const esc2 = (s: string) => esc(String(s));
  const text2 = (x: number, yy: number, t: string, size = 10, bold = false, color = "0.95 0.91 0.84") => {
    add(`${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${yy} Td (${esc2(t)}) Tj ET`);
  };
  const line2 = (x1:number, yy:number, x2:number) => add(`0.72 0.52 0.22 RG 0.7 w ${x1} ${yy} m ${x2} ${yy} l S`);

  products.forEach((p, i) => {
    if (i % 4 === 0) {
      if (i) newPage();
      add("0.035 0.035 0.035 rg 0 0 595 842 re f");
      text2(42, 805, "NOVIS", 23, true, "0.82 0.62 0.29");
      text2(42, 782, "TIMEPIECES  /  COMPLETE COLLECTION", 8, false, "0.58 0.55 0.50");
      line2(42, 765, 553);
      y = 730;
    }
    const pos = i % 4;
    const col = pos % 2;
    const row = Math.floor(pos / 2);
    const x = margin + col * (cardW + gap);
    const top = y - row * (cardH + 20);
    const bottom = top - cardH;
    add(`0.065 0.065 0.065 rg ${x} ${bottom} ${cardW} ${cardH} re f`);
    add(`0.50 0.36 0.15 RG 0.6 w ${x} ${bottom} ${cardW} ${cardH} re S`);
    text2(x + 14, top - 25, String(p.type || "TIMEPIECE").toUpperCase().slice(0, 34), 7, false, "0.62 0.47 0.26");
    text2(x + 14, top - 52, String(p.name).slice(0, 34), 17, true);
    text2(x + 14, top - 73, `Rs. ${Number(p.salePrice || 0).toLocaleString("en-PK")}`, 11, true, "0.88 0.69 0.36");
    if (p.regularPrice && Number(p.regularPrice) > Number(p.salePrice)) text2(x + 100, top - 73, `Rs. ${Number(p.regularPrice).toLocaleString("en-PK")}`, 8, false, "0.40 0.39 0.36");
    text2(x + 14, top - 98, `Movement: ${String(p.movement || "—").slice(0, 28)}`, 8, false, "0.67 0.65 0.61");
    text2(x + 14, top - 116, `Strap: ${String(p.strap || "—")}`, 8, false, "0.67 0.65 0.61");
    text2(x + 14, top - 134, `Water resistance: ${String(p.waterResistance || "—")}`, 8, false, "0.67 0.65 0.61");
    text2(x + 14, top - 153, `Stock: ${Number(p.stock || 0) > 0 ? "Available" : "Sold out"}`, 7, true, Number(p.stock || 0) > 0 ? "0.70 0.73 0.65" : "0.58 0.40 0.38");
    index = i;
  });
  newPage();

  pages.forEach((lines, pi) => {
    lines.push(`0.35 0.35 0.35 rg BT /F1 7 Tf 42 25 Td (NOVIS TIMEPIECES  •  PAGE ${pi + 1}  •  novis) Tj ET`);
  });

  const objects: string[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];
  const pageIds: number[] = [];
  let objId = 3;
  for (const lines of pages) {
    const stream = lines.join("\n");
    const pageId = objId;
    const contentId = objId + 1;
    pageIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    objId += 2;
  }
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(pdf, "latin1")); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}
