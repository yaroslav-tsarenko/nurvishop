import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

interface InvoiceItem {
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string | null;
  postalCode?: string;
  country?: string;
}

export interface InvoicePdfData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: InvoiceAddress;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  shippingMethod: string;
}

const BRAND = rgb(0.722, 0.361, 0.22); // #B85C38
const INK = rgb(0.169, 0.141, 0.114); // #2b241d
const MUTED = rgb(0.541, 0.49, 0.427); // #8a7d6d
const LINE = rgb(0.898, 0.898, 0.898);

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;

function eur(n: number): string {
  return `EUR ${n.toFixed(2)}`;
}

function shippingLabel(method: string): string {
  if (method === "express") return "Express (2-3 days)";
  if (method === "free") return "Economy (7-14 days)";
  return "Standard (5-7 days)";
}

/** Collapse chars pdf-lib's WinAnsi font can't encode (e.g. curly quotes). */
function ascii(input: string): string {
  return input
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/€/g, "EUR ")
    .replace(/[^\x20-\x7E]/g, "");
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_H - MARGIN;

  const text = (
    p: PDFPage,
    str: string,
    x: number,
    yy: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) => {
    p.drawText(ascii(str), {
      x,
      y: yy,
      size: opts.size ?? 10,
      font: opts.font ?? font,
      color: opts.color ?? INK,
    });
  };

  const rightText = (
    str: string,
    rightX: number,
    yy: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    const w = f.widthOfTextAtSize(ascii(str), size);
    text(page, str, rightX - w, yy, opts);
  };

  // Header
  text(page, "nurvishop", MARGIN, y, { font: bold, size: 22, color: BRAND });
  rightText("INVOICE", PAGE_W - MARGIN, y, { font: bold, size: 22, color: INK });
  y -= 18;
  rightText(`#${data.invoiceNumber}`, PAGE_W - MARGIN, y, { size: 10, color: MUTED });
  y -= 13;
  rightText(data.date, PAGE_W - MARGIN, y, { size: 10, color: MUTED });

  y -= 30;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: LINE,
  });
  y -= 24;

  // From / Billed-to columns
  const colR = PAGE_W / 2 + 10;
  const topY = y;

  text(page, "FROM", MARGIN, y, { font: bold, size: 8, color: MUTED });
  text(page, "BILLED TO", colR, y, { font: bold, size: 8, color: MUTED });
  y -= 15;

  const fromLines = [
    "ULTRASENS LT MB",
    "Company number: 308011165",
    "V. Nageviciaus g. 3",
    "LT-08237 Vilnius",
    "Lithuania",
  ];
  let leftY = y;
  fromLines.forEach((line, i) => {
    text(page, line, MARGIN, leftY, { font: i === 0 ? bold : font, size: 9, color: i === 0 ? INK : MUTED });
    leftY -= 13;
  });

  const addr = data.shippingAddress;
  const billLines: string[] = [data.customerName, data.customerEmail];
  if (addr) {
    if (addr.address1) billLines.push(addr.address1);
    if (addr.address2) billLines.push(addr.address2);
    const cityLine = [addr.city, addr.postalCode].filter(Boolean).join(", ");
    if (cityLine) billLines.push(cityLine);
    if (addr.country) billLines.push(addr.country);
  }
  let rightY = topY - 15;
  billLines.forEach((line, i) => {
    text(page, line, colR, rightY, { font: i === 0 ? bold : font, size: 9, color: i === 0 ? INK : MUTED });
    rightY -= 13;
  });

  y = Math.min(leftY, rightY) - 20;

  // Shipping method
  text(page, "SHIPPING METHOD", MARGIN, y, { font: bold, size: 8, color: MUTED });
  y -= 14;
  text(page, shippingLabel(data.shippingMethod), MARGIN, y, { size: 9, color: INK });
  y -= 28;

  // Items table header
  const colQtyX = 360;
  const colUnitX = 440;
  const colTotalX = PAGE_W - MARGIN;
  text(page, "PRODUCT", MARGIN, y, { font: bold, size: 8, color: MUTED });
  rightText("QTY", colQtyX, y, { font: bold, size: 8, color: MUTED });
  rightText("UNIT", colUnitX, y, { font: bold, size: 8, color: MUTED });
  rightText("TOTAL", colTotalX, y, { font: bold, size: 8, color: MUTED });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: LINE,
  });
  y -= 16;

  for (const item of data.items) {
    if (y < 140) break; // single-page invoices; guard against overflow
    text(page, item.productName, MARGIN, y, { size: 9, color: INK });
    text(page, `SKU: ${item.productSku}`, MARGIN, y - 11, { size: 7.5, color: MUTED });
    rightText(String(item.quantity), colQtyX, y, { size: 9, color: MUTED });
    rightText(eur(item.price), colUnitX, y, { size: 9, color: MUTED });
    rightText(eur(item.total), colTotalX, y, { font: bold, size: 9, color: INK });
    y -= 26;
  }

  y -= 6;
  page.drawLine({
    start: { x: colQtyX - 40, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: LINE,
  });
  y -= 18;

  const totalRow = (label: string, value: string, opts: { bold?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    const f = opts.bold ? bold : font;
    text(page, label, colUnitX - 90, y, { font: f, size: opts.bold ? 11 : 9, color: opts.color ?? MUTED });
    rightText(value, colTotalX, y, { font: f, size: opts.bold ? 11 : 9, color: opts.color ?? INK });
    y -= opts.bold ? 20 : 15;
  };

  totalRow("Subtotal", eur(data.subtotal));
  totalRow(
    `Shipping (${shippingLabel(data.shippingMethod)})`,
    data.shippingCost === 0 ? "Free" : eur(data.shippingCost),
  );
  totalRow("Tax (21%, incl.)", eur(data.taxAmount));
  if (data.discountAmount > 0) {
    totalRow("Discount", `-${eur(data.discountAmount)}`, { color: rgb(0.18, 0.49, 0.196) });
  }
  y -= 4;
  page.drawLine({
    start: { x: colUnitX - 90, y: y + 6 },
    end: { x: PAGE_W - MARGIN, y: y + 6 },
    thickness: 1.5,
    color: LINE,
  });
  y -= 8;
  totalRow("Total", eur(data.total), { bold: true });

  // Footer note
  const footY = 70;
  page.drawLine({
    start: { x: MARGIN, y: footY + 24 },
    end: { x: PAGE_W - MARGIN, y: footY + 24 },
    thickness: 1,
    color: LINE,
  });
  text(
    page,
    "VAT is included in the prices shown where applicable. This invoice serves as proof of purchase.",
    MARGIN,
    footY + 10,
    { size: 8, color: MUTED },
  );
  text(page, "Questions? Contact info@nurvishop.com", MARGIN, footY - 2, { size: 8, color: MUTED });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
