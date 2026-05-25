import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../db/pool";
import { ApiError } from "../../errors/api-error";

// ---------- Row types ----------

type InvoiceStatus = "DA_THANH_TOAN" | "CHUA_THANH_TOAN";

type InvoiceListRow = RowDataPacket & {
  MaHoaDon: string;
  MaHopDong: string;
  Thang: number;
  Nam: number;
  MaNhaTro: string;
  TenNhaTro: string;
  NguoiDaiDien: string;
  SoDienThoai: string;
  SoNguoiTrongHopDong: number;
  TongTien: number;
  HanThanhToan: Date | null;
  TrangThai: InvoiceStatus;
  NgayLap: Date;
};

type InvoiceDetailRow = RowDataPacket & {
  MaHoaDon: string;
  MaHopDong: string;
  Thang: number;
  Nam: number;
  NgayLap: Date;
  HanThanhToan: Date | null;
  GhiChu: string | null;
  TrangThai: InvoiceStatus;
  TienThue: number;
  ChiSoDienCu: number;
  ChiSoDienMoi: number;
  TienDien: number;
  ChiSoNuocCu: number;
  ChiSoNuocMoi: number;
  TienNuoc: number;
  TongTien: number;
  MaNhaTro: string;
  TenNhaTro: string;
  NgayBatDauHD: Date;
  NgayKetThucHD: Date | null;
  MaNguoiDaiDien: string;
  NguoiDaiDien: string;
  SoDienThoai: string;
  SoNguoiTrongHopDong: number;
};

type ContractOptionRow = RowDataPacket & {
  MaHopDong: string;
  MaNhaTro: string;
  TenNhaTro: string;
  MaNguoiDaiDien: string;
  HoTen: string;
  SoDienThoai: string;
  TienThue: number;
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TrangThai: string;
  SoNguoiThue: number;
  SoHoaDon: number;
  ChiSoDienMoiGanNhat: number | null;
  ChiSoNuocMoiGanNhat: number | null;
};

type PreviousMeterRow = RowDataPacket & {
  ChiSoDienMoi: number;
  ChiSoNuocMoi: number;
};

type InvoicePrintRow = InvoiceDetailRow & {
  ChuTro_HoTen: string;
  ChuTro_SoDienThoai: string;
};

export type InvoicePrintData = {
  maHoaDon: string;
  maHopDong: string;
  thang: number;
  nam: number;
  ngayLap: Date;
  hanThanhToan: Date | null;
  ghiChu: string | null;
  trangThai: InvoiceStatus;
  tienThue: number;
  chiSoDienCu: number;
  chiSoDienMoi: number;
  tienDien: number;
  chiSoNuocCu: number;
  chiSoNuocMoi: number;
  tienNuoc: number;
  tongTien: number;
  phong: {
    maNhaTro: string;
    tenNhaTro: string;
  };
  nguoiDaiDien: {
    hoTen: string;
    soDienThoai: string;
  };
  chuTro: {
    hoTen: string;
    soDienThoai: string;
  };
};

// ---------- Helper ----------

function toDateOnly(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).split("T")[0];
}

function computeDisplayStatus(
  trangThai: InvoiceStatus,
  hanThanhToan: Date | null
): "DA_THANH_TOAN" | "CHUA_THANH_TOAN" | "QUA_HAN" {
  if (trangThai === "DA_THANH_TOAN") return "DA_THANH_TOAN";
  if (hanThanhToan && new Date(hanThanhToan) < new Date(new Date().toDateString()))
    return "QUA_HAN";
  return "CHUA_THANH_TOAN";
}

function generateInvoiceId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `HDN${ts}${rand}`.substring(0, 20);
}

// ---------- List ----------

export async function listInvoices(
  maChuTro: string,
  filters?: {
    keyword?: string;
    thang?: number;
    nam?: number;
    trangThai?: "DA_THANH_TOAN" | "CHUA_THANH_TOAN" | "QUA_HAN";
  }
) {
  let where = `n.MaChuTro = ? AND n.IsDeleted = 0`;
  const params: unknown[] = [maChuTro];

  if (filters?.keyword) {
    const kw = `%${filters.keyword}%`;
    where += ` AND (hdon.MaHoaDon LIKE ? OR hdon.MaHopDong LIKE ? OR n.MaNhaTro LIKE ? OR n.TenNhaTro LIKE ? OR nd.HoTen LIKE ? OR nd.SoDienThoai LIKE ?)`;
    params.push(kw, kw, kw, kw, kw, kw);
  }

  if (filters?.thang) {
    where += ` AND hdon.Thang = ?`;
    params.push(filters.thang);
  }

  if (filters?.nam) {
    where += ` AND hdon.Nam = ?`;
    params.push(filters.nam);
  }

  // QUA_HAN is computed at application layer after fetch
  if (filters?.trangThai === "DA_THANH_TOAN") {
    where += ` AND hdon.TrangThai = 'DA_THANH_TOAN'`;
  } else if (filters?.trangThai === "CHUA_THANH_TOAN") {
    where += ` AND hdon.TrangThai = 'CHUA_THANH_TOAN'`;
  } else if (filters?.trangThai === "QUA_HAN") {
    where += ` AND hdon.TrangThai = 'CHUA_THANH_TOAN' AND hdon.HanThanhToan < CURDATE()`;
  }

  const sql = `
    SELECT
      hdon.MaHoaDon,
      hdon.MaHopDong,
      hdon.Thang,
      hdon.Nam,
      n.MaNhaTro,
      n.TenNhaTro,
      nd.HoTen AS NguoiDaiDien,
      nd.SoDienThoai,
      (
        SELECT COUNT(*) FROM HOPDONG_NGUOITHUE hdnt2
        WHERE hdnt2.MaHopDong = hdon.MaHopDong AND hdnt2.TrangThai = 'DANG_O'
      ) AS SoNguoiTrongHopDong,
      hdon.TongTien,
      hdon.HanThanhToan,
      hdon.TrangThai,
      hdon.NgayLap
    FROM HOADON hdon
    JOIN HOPDONG hd ON hdon.MaHopDong = hd.MaHopDong
    JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
    JOIN NGUOITHUE nd ON hd.MaNguoiDaiDien = nd.MaNguoiThue
    WHERE ${where}
    ORDER BY hdon.Nam DESC, hdon.Thang DESC, hdon.NgayLap DESC
  `;

  const [rows] = await pool.query<InvoiceListRow[]>(sql, params);

  const totalCount = rows.length;
  const paidCount = rows.filter((r) => r.TrangThai === "DA_THANH_TOAN").length;
  const now = new Date(new Date().toDateString());
  const overdueCount = rows.filter(
    (r) => r.TrangThai === "CHUA_THANH_TOAN" && r.HanThanhToan && new Date(r.HanThanhToan) < now
  ).length;
  const unpaidCount = rows.filter((r) => r.TrangThai === "CHUA_THANH_TOAN").length - overdueCount;
  const totalAmount = rows.reduce((sum, r) => sum + Number(r.TongTien), 0);

  const items = rows.map((r) => ({
    maHoaDon: r.MaHoaDon,
    maHopDong: r.MaHopDong,
    thang: r.Thang,
    nam: r.Nam,
    maNhaTro: r.MaNhaTro,
    tenNhaTro: r.TenNhaTro,
    nguoiDaiDien: r.NguoiDaiDien,
    soDienThoai: r.SoDienThoai,
    soNguoiTrongHopDong: Number(r.SoNguoiTrongHopDong),
    tongTien: Number(r.TongTien),
    hanThanhToan: toDateOnly(r.HanThanhToan),
    trangThai: computeDisplayStatus(r.TrangThai, r.HanThanhToan),
    ngayLap: toDateOnly(r.NgayLap),
  }));

  return {
    items,
    stats: {
      total: totalCount,
      paid: paidCount,
      unpaid: unpaidCount,
      overdue: overdueCount,
      totalAmount,
    },
  };
}

// ---------- Detail ----------

export async function getInvoice(maHoaDon: string, maChuTro: string) {
  const sql = `
    SELECT
      hdon.MaHoaDon,
      hdon.MaHopDong,
      hdon.Thang,
      hdon.Nam,
      hdon.NgayLap,
      hdon.HanThanhToan,
      hdon.GhiChu,
      hdon.TrangThai,
      hdon.TienThue,
      hdon.ChiSoDienCu,
      hdon.ChiSoDienMoi,
      hdon.TienDien,
      hdon.ChiSoNuocCu,
      hdon.ChiSoNuocMoi,
      hdon.TienNuoc,
      hdon.TongTien,
      n.MaNhaTro,
      n.TenNhaTro,
      hd.NgayBatDau AS NgayBatDauHD,
      hd.NgayKetThuc AS NgayKetThucHD,
      nd.MaNguoiThue AS MaNguoiDaiDien,
      nd.HoTen AS NguoiDaiDien,
      nd.SoDienThoai,
      (
        SELECT COUNT(*) FROM HOPDONG_NGUOITHUE hdnt2
        WHERE hdnt2.MaHopDong = hdon.MaHopDong AND hdnt2.TrangThai = 'DANG_O'
      ) AS SoNguoiTrongHopDong
    FROM HOADON hdon
    JOIN HOPDONG hd ON hdon.MaHopDong = hd.MaHopDong
    JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
    JOIN NGUOITHUE nd ON hd.MaNguoiDaiDien = nd.MaNguoiThue
    WHERE hdon.MaHoaDon = ? AND n.MaChuTro = ?
  `;

  const [rows] = await pool.query<InvoiceDetailRow[]>(sql, [maHoaDon, maChuTro]);
  if (rows.length === 0) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy hóa đơn");

  const r = rows[0];
  return {
    maHoaDon: r.MaHoaDon,
    maHopDong: r.MaHopDong,
    thang: r.Thang,
    nam: r.Nam,
    ngayLap: toDateOnly(r.NgayLap),
    hanThanhToan: toDateOnly(r.HanThanhToan),
    ghiChu: r.GhiChu ?? null,
    trangThai: computeDisplayStatus(r.TrangThai, r.HanThanhToan),
    trangThaiGoc: r.TrangThai,
    tienThue: Number(r.TienThue),
    chiSoDienCu: r.ChiSoDienCu,
    chiSoDienMoi: r.ChiSoDienMoi,
    tienDien: Number(r.TienDien),
    chiSoNuocCu: r.ChiSoNuocCu,
    chiSoNuocMoi: r.ChiSoNuocMoi,
    tienNuoc: Number(r.TienNuoc),
    tongTien: Number(r.TongTien),
    hopDong: {
      maHopDong: r.MaHopDong,
      maNhaTro: r.MaNhaTro,
      tenNhaTro: r.TenNhaTro,
      ngayBatDau: toDateOnly(r.NgayBatDauHD),
      ngayKetThuc: toDateOnly(r.NgayKetThucHD),
    },
    nguoiDaiDien: {
      maNguoiThue: r.MaNguoiDaiDien,
      hoTen: r.NguoiDaiDien,
      soDienThoai: r.SoDienThoai,
    },
    soNguoiTrongHopDong: Number(r.SoNguoiTrongHopDong),
  };
}

export async function getInvoicePrintData(maHoaDon: string, maChuTro: string): Promise<InvoicePrintData> {
  const sql = `
    SELECT
      hdon.MaHoaDon,
      hdon.MaHopDong,
      hdon.Thang,
      hdon.Nam,
      hdon.NgayLap,
      hdon.HanThanhToan,
      hdon.GhiChu,
      hdon.TrangThai,
      hdon.TienThue,
      hdon.ChiSoDienCu,
      hdon.ChiSoDienMoi,
      hdon.TienDien,
      hdon.ChiSoNuocCu,
      hdon.ChiSoNuocMoi,
      hdon.TienNuoc,
      hdon.TongTien,
      n.MaNhaTro,
      n.TenNhaTro,
      hd.NgayBatDau AS NgayBatDauHD,
      hd.NgayKetThuc AS NgayKetThucHD,
      nd.MaNguoiThue AS MaNguoiDaiDien,
      nd.HoTen AS NguoiDaiDien,
      nd.SoDienThoai,
      ct.HoTen AS ChuTro_HoTen,
      ct.SoDienThoai AS ChuTro_SoDienThoai,
      (
        SELECT COUNT(*) FROM HOPDONG_NGUOITHUE hdnt2
        WHERE hdnt2.MaHopDong = hdon.MaHopDong AND hdnt2.TrangThai = 'DANG_O'
      ) AS SoNguoiTrongHopDong
    FROM HOADON hdon
    JOIN HOPDONG hd ON hdon.MaHopDong = hd.MaHopDong
    JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
    JOIN CHUTRO ct ON n.MaChuTro = ct.MaChuTro
    JOIN NGUOITHUE nd ON hd.MaNguoiDaiDien = nd.MaNguoiThue
    WHERE hdon.MaHoaDon = ? AND n.MaChuTro = ?
  `;

  const [rows] = await pool.query<InvoicePrintRow[]>(sql, [maHoaDon, maChuTro]);
  const row = rows[0];
  if (!row) {
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy hóa đơn");
  }

  return {
    maHoaDon: row.MaHoaDon,
    maHopDong: row.MaHopDong,
    thang: row.Thang,
    nam: row.Nam,
    ngayLap: row.NgayLap,
    hanThanhToan: row.HanThanhToan,
    ghiChu: row.GhiChu ?? null,
    trangThai: row.TrangThai,
    tienThue: Number(row.TienThue),
    chiSoDienCu: Number(row.ChiSoDienCu),
    chiSoDienMoi: Number(row.ChiSoDienMoi),
    tienDien: Number(row.TienDien),
    chiSoNuocCu: Number(row.ChiSoNuocCu),
    chiSoNuocMoi: Number(row.ChiSoNuocMoi),
    tienNuoc: Number(row.TienNuoc),
    tongTien: Number(row.TongTien),
    phong: {
      maNhaTro: row.MaNhaTro,
      tenNhaTro: row.TenNhaTro,
    },
    nguoiDaiDien: {
      hoTen: row.NguoiDaiDien,
      soDienThoai: row.SoDienThoai,
    },
    chuTro: {
      hoTen: row.ChuTro_HoTen,
      soDienThoai: row.ChuTro_SoDienThoai,
    },
  };
}

// ---------- Create ----------

export type CreateInvoiceInput = {
  maHopDong: string;
  thang: number;
  nam: number;
  ngayLap: string;
  hanThanhToan?: string | null;
  tienThue: number;
  chiSoDienCu: number;
  chiSoDienMoi: number;
  tienDien: number;
  chiSoNuocCu: number;
  chiSoNuocMoi: number;
  tienNuoc: number;
  ghiChu?: string | null;
};

export async function createInvoice(maChuTro: string, input: CreateInvoiceInput) {
  // Verify contract belongs to this owner and is active
  const [contractRows] = await pool.query<RowDataPacket[]>(
    `SELECT hd.MaHopDong, hd.TrangThai
     FROM HOPDONG hd
     JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
    WHERE hd.MaHopDong = ? AND n.MaChuTro = ? AND n.IsDeleted = 0`,
    [input.maHopDong, maChuTro]
  );
  if (contractRows.length === 0)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy hợp đồng");
  if (contractRows[0].TrangThai !== "DANG_HIEU_LUC")
    throw new ApiError(400, "INVALID_CONTRACT", "Hợp đồng không đang hiệu lực");

  // Check duplicate invoice for same contract+month+year
  const [dupRows] = await pool.query<RowDataPacket[]>(
    `SELECT MaHoaDon FROM HOADON WHERE MaHopDong = ? AND Thang = ? AND Nam = ?`,
    [input.maHopDong, input.thang, input.nam]
  );
  if (dupRows.length > 0)
    throw new ApiError(409, "DUPLICATE_INVOICE", `Hóa đơn tháng ${input.thang}/${input.nam} cho hợp đồng này đã tồn tại`);

  const [previousMeterRows] = await pool.query<PreviousMeterRow[]>(
    `
      SELECT ChiSoDienMoi, ChiSoNuocMoi
      FROM HOADON
      WHERE MaHopDong = ?
      ORDER BY Nam DESC, Thang DESC, NgayLap DESC, MaHoaDon DESC
      LIMIT 1
    `,
    [input.maHopDong]
  );
  const previousMeter = previousMeterRows[0] ?? null;
  if (previousMeter) {
    const expectedOldElectric = Number(previousMeter.ChiSoDienMoi);
    const expectedOldWater = Number(previousMeter.ChiSoNuocMoi);
    if (input.chiSoDienCu !== expectedOldElectric) {
      throw new ApiError(
        400,
        "INVALID_PREVIOUS_ELECTRIC_READING",
        `Chỉ số điện cũ phải bằng chỉ số điện mới của hóa đơn trước (${expectedOldElectric})`
      );
    }
    if (input.chiSoNuocCu !== expectedOldWater) {
      throw new ApiError(
        400,
        "INVALID_PREVIOUS_WATER_READING",
        `Chỉ số nước cũ phải bằng chỉ số nước mới của hóa đơn trước (${expectedOldWater})`
      );
    }
  }

  const maHoaDon = generateInvoiceId();
  const tongTien = Number(input.tienThue) + Number(input.tienDien) + Number(input.tienNuoc);

  await pool.query<ResultSetHeader>(
    `INSERT INTO HOADON
      (MaHoaDon, MaHopDong, Thang, Nam, NgayLap, HanThanhToan,
       TienThue, ChiSoDienCu, ChiSoDienMoi, TienDien,
       ChiSoNuocCu, ChiSoNuocMoi, TienNuoc, TongTien,
       TrangThai, GhiChu)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHUA_THANH_TOAN', ?)`,
    [
      maHoaDon,
      input.maHopDong,
      input.thang,
      input.nam,
      input.ngayLap,
      input.hanThanhToan ?? null,
      input.tienThue,
      input.chiSoDienCu,
      input.chiSoDienMoi,
      input.tienDien,
      input.chiSoNuocCu,
      input.chiSoNuocMoi,
      input.tienNuoc,
      tongTien,
      input.ghiChu ?? null,
    ]
  );

  return getInvoice(maHoaDon, maChuTro);
}

// ---------- Update ----------

export type UpdateInvoiceInput = Partial<Omit<CreateInvoiceInput, "maHopDong">>;

export async function updateInvoice(maHoaDon: string, maChuTro: string, input: UpdateInvoiceInput) {
  // Check exists + ownership
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT hdon.TrangThai
     FROM HOADON hdon
     JOIN HOPDONG hd ON hdon.MaHopDong = hd.MaHopDong
     JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
     WHERE hdon.MaHoaDon = ? AND n.MaChuTro = ?`,
    [maHoaDon, maChuTro]
  );
  if (rows.length === 0) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy hóa đơn");
  if (rows[0].TrangThai === "DA_THANH_TOAN")
    throw new ApiError(400, "ALREADY_PAID", "Hóa đơn đã thanh toán không thể chỉnh sửa");

  const sets: string[] = [];
  const params: unknown[] = [];

  if (input.thang !== undefined) { sets.push("Thang = ?"); params.push(input.thang); }
  if (input.nam !== undefined) { sets.push("Nam = ?"); params.push(input.nam); }
  if (input.ngayLap !== undefined) { sets.push("NgayLap = ?"); params.push(input.ngayLap); }
  if (input.hanThanhToan !== undefined) { sets.push("HanThanhToan = ?"); params.push(input.hanThanhToan ?? null); }
  if (input.tienThue !== undefined) { sets.push("TienThue = ?"); params.push(input.tienThue); }
  if (input.chiSoDienCu !== undefined) { sets.push("ChiSoDienCu = ?"); params.push(input.chiSoDienCu); }
  if (input.chiSoDienMoi !== undefined) { sets.push("ChiSoDienMoi = ?"); params.push(input.chiSoDienMoi); }
  if (input.tienDien !== undefined) { sets.push("TienDien = ?"); params.push(input.tienDien); }
  if (input.chiSoNuocCu !== undefined) { sets.push("ChiSoNuocCu = ?"); params.push(input.chiSoNuocCu); }
  if (input.chiSoNuocMoi !== undefined) { sets.push("ChiSoNuocMoi = ?"); params.push(input.chiSoNuocMoi); }
  if (input.tienNuoc !== undefined) { sets.push("TienNuoc = ?"); params.push(input.tienNuoc); }
  if (input.ghiChu !== undefined) { sets.push("GhiChu = ?"); params.push(input.ghiChu ?? null); }

  // Recalculate TongTien if any amount changed
  if (input.tienThue !== undefined || input.tienDien !== undefined || input.tienNuoc !== undefined) {
    sets.push("TongTien = TienThue + TienDien + TienNuoc");
  }

  if (sets.length === 0) throw new ApiError(400, "NO_CHANGES", "Không có thay đổi nào");

  params.push(maHoaDon);
  await pool.query(`UPDATE HOADON SET ${sets.join(", ")} WHERE MaHoaDon = ?`, params);

  return getInvoice(maHoaDon, maChuTro);
}

// ---------- Confirm payment ----------

export async function confirmPayment(maHoaDon: string, maChuTro: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT hdon.TrangThai
     FROM HOADON hdon
     JOIN HOPDONG hd ON hdon.MaHopDong = hd.MaHopDong
     JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
     WHERE hdon.MaHoaDon = ? AND n.MaChuTro = ?`,
    [maHoaDon, maChuTro]
  );
  if (rows.length === 0) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy hóa đơn");
  if (rows[0].TrangThai === "DA_THANH_TOAN")
    throw new ApiError(400, "ALREADY_PAID", "Hóa đơn đã được thanh toán rồi");

  await pool.query(`UPDATE HOADON SET TrangThai = 'DA_THANH_TOAN' WHERE MaHoaDon = ?`, [maHoaDon]);

  return getInvoice(maHoaDon, maChuTro);
}

// ---------- Contract options for form ----------

export async function getActiveContractOptions(maChuTro: string) {
  const [rows] = await pool.query<ContractOptionRow[]>(
    `SELECT
       hd.MaHopDong,
       hd.MaNhaTro,
       n.TenNhaTro,
       hd.MaNguoiDaiDien,
       nd.HoTen,
       nd.SoDienThoai,
       hd.TienThue,
       hd.NgayBatDau,
       hd.NgayKetThuc,
       hd.TrangThai,
       (
         SELECT COUNT(*) FROM HOPDONG_NGUOITHUE hdnt2
         WHERE hdnt2.MaHopDong = hd.MaHopDong AND hdnt2.TrangThai = 'DANG_O'
       ) AS SoNguoiThue,
       (
         SELECT COUNT(*) FROM HOADON hdon2
         WHERE hdon2.MaHopDong = hd.MaHopDong
       ) AS SoHoaDon,
       (
         SELECT hdon3.ChiSoDienMoi FROM HOADON hdon3
         WHERE hdon3.MaHopDong = hd.MaHopDong
         ORDER BY hdon3.Nam DESC, hdon3.Thang DESC, hdon3.NgayLap DESC, hdon3.MaHoaDon DESC
         LIMIT 1
       ) AS ChiSoDienMoiGanNhat,
       (
         SELECT hdon4.ChiSoNuocMoi FROM HOADON hdon4
         WHERE hdon4.MaHopDong = hd.MaHopDong
         ORDER BY hdon4.Nam DESC, hdon4.Thang DESC, hdon4.NgayLap DESC, hdon4.MaHoaDon DESC
         LIMIT 1
       ) AS ChiSoNuocMoiGanNhat
     FROM HOPDONG hd
     JOIN NHATRO n ON hd.MaNhaTro = n.MaNhaTro
     JOIN NGUOITHUE nd ON hd.MaNguoiDaiDien = nd.MaNguoiThue
    WHERE n.MaChuTro = ? AND hd.TrangThai = 'DANG_HIEU_LUC' AND n.IsDeleted = 0
     ORDER BY n.MaNhaTro`,
    [maChuTro]
  );

  return rows.map((r) => ({
    maHopDong: r.MaHopDong,
    maNhaTro: r.MaNhaTro,
    tenNhaTro: r.TenNhaTro,
    maNguoiDaiDien: r.MaNguoiDaiDien,
    hoTen: r.HoTen,
    soDienThoai: r.SoDienThoai,
    tienThue: Number(r.TienThue),
    ngayBatDau: toDateOnly(r.NgayBatDau),
    ngayKetThuc: toDateOnly(r.NgayKetThuc),
    trangThai: r.TrangThai,
    soNguoiThue: Number(r.SoNguoiThue),
    soHoaDon: Number(r.SoHoaDon ?? 0),
    chiSoDienMoiGanNhat: r.ChiSoDienMoiGanNhat === null ? null : Number(r.ChiSoDienMoiGanNhat),
    chiSoNuocMoiGanNhat: r.ChiSoNuocMoiGanNhat === null ? null : Number(r.ChiSoNuocMoiGanNhat),
  }));
}
