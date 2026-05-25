import fs from "fs";
import PDFDocument from "pdfkit";
import { ContractPrintData } from "./contracts.service";

const PAGE_MARGIN = 48;
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2;
const PAGE_BOTTOM = 841.89 - PAGE_MARGIN;

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
  return value.toLocaleString("vi-VN");
}

function statusLabel(status: ContractPrintData["trangThai"]): string {
  if (status === "DANG_HIEU_LUC") {
    return "Đang hiệu lực";
  }
  if (status === "DA_KET_THUC") {
    return "Đã kết thúc";
  }
  return "Đã hủy";
}

function roleLabel(role: ContractPrintData["nguoiThue"][number]["vaiTro"]): string {
  return role === "DAI_DIEN" ? "Đại diện" : "Ở cùng";
}

function stayStatusLabel(status: ContractPrintData["nguoiThue"][number]["trangThai"]): string {
  return status === "DANG_O" ? "Đang ở" : "Đã rời";
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > PAGE_BOTTOM) {
    doc.addPage();
    resetTextColumn(doc);
  }
}

function resetTextColumn(doc: PDFKit.PDFDocument): void {
  doc.x = PAGE_MARGIN;
}

function leftText(
  doc: PDFKit.PDFDocument,
  text: string,
  options: PDFKit.Mixins.TextOptions = {}
): void {
  doc.text(text, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    ...options,
  });
  resetTextColumn(doc);
}

function paragraph(doc: PDFKit.PDFDocument, text: string, options: PDFKit.Mixins.TextOptions = {}): void {
  ensureSpace(doc, 44);
  resetTextColumn(doc);
  doc.font("Body").fontSize(10.5).fillColor("#111827");
  leftText(doc, text, {
    align: "justify",
    lineGap: 3,
    ...options,
  });
  doc.moveDown(0.55);
  resetTextColumn(doc);
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 32);
  resetTextColumn(doc);
  doc.moveDown(0.5);
  resetTextColumn(doc);
  doc.font("BodyBold").fontSize(12).fillColor("#111827");
  leftText(doc, text, {
    align: "left",
  });
  doc.moveDown(0.45);
  resetTextColumn(doc);
}

function fieldRows(doc: PDFKit.PDFDocument, rows: Array<[string, string]>): void {
  const labelWidth = 150;
  const valueWidth = CONTENT_WIDTH - labelWidth;

  for (const [label, value] of rows) {
    const labelHeight = doc.font("BodyBold").fontSize(10).heightOfString(label, { width: labelWidth - 10 });
    const valueHeight = doc.font("Body").fontSize(10).heightOfString(value || "-", { width: valueWidth - 10 });
    const rowHeight = Math.max(labelHeight, valueHeight) + 12;
    ensureSpace(doc, rowHeight);

    const y = doc.y;
    doc.rect(PAGE_MARGIN, y, labelWidth, rowHeight).fillAndStroke("#f9fafb", "#d1d5db");
    doc.rect(PAGE_MARGIN + labelWidth, y, valueWidth, rowHeight).stroke("#d1d5db");
    doc.font("BodyBold").fontSize(10).fillColor("#374151").text(label, PAGE_MARGIN + 6, y + 6, {
      width: labelWidth - 12,
    });
    doc.font("Body").fontSize(10).fillColor("#111827").text(value || "-", PAGE_MARGIN + labelWidth + 6, y + 6, {
      width: valueWidth - 12,
    });
    doc.y = y + rowHeight;
    resetTextColumn(doc);
  }

  doc.moveDown(0.8);
  resetTextColumn(doc);
}

function tenantTable(doc: PDFKit.PDFDocument, tenants: ContractPrintData["nguoiThue"]): void {
  const headers = ["STT", "Mã người thuê", "Họ tên", "CCCD/CMND", "SĐT", "Vai trò", "Trạng thái"];
  const widths = [30, 78, 128, 78, 78, 58, 63];
  const rows = tenants.map((tenant, index) => [
    String(index + 1),
    tenant.maNguoiThue,
    tenant.hoTen,
    tenant.cccd,
    tenant.soDienThoai,
    roleLabel(tenant.vaiTro),
    stayStatusLabel(tenant.trangThai),
  ]);

  const drawHeader = () => {
    ensureSpace(doc, 28);
    const y = doc.y;
    let x = PAGE_MARGIN;
    doc.font("BodyBold").fontSize(8.5);
    headers.forEach((header, index) => {
      doc.rect(x, y, widths[index], 24).fillAndStroke("#eff6ff", "#bfdbfe");
      doc.fillColor("#1e3a8a").text(header, x + 4, y + 7, { width: widths[index] - 8 });
      x += widths[index];
    });
    doc.y = y + 24;
    resetTextColumn(doc);
  };

  drawHeader();

  if (rows.length === 0) {
    rows.push(["-", "Không có dữ liệu", "-", "-", "-", "-", "-"]);
  }

  for (const row of rows) {
    doc.font("Body").fontSize(8.8);
    const rowHeight = Math.max(
      ...row.map((cell, index) => doc.heightOfString(cell, { width: widths[index] - 8 }))
    ) + 12;

    if (doc.y + rowHeight > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      drawHeader();
    }

    const y = doc.y;
    let x = PAGE_MARGIN;
    row.forEach((cell, index) => {
      doc.rect(x, y, widths[index], rowHeight).stroke("#d1d5db");
      doc.fillColor("#111827").text(cell, x + 4, y + 6, { width: widths[index] - 8 });
      x += widths[index];
    });
    doc.y = y + rowHeight;
    resetTextColumn(doc);
  }

  doc.moveDown(0.8);
  resetTextColumn(doc);
}

export function buildContractPdf(data: ContractPrintData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: `Hợp đồng thuê phòng trọ ${data.maHopDong}`,
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

    doc.font("BodyBold").fontSize(13).fillColor("#111827").text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", {
      align: "center",
    });
    doc.font("BodyBold").fontSize(11).text("Độc lập - Tự do - Hạnh phúc", { align: "center" });
    doc.font("Body").fontSize(10).text("-------------------------", { align: "center" });
    doc.moveDown(0.8);
    doc.font("BodyBold").fontSize(16).text("HỢP ĐỒNG THUÊ PHÒNG TRỌ", { align: "center" });
    doc.moveDown(0.25);
    doc.font("Body").fontSize(10.5).text(`Mã hợp đồng: ${data.maHopDong}`, { align: "center" });
    doc.text(`Ngày lập: ${formatDate(data.ngayLapHopDong)}`, { align: "center" });
    doc.moveDown(1);

    paragraph(
      doc,
      `Hôm nay, ngày ${formatDate(data.ngayLapHopDong)}, tại ${data.phong.diaChi}, chúng tôi gồm có:`
    );

    sectionTitle(doc, "I. THÔNG TIN CÁC BÊN");
    doc.font("BodyBold").fontSize(10.5).fillColor("#111827");
    leftText(doc, "1. Bên cho thuê (Chủ trọ)", { align: "left" });
    doc.moveDown(0.35);
    resetTextColumn(doc);
    fieldRows(doc, [
      ["Họ và tên", data.chuTro.hoTen],
      ["Số điện thoại", data.chuTro.soDienThoai],
      ["Email", data.chuTro.email ?? "-"],
      ["Địa chỉ", data.chuTro.diaChi ?? "-"],
    ]);

    doc.font("BodyBold").fontSize(10.5).fillColor("#111827");
    leftText(doc, "2. Bên thuê đại diện ký hợp đồng", { align: "left" });
    doc.moveDown(0.35);
    resetTextColumn(doc);
    fieldRows(doc, [
      ["Mã người thuê", data.nguoiDaiDien.maNguoiThue],
      ["Họ và tên", data.nguoiDaiDien.hoTen],
      ["Ngày sinh", formatDate(data.nguoiDaiDien.ngaySinh)],
      ["CCCD/CMND", data.nguoiDaiDien.cccd],
      ["Số điện thoại", data.nguoiDaiDien.soDienThoai],
      ["Email", data.nguoiDaiDien.email ?? "-"],
      ["Địa chỉ thường trú", data.nguoiDaiDien.diaChi ?? "-"],
    ]);

    sectionTitle(doc, "II. THÔNG TIN PHÒNG THUÊ");
    fieldRows(doc, [
      ["Mã phòng", data.phong.maNhaTro],
      ["Tên phòng", data.phong.tenNhaTro],
      ["Địa chỉ", data.phong.diaChi],
      ["Diện tích", `${data.phong.dienTich} m²`],
      ["Giá thuê mặc định", `${formatCurrency(data.phong.giaThueMacDinh)} VNĐ/tháng`],
      ["Tiền cọc mặc định", `${formatCurrency(data.phong.tienCocMacDinh)} VNĐ`],
      ["Tiện nghi", data.phong.tienNghi ?? "-"],
      ["Mô tả", data.phong.moTa ?? "-"],
    ]);

    sectionTitle(doc, "III. NỘI DUNG HỢP ĐỒNG");
    fieldRows(doc, [
      ["Ngày bắt đầu thuê", formatDate(data.ngayBatDau)],
      ["Ngày kết thúc thuê", formatDate(data.ngayKetThuc)],
      ["Tiền thuê/tháng", `${formatCurrency(data.tienThue)} VNĐ`],
      ["Tiền cọc", `${formatCurrency(data.tienCoc)} VNĐ`],
      ["Trạng thái hợp đồng", statusLabel(data.trangThai)],
      ["Ghi chú", data.ghiChu ?? "-"],
    ]);

    sectionTitle(doc, "Điều 1. Đối tượng thuê");
    paragraph(
      doc,
      `Bên cho thuê đồng ý cho bên thuê sử dụng phòng ${data.phong.tenNhaTro} - mã phòng ${data.phong.maNhaTro} tại địa chỉ ${data.phong.diaChi} theo thời hạn và chi phí được ghi nhận trong hợp đồng này.`
    );
    paragraph(
      doc,
      "Phòng thuê được sử dụng với mục đích ở trọ. Bên thuê không được tự ý chuyển nhượng, cho thuê lại hoặc sử dụng sai mục đích nếu chưa có sự đồng ý của bên cho thuê."
    );

    sectionTitle(doc, "Điều 2. Thời hạn thuê và tiền thuê");
    paragraph(doc, `Thời hạn thuê bắt đầu từ ngày ${formatDate(data.ngayBatDau)} đến ngày ${formatDate(data.ngayKetThuc)}.`);
    paragraph(
      doc,
      `Tiền thuê hàng tháng là ${formatCurrency(data.tienThue)} VNĐ/tháng. Tiền thuê chưa bao gồm tiền điện, tiền nước và các khoản phát sinh khác nếu có.`
    );
    paragraph(
      doc,
      `Tiền cọc là ${formatCurrency(data.tienCoc)} VNĐ. Khoản tiền cọc được dùng để đảm bảo việc thực hiện hợp đồng và xử lý các nghĩa vụ tài chính còn lại khi kết thúc hợp đồng.`
    );

    sectionTitle(doc, "Điều 3. Thanh toán hóa đơn");
    paragraph(doc, "Hóa đơn được lập theo hợp đồng thuê phòng. Mỗi hóa đơn bao gồm tiền thuê nhà, tiền điện và tiền nước.");
    paragraph(doc, "Tiền điện và tiền nước được tính dựa trên chỉ số sử dụng thực tế trong kỳ hóa đơn. Tổng tiền hóa đơn = tiền thuê nhà + tiền điện + tiền nước.");
    paragraph(doc, "Kỳ hóa đơn có thể được tính theo chu kỳ 30 ngày kể từ ngày bắt đầu hợp đồng hoặc theo quy định quản lý của chủ trọ. Hạn thanh toán được thể hiện trên từng hóa đơn phát sinh.");

    sectionTitle(doc, "Điều 4. Danh sách người thuê trong hợp đồng");
    paragraph(
      doc,
      `Người đại diện ký hợp đồng là ${data.nguoiDaiDien.hoTen}. Người đại diện chịu trách nhiệm chính trong việc liên hệ, thanh toán và thực hiện các nghĩa vụ trong hợp đồng.`
    );
    paragraph(
      doc,
      "Ngoài người đại diện, các người thuê khác trong cùng phòng được ghi nhận trong danh sách người thuê kèm theo hợp đồng. Người thuê không được gán trực tiếp vào phòng mà được gắn thông qua hợp đồng này."
    );

    sectionTitle(doc, "IV. DANH SÁCH NGƯỜI THUÊ TRONG HỢP ĐỒNG");
    paragraph(
      doc,
      "Dữ liệu phần này được lấy từ bảng HopDong_NguoiThue và NguoiThue. Người đại diện phải xuất hiện trong danh sách với vai trò “Đại diện”."
    );
    tenantTable(doc, data.nguoiThue);

    sectionTitle(doc, "Điều 5. Trách nhiệm của bên thuê");
    paragraph(doc, "Bên thuê có trách nhiệm thanh toán tiền thuê, tiền điện, tiền nước và các khoản phát sinh đúng hạn theo hóa đơn.");
    paragraph(doc, "Bên thuê có trách nhiệm giữ gìn tài sản, thiết bị và tiện nghi trong phòng. Trường hợp gây hư hỏng, bên thuê phải thông báo cho chủ trọ và chịu trách nhiệm bồi thường nếu lỗi thuộc về bên thuê.");
    paragraph(doc, "Bên thuê không được tự ý thay đổi kết cấu phòng, chuyển người khác vào ở hoặc thay đổi danh sách người thuê nếu chưa thông báo cho chủ trọ.");

    sectionTitle(doc, "Điều 6. Trách nhiệm của bên cho thuê");
    paragraph(doc, "Bên cho thuê có trách nhiệm bàn giao phòng đúng thông tin đã thỏa thuận và hỗ trợ bên thuê trong quá trình sử dụng phòng.");
    paragraph(doc, "Bên cho thuê có trách nhiệm lập hóa đơn, theo dõi thanh toán và cập nhật trạng thái hợp đồng trên hệ thống quản lý nhà trọ.");
    paragraph(doc, "Bên cho thuê có quyền kết thúc hợp đồng theo thỏa thuận nếu bên thuê vi phạm nghiêm trọng nghĩa vụ thanh toán hoặc sử dụng phòng sai mục đích.");

    sectionTitle(doc, "Điều 7. Kết thúc hợp đồng");
    paragraph(doc, "Khi hợp đồng kết thúc, trạng thái hợp đồng được cập nhật thành “Đã kết thúc”. Tất cả người thuê trong hợp đồng được cập nhật trạng thái “Đã rời”.");
    paragraph(doc, "Các hóa đơn chưa thanh toán vẫn được giữ lại để theo dõi công nợ. Việc hoàn trả tiền cọc, nếu có, được thực hiện sau khi đối chiếu nghĩa vụ thanh toán và tình trạng phòng.");
    paragraph(doc, "Hai bên thống nhất rằng dữ liệu hợp đồng, người thuê và hóa đơn được lưu trên hệ thống để phục vụ việc quản lý và báo cáo.");

    sectionTitle(doc, "V. XÁC NHẬN CỦA CÁC BÊN");
    paragraph(doc, "Hợp đồng này được lập thành 02 bản có giá trị như nhau. Hai bên đã đọc, hiểu rõ nội dung và đồng ý ký xác nhận dưới đây.");

    ensureSpace(doc, 120);
    const signatureY = doc.y + 6;
    const signatureWidth = CONTENT_WIDTH / 2;
    doc.font("BodyBold").fontSize(10.5).text("BÊN CHO THUÊ", PAGE_MARGIN, signatureY, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("Body").fontSize(9.5).text("(Ký và ghi rõ họ tên)", PAGE_MARGIN, signatureY + 16, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("BodyBold").fontSize(10.5).text(data.chuTro.hoTen, PAGE_MARGIN, signatureY + 88, {
      width: signatureWidth,
      align: "center",
    });

    doc.font("BodyBold").fontSize(10.5).text("BÊN THUÊ ĐẠI DIỆN", PAGE_MARGIN + signatureWidth, signatureY, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("Body").fontSize(9.5).text("(Ký và ghi rõ họ tên)", PAGE_MARGIN + signatureWidth, signatureY + 16, {
      width: signatureWidth,
      align: "center",
    });
    doc.font("BodyBold").fontSize(10.5).text(data.nguoiDaiDien.hoTen, PAGE_MARGIN + signatureWidth, signatureY + 88, {
      width: signatureWidth,
      align: "center",
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc.font("Body").fontSize(8).fillColor("#6b7280").text(`Trang ${i + 1}/${range.count}`, PAGE_MARGIN, 812, {
        width: CONTENT_WIDTH,
        align: "center",
      });
    }

    doc.end();
  });
}
