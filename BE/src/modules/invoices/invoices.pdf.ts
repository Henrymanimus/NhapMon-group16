import fs from "fs";
import PDFDocument from "pdfkit";
import { InvoicePrintData } from "./invoices.service";

const MM_TO_PT = 72 / 25.4;
const PAGE_WIDTH = 57 * MM_TO_PT;
const PAGE_HEIGHT = 260 * MM_TO_PT;
const PAGE_MARGIN = 8;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const PAGE_BOTTOM = PAGE_HEIGHT - PAGE_MARGIN;

function pickFont(candidates: string[]): string | null {
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function formatDate(value: Date | string | null): string {
  if (!value) {
    return "-";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function statusLabel(status: InvoicePrintData["trangThai"]): string {
  return status === "DA_THANH_TOAN" ? "Đã thanh toán" : "Chưa thanh toán";
}

function lastDayOfMonth(month: number, year: number): string {
  return new Date(year, month, 0).toLocaleDateString("vi-VN");
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > PAGE_BOTTOM) {
    doc.addPage();
  }
}

function separator(doc: PDFKit.PDFDocument): void {
  ensureSpace(doc, 8);
  doc
    .moveTo(PAGE_MARGIN, doc.y + 3)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y + 3)
    .lineWidth(0.4)
    .strokeColor("#9ca3af")
    .stroke();
  doc.moveDown(0.35);
}

function centerText(doc: PDFKit.PDFDocument, text: string, size = 7.6, bold = false): void {
  ensureSpace(doc, size + 8);
  doc
    .font(bold ? "BodyBold" : "Body")
    .fontSize(size)
    .fillColor("#111827")
    .text(text, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
      lineGap: 1,
    });
}

function kv(doc: PDFKit.PDFDocument, label: string, value: string): void {
  const labelWidth = 42;
  const valueWidth = CONTENT_WIDTH - labelWidth;
  const labelHeight = doc.font("BodyBold").fontSize(7.4).heightOfString(label, { width: labelWidth });
  const valueHeight = doc.font("Body").fontSize(7.4).heightOfString(value || "-", { width: valueWidth });
  const rowHeight = Math.max(labelHeight, valueHeight) + 2;
  ensureSpace(doc, rowHeight);

  const y = doc.y;
  doc.font("BodyBold").fontSize(7.4).fillColor("#111827").text(label, PAGE_MARGIN, y, {
    width: labelWidth,
  });
  doc.font("Body").fontSize(7.4).fillColor("#111827").text(value || "-", PAGE_MARGIN + labelWidth, y, {
    width: valueWidth,
  });
  doc.y = y + rowHeight;
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 14);
  doc.moveDown(0.25);
  doc.font("BodyBold").fontSize(8).fillColor("#111827").text(text, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "center",
  });
  doc.moveDown(0.25);
}

function amountLine(doc: PDFKit.PDFDocument, label: string, amount: number, detail?: string): void {
  ensureSpace(doc, detail ? 28 : 18);
  const y = doc.y;
  doc.font("BodyBold").fontSize(7.8).fillColor("#111827").text(label, PAGE_MARGIN, y, {
    width: CONTENT_WIDTH * 0.58,
  });
  doc.font("BodyBold").fontSize(7.8).fillColor("#111827").text(formatCurrency(amount), PAGE_MARGIN, y, {
    width: CONTENT_WIDTH,
    align: "right",
  });
  doc.y = y + 10;
  if (detail) {
    doc.font("Body").fontSize(7.2).fillColor("#374151").text(detail, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 1,
    });
  }
  doc.moveDown(0.3);
}

export function buildInvoicePdf(data: InvoicePrintData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: `Thông báo tiền phòng trọ ${data.maHoaDon}`,
        Author: data.chuTro.hoTen,
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const regularFont = pickFont([
      "C:/Windows/Fonts/arial.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]);
    const boldFont = pickFont([
      "C:/Windows/Fonts/arialbd.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]);

    if (regularFont) {
      doc.registerFont("Body", regularFont);
      doc.registerFont("BodyBold", boldFont ?? regularFont);
    } else {
      doc.registerFont("Body", "Helvetica");
      doc.registerFont("BodyBold", "Helvetica-Bold");
    }

    const electricityUsed = data.chiSoDienMoi - data.chiSoDienCu;
    const waterUsed = data.chiSoNuocMoi - data.chiSoNuocCu;
    const electricityPrice = electricityUsed > 0 ? Math.round(data.tienDien / electricityUsed) : 0;
    const waterPrice = waterUsed > 0 ? Math.round(data.tienNuoc / waterUsed) : 0;
    const periodStart = `01/${String(data.thang).padStart(2, "0")}/${data.nam}`;
    const periodEnd = lastDayOfMonth(data.thang, data.nam);

    centerText(doc, "THÔNG BÁO", 10, true);
    centerText(doc, "TIỀN PHÒNG TRỌ", 10, true);
    centerText(doc, `Mã HĐơn: ${data.maHoaDon}`, 7.2);
    centerText(doc, `Ngày ${formatDate(data.ngayLap)}`, 7.2);
    separator(doc);

    kv(doc, "Hợp đồng:", data.maHopDong);
    kv(doc, "Phòng:", `${data.phong.maNhaTro} - ${data.phong.tenNhaTro}`);
    kv(doc, "Đại diện:", data.nguoiDaiDien.hoTen);
    kv(doc, "SĐT:", data.nguoiDaiDien.soDienThoai);
    kv(doc, "Kỳ:", `${periodStart} - ${periodEnd}`);
    kv(doc, "Hạn TT:", formatDate(data.hanThanhToan));
    separator(doc);

    sectionTitle(doc, "CHI TIẾT");
    amountLine(doc, "1. Phòng", data.tienThue, data.phong.tenNhaTro);
    amountLine(
      doc,
      "2. Điện",
      data.tienDien,
      `${data.chiSoDienMoi}-${data.chiSoDienCu}=${electricityUsed}kWh x ${electricityPrice.toLocaleString("vi-VN")}`
    );
    amountLine(
      doc,
      "3. Nước",
      data.tienNuoc,
      `${data.chiSoNuocMoi}-${data.chiSoNuocCu}=${waterUsed}m3 x ${waterPrice.toLocaleString("vi-VN")}`
    );
    separator(doc);

    ensureSpace(doc, 22);
    doc.font("BodyBold").fontSize(9.2).fillColor("#111827").text("CỘNG", PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH * 0.45,
    });
    doc.font("BodyBold").fontSize(9.2).text(formatCurrency(data.tongTien), PAGE_MARGIN, doc.y - 11, {
      width: CONTENT_WIDTH,
      align: "right",
    });
    doc.moveDown(0.4);
    separator(doc);

    sectionTitle(doc, "THANH TOÁN");
    kv(doc, "Trạng thái:", statusLabel(data.trangThai));
    kv(doc, "Cần TT:", formatCurrency(data.tongTien));
    kv(doc, "Hạn TT:", formatDate(data.hanThanhToan));
    kv(doc, "Ghi chú:", data.ghiChu ?? "-");
    separator(doc);

    sectionTitle(doc, "LIÊN HỆ CHỦ TRỌ");
    kv(doc, "Chủ trọ:", data.chuTro.hoTen);
    kv(doc, "SĐT:", data.chuTro.soDienThoai);
    separator(doc);

    ensureSpace(doc, 70);
    const signatureY = doc.y;
    const signatureWidth = CONTENT_WIDTH / 2;
    doc.font("BodyBold").fontSize(7.4).fillColor("#111827").text("Chủ trọ", PAGE_MARGIN, signatureY, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("Body").fontSize(6.6).text("(ký tên)", PAGE_MARGIN, signatureY + 12, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("BodyBold").fontSize(7).text(data.chuTro.hoTen, PAGE_MARGIN, signatureY + 50, {
      width: signatureWidth,
      align: "center",
    });

    doc.font("BodyBold").fontSize(7.4).text("Người thuê", PAGE_MARGIN + signatureWidth, signatureY, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("Body").fontSize(6.6).text("(ký tên)", PAGE_MARGIN + signatureWidth, signatureY + 12, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("BodyBold").fontSize(7).text(data.nguoiDaiDien.hoTen, PAGE_MARGIN + signatureWidth, signatureY + 50, {
      width: signatureWidth,
      align: "center",
    });
    doc.y = signatureY + 68;

    separator(doc);
    centerText(doc, "Mang phiếu này khi đóng tiền mặt.", 6.8);
    centerText(doc, "Cảm ơn quý khách!", 7.2, true);

    doc.end();
  });
}
