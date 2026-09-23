
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

