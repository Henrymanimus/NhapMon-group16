import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { pool } from "../../db/pool";
import { ApiError } from "../../errors/api-error";

type ContractStatus = "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
type TenantRole = "DAI_DIEN" | "O_CUNG";
type TenantStayStatus = "DANG_O" | "DA_ROI";

type CountRow = RowDataPacket & {
  total: number;
};

type ContractListRow = RowDataPacket & {
  MaHopDong: string;
  MaNhaTro: string;
  TenNhaTro: string;
  MaNguoiDaiDien: string;
  TenNguoiDaiDien: string;
  SoDienThoaiNguoiDaiDien: string;
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TienThue: number;
  TienCoc: number;
  GhiChu: string | null;
  TrangThai: ContractStatus;
  SoNguoiThue: number;
  SoHoaDon: number;
  SoHoaDonChuaThanhToan: number;
  NgayTao: Date;
  DaKy: number;
  NgayKy: Date | null;
};

type ContractTenantRow = RowDataPacket & {
  MaNguoiThue: string;
  HoTen: string;
  SoDienThoai: string;
  CCCD: string;
  VaiTro: TenantRole;
  NgayThamGia: Date;
  NgayRoiDi: Date | null;
  TrangThai: TenantStayStatus;
};

type ContractInvoiceRow = RowDataPacket & {
  MaHoaDon: string;
  Thang: number;
  Nam: number;
  TongTien: number;
  TrangThai: "CHUA_THANH_TOAN" | "DA_THANH_TOAN";
  HanThanhToan: Date | null;
};

type ContractPrintRow = RowDataPacket & {
  MaHopDong: string;
  NgayTao: Date;
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TienThue: number;
  TienCoc: number;
  GhiChu: string | null;
  TrangThai: ContractStatus;
  ChuTro_HoTen: string;
  ChuTro_SoDienThoai: string;
  ChuTro_Email: string | null;
  ChuTro_DiaChi: string | null;
  MaNhaTro: string;
  TenNhaTro: string;
  NhaTro_DiaChi: string;
  DienTich: number;
  GiaThueMacDinh: number;
  TienCocMacDinh: number;
  TienNghi: string | null;
  NhaTro_MoTa: string | null;
  NguoiDaiDien_MaNguoiThue: string;
  NguoiDaiDien_HoTen: string;
  NguoiDaiDien_NgaySinh: Date | null;
  NguoiDaiDien_CCCD: string;
  NguoiDaiDien_SoDienThoai: string;
  NguoiDaiDien_Email: string | null;
  NguoiDaiDien_DiaChi: string | null;
};

type ContractPrintTenantRow = RowDataPacket & {
  MaNguoiThue: string;
  HoTen: string;
  CCCD: string;
  SoDienThoai: string;
  VaiTro: TenantRole;
  TrangThai: TenantStayStatus;
};

type RoomOptionRow = RowDataPacket & {
  MaNhaTro: string;
  TenNhaTro: string;
  DiaChi: string;
  DienTich: number;
  GiaThue: number;
  TienCoc: number;
  TrangThai: "TRONG" | "DANG_THUE" | "BAO_TRI";
};

type TenantOptionRow = RowDataPacket & {
  MaNguoiThue: string;
  HoTen: string;
  SoDienThoai: string;
  CCCD: string;
};

type ContractIdentityRow = RowDataPacket & {
  MaHopDong: string;
  MaChuTro: string;
  MaNhaTro: string;
  MaNguoiDaiDien: string;
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TienThue: number;
  TienCoc: number;
  TrangThai: ContractStatus;
  GhiChu: string | null;
  DaKy: number;
  NgayKy: Date | null;
};

type ParticipantInput = {
  maNguoiThue: string;
  vaiTro?: TenantRole;
  ngayThamGia?: string;
};

export type CreateContractInput = {
  maNhaTro: string;
  maNguoiDaiDien: string;
  ngayBatDau: string;
  ngayKetThuc?: string | null;
  tienThue: number;
  tienCoc: number;
  ghiChu?: string | null;
  nguoiThue?: ParticipantInput[];
};

export type UpdateContractInput = Partial<CreateContractInput> & {
  trangThai?: ContractStatus;
};

export type TerminateContractInput = {
  ngayKetThuc: string;
  ghiChu?: string | null;
};

export type ContractPrintData = {
  maHopDong: string;
  ngayLapHopDong: Date;
  ngayBatDau: Date;
  ngayKetThuc: Date | null;
  tienThue: number;
  tienCoc: number;
  ghiChu: string | null;
  trangThai: ContractStatus;
  chuTro: {
    hoTen: string;
    soDienThoai: string;
    email: string | null;
    diaChi: string | null;
  };
  phong: {
    maNhaTro: string;
    tenNhaTro: string;
    diaChi: string;
    dienTich: number;
    giaThueMacDinh: number;
    tienCocMacDinh: number;
    tienNghi: string | null;
    moTa: string | null;
  };
  nguoiDaiDien: {
    maNguoiThue: string;
    hoTen: string;
    ngaySinh: Date | null;
    cccd: string;
    soDienThoai: string;
    email: string | null;
    diaChi: string | null;
  };
  nguoiThue: Array<{
    maNguoiThue: string;
    hoTen: string;
    cccd: string;
    soDienThoai: string;
    vaiTro: TenantRole;
    trangThai: TenantStayStatus;
  }>;
};

function normalizeNullableString(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toDateOnly(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

function mapContractListDto(row: ContractListRow) {
  return {
    maHopDong: row.MaHopDong,
    maNhaTro: row.MaNhaTro,
    tenNhaTro: row.TenNhaTro,
    maNguoiDaiDien: row.MaNguoiDaiDien,
    tenNguoiDaiDien: row.TenNguoiDaiDien,
    soDienThoaiNguoiDaiDien: row.SoDienThoaiNguoiDaiDien,
    ngayBatDau: row.NgayBatDau,
    ngayKetThuc: row.NgayKetThuc,
    tienThue: Number(row.TienThue ?? 0),
    tienCoc: Number(row.TienCoc ?? 0),
    ghiChu: row.GhiChu,
    trangThai: row.TrangThai,
    soNguoiThue: Number(row.SoNguoiThue ?? 0),
    soHoaDon: Number(row.SoHoaDon ?? 0),
    soHoaDonChuaThanhToan: Number(row.SoHoaDonChuaThanhToan ?? 0),
    ngayTao: row.NgayTao,
    daKy: Boolean(row.DaKy),
    ngayKy: row.NgayKy,
  };
}

function mapMysqlContractError(err: unknown): ApiError | null {
  const mysqlErr = err as { code?: string; errno?: number; sqlMessage?: string };
  const message = mysqlErr?.sqlMessage ?? "";

  if (mysqlErr?.code === "ER_DUP_ENTRY") {
    return new ApiError(409, "CONTRACT_DUPLICATE", "Mã hợp đồng đã tồn tại");
  }

  if (mysqlErr?.code === "ER_NO_REFERENCED_ROW_2") {
    return new ApiError(400, "CONTRACT_REFERENCE_INVALID", "Thông tin phòng hoặc người thuê không hợp lệ");
  }

  if (mysqlErr?.code === "ER_SIGNAL_EXCEPTION" || mysqlErr?.errno === 1644) {
    if (message.includes("duplicate active contract")) {
      return new ApiError(
        409,
        "CONTRACT_ACTIVE_EXISTS",
        "Phòng đang có hợp đồng hiệu lực, không thể tạo thêm hợp đồng"
      );
    }

    if (message.includes("Room must be TRONG") || message.includes("Room in BAO_TRI")) {
      return new ApiError(
        409,
        "ROOM_NOT_AVAILABLE",
        "Phòng không ở trạng thái trống để tạo hợp đồng hiệu lực"
      );
    }

    if (message.includes("Only MaNguoiDaiDien") || message.includes("cannot be inserted with role O_CUNG")) {
      return new ApiError(
        400,
        "CONTRACT_REPRESENTATIVE_ROLE_INVALID",
        "Người đại diện phải có vai trò DAI_DIEN trong hợp đồng"
      );
    }
  }

  return null;
}

async function ensureRoomOwned(conn: PoolConnection, maNhaTro: string, maChuTro: string): Promise<void> {
  const [rows] = await conn.query<RowDataPacket[]>(
    `
      SELECT MaNhaTro
      FROM NHATRO
      WHERE MaNhaTro = ?
        AND MaChuTro = ?
        AND IsDeleted = 0
      LIMIT 1
    `,
    [maNhaTro, maChuTro]
  );

  if (!rows[0]) {
    throw new ApiError(404, "ROOM_NOT_FOUND", "Không tìm thấy phòng");
  }
}

async function ensureTenantExists(conn: PoolConnection, maNguoiThue: string): Promise<void> {
  const [rows] = await conn.query<RowDataPacket[]>(
    `
      SELECT MaNguoiThue
      FROM NGUOITHUE
      WHERE MaNguoiThue = ?
      LIMIT 1
    `,
    [maNguoiThue]
  );

  if (!rows[0]) {
    throw new ApiError(404, "TENANT_NOT_FOUND", `Không tìm thấy người thuê ${maNguoiThue}`);
  }
}

async function ensureContractOwned(conn: PoolConnection, maHopDong: string, maChuTro: string): Promise<ContractIdentityRow> {
  const [rows] = await conn.query<ContractIdentityRow[]>(
    `
      SELECT
        hd.MaHopDong,
        n.MaChuTro,
        hd.MaNhaTro,
        hd.MaNguoiDaiDien,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TienThue,
        hd.TienCoc,
        hd.TrangThai,
        hd.GhiChu,
        COALESCE(hd.DaKy, 0) AS DaKy,
        hd.NgayKy
      FROM HOPDONG hd
      INNER JOIN NHATRO n ON n.MaNhaTro = hd.MaNhaTro
      WHERE hd.MaHopDong = ?
      LIMIT 1
    `,
    [maHopDong]
  );

  const contract = rows[0];
  if (!contract || contract.MaChuTro !== maChuTro) {
    throw new ApiError(404, "CONTRACT_NOT_FOUND", "Không tìm thấy hợp đồng");
  }

  return contract;
}

async function contractHasInvoices(conn: PoolConnection, maHopDong: string): Promise<boolean> {
  const [rows] = await conn.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOADON
      WHERE MaHopDong = ?
    `,
    [maHopDong]
  );
  return Number(rows[0]?.total ?? 0) > 0;
}

async function generateContractId(conn: PoolConnection): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const candidate = `HD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`;
    const [rows] = await conn.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM HOPDONG WHERE MaHopDong = ?`,
      [candidate]
    );
    if (Number(rows[0]?.total ?? 0) === 0) {
      return candidate;
    }
  }

  throw new ApiError(500, "CONTRACT_ID_GENERATION_FAILED", "Không thể tạo mã hợp đồng");
}

function normalizeParticipants(
  participants: ParticipantInput[] | undefined,
  maNguoiDaiDien: string,
  defaultStartDate: string
): Array<{ maNguoiThue: string; vaiTro: TenantRole; ngayThamGia: string }> {
  const byTenant = new Map<string, { maNguoiThue: string; vaiTro: TenantRole; ngayThamGia: string }>();

  for (const participant of participants ?? []) {
    const tenantId = participant.maNguoiThue.trim();
    if (!tenantId) {
      continue;
    }

    byTenant.set(tenantId, {
      maNguoiThue: tenantId,
      vaiTro: participant.vaiTro === "DAI_DIEN" ? "DAI_DIEN" : "O_CUNG",
      ngayThamGia: participant.ngayThamGia ?? defaultStartDate,
    });
  }

  byTenant.set(maNguoiDaiDien, {
    maNguoiThue: maNguoiDaiDien,
    vaiTro: "DAI_DIEN",
    ngayThamGia: defaultStartDate,
  });

  const normalized = Array.from(byTenant.values());

  if (normalized.length === 0) {
    throw new ApiError(400, "CONTRACT_TENANTS_REQUIRED", "Hợp đồng phải có ít nhất một người thuê");
  }

  return normalized;
}

async function fetchContractListRows(
  maChuTro: string,
  filters?: { keyword?: string; status?: ContractStatus; maNhaTro?: string; fromDate?: string; toDate?: string }
): Promise<ContractListRow[]> {
  let whereConditions = "n.MaChuTro = ? AND n.IsDeleted = 0";
  const params: (string | undefined)[] = [maChuTro];

  if (filters?.keyword) {
    whereConditions += ` AND (
      hd.MaHopDong LIKE ? 
      OR n.MaNhaTro LIKE ? 
      OR n.TenNhaTro LIKE ? 
      OR nd.HoTen LIKE ? 
      OR nd.SoDienThoai LIKE ?
    )`;
    const keyword = `%${filters.keyword}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  if (filters?.status) {
    whereConditions += ` AND hd.TrangThai = ?`;
    params.push(filters.status);
  }

  if (filters?.maNhaTro) {
    whereConditions += ` AND hd.MaNhaTro = ?`;
    params.push(filters.maNhaTro);
  }

  if (filters?.fromDate) {
    whereConditions += ` AND hd.NgayBatDau >= ?`;
    params.push(filters.fromDate);
  }

  if (filters?.toDate) {
    whereConditions += ` AND hd.NgayBatDau <= ?`;
    params.push(filters.toDate);
  }

  const [rows] = await pool.query<ContractListRow[]>(
    `
      SELECT
        hd.MaHopDong,
        hd.MaNhaTro,
        n.TenNhaTro,
        hd.MaNguoiDaiDien,
        nd.HoTen AS TenNguoiDaiDien,
        nd.SoDienThoai AS SoDienThoaiNguoiDaiDien,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TienThue,
        hd.TienCoc,
        hd.GhiChu,
        hd.TrangThai,
        hd.NgayTao,
        COALESCE(hd.DaKy, 0) AS DaKy,
        hd.NgayKy,
        COUNT(hdnt.MaNguoiThue) AS SoNguoiThue,
        COUNT(DISTINCT hdon.MaHoaDon) AS SoHoaDon,
        COUNT(DISTINCT CASE WHEN hdon.TrangThai = 'CHUA_THANH_TOAN' THEN hdon.MaHoaDon END) AS SoHoaDonChuaThanhToan
      FROM HOPDONG hd
      INNER JOIN NHATRO n ON n.MaNhaTro = hd.MaNhaTro
      INNER JOIN NGUOITHUE nd ON nd.MaNguoiThue = hd.MaNguoiDaiDien
      LEFT JOIN HOPDONG_NGUOITHUE hdnt ON hdnt.MaHopDong = hd.MaHopDong
      LEFT JOIN HOADON hdon ON hdon.MaHopDong = hd.MaHopDong
      WHERE ${whereConditions}
      GROUP BY
        hd.MaHopDong,
        hd.MaNhaTro,
        n.TenNhaTro,
        hd.MaNguoiDaiDien,
        nd.HoTen,
        nd.SoDienThoai,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TienThue,
        hd.TienCoc,
        hd.GhiChu,
        hd.TrangThai,
        hd.NgayTao,
        hd.DaKy,
        hd.NgayKy
      ORDER BY hd.NgayBatDau DESC, hd.MaHopDong DESC
    `,
    params as any
  );

  return rows;
}

export async function listContracts(
  maChuTro: string,
  filters?: { keyword?: string; status?: ContractStatus; maNhaTro?: string; fromDate?: string; toDate?: string }
) {
  const rows = await fetchContractListRows(maChuTro, filters);
  return rows.map(mapContractListDto);
}

export async function getContract(maHopDong: string, maChuTro: string) {
  const allRows = await fetchContractListRows(maChuTro);
  const contractRow = allRows.find((row) => row.MaHopDong === maHopDong);

  if (!contractRow) {
    throw new ApiError(404, "CONTRACT_NOT_FOUND", "Không tìm thấy hợp đồng");
  }

  const [tenantRows] = await pool.query<ContractTenantRow[]>(
    `
      SELECT
        nt.MaNguoiThue,
        nt.HoTen,
        nt.SoDienThoai,
        nt.CCCD,
        hdnt.VaiTro,
        hdnt.NgayThamGia,
        hdnt.NgayRoiDi,
        hdnt.TrangThai
      FROM HOPDONG_NGUOITHUE hdnt
      INNER JOIN NGUOITHUE nt ON nt.MaNguoiThue = hdnt.MaNguoiThue
      WHERE hdnt.MaHopDong = ?
      ORDER BY
        CASE WHEN hdnt.VaiTro = 'DAI_DIEN' THEN 0 ELSE 1 END,
        hdnt.NgayThamGia ASC,
        nt.HoTen ASC
    `,
    [maHopDong]
  );

  const [invoiceRows] = await pool.query<ContractInvoiceRow[]>(
    `
      SELECT
        MaHoaDon,
        Thang,
        Nam,
        TongTien,
        TrangThai,
        HanThanhToan
      FROM HOADON
      WHERE MaHopDong = ?
      ORDER BY Nam DESC, Thang DESC
    `,
    [maHopDong]
  );

  const [debtRows] = await pool.query<RowDataPacket[]>(
    `
      SELECT COALESCE(SUM(TongTien), 0) AS TongNo
      FROM HOADON
      WHERE MaHopDong = ?
        AND TrangThai = 'CHUA_THANH_TOAN'
    `,
    [maHopDong]
  );

  return {
    item: mapContractListDto(contractRow),
    nguoiThue: tenantRows.map((row) => ({
      maNguoiThue: row.MaNguoiThue,
      hoTen: row.HoTen,
      soDienThoai: row.SoDienThoai,
      cccd: row.CCCD,
      vaiTro: row.VaiTro,
      ngayThamGia: row.NgayThamGia,
      ngayRoiDi: row.NgayRoiDi,
      trangThai: row.TrangThai,
    })),
    hoaDon: invoiceRows.map((row) => ({
      maHoaDon: row.MaHoaDon,
      thang: row.Thang,
      nam: row.Nam,
      tongTien: Number(row.TongTien ?? 0),
      trangThai: row.TrangThai,
      hanThanhToan: row.HanThanhToan,
    })),
    congNo: {
      tongNo: Number(debtRows[0]?.TongNo ?? 0),
    },
  };
}

export async function getContractPrintData(maHopDong: string, maChuTro: string): Promise<ContractPrintData> {
  const [contractRows] = await pool.query<ContractPrintRow[]>(
    `
      SELECT
        hd.MaHopDong,
        hd.NgayTao,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TienThue,
        hd.TienCoc,
        hd.GhiChu,
        hd.TrangThai,
        ct.HoTen AS ChuTro_HoTen,
        ct.SoDienThoai AS ChuTro_SoDienThoai,
        ct.Email AS ChuTro_Email,
        ct.DiaChi AS ChuTro_DiaChi,
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi AS NhaTro_DiaChi,
        n.DienTich,
        n.GiaThue AS GiaThueMacDinh,
        n.TienCoc AS TienCocMacDinh,
        n.TienNghi,
        n.MoTa AS NhaTro_MoTa,
        nd.MaNguoiThue AS NguoiDaiDien_MaNguoiThue,
        nd.HoTen AS NguoiDaiDien_HoTen,
        nd.NgaySinh AS NguoiDaiDien_NgaySinh,
        nd.CCCD AS NguoiDaiDien_CCCD,
        nd.SoDienThoai AS NguoiDaiDien_SoDienThoai,
        nd.Email AS NguoiDaiDien_Email,
        nd.DiaChi AS NguoiDaiDien_DiaChi
      FROM HOPDONG hd
      INNER JOIN NHATRO n ON n.MaNhaTro = hd.MaNhaTro
      INNER JOIN CHUTRO ct ON ct.MaChuTro = n.MaChuTro
      INNER JOIN NGUOITHUE nd ON nd.MaNguoiThue = hd.MaNguoiDaiDien
      WHERE hd.MaHopDong = ?
        AND n.MaChuTro = ?
        AND n.IsDeleted = 0
      LIMIT 1
    `,
    [maHopDong, maChuTro]
  );

  const contract = contractRows[0];
  if (!contract) {
    throw new ApiError(404, "CONTRACT_NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y há»£p Ä‘á»“ng");
  }

  const [tenantRows] = await pool.query<ContractPrintTenantRow[]>(
    `
      SELECT
        nt.MaNguoiThue,
        nt.HoTen,
        nt.CCCD,
        nt.SoDienThoai,
        hdnt.VaiTro,
        hdnt.TrangThai
      FROM HOPDONG_NGUOITHUE hdnt
      INNER JOIN NGUOITHUE nt ON nt.MaNguoiThue = hdnt.MaNguoiThue
      WHERE hdnt.MaHopDong = ?
      ORDER BY
        CASE WHEN hdnt.VaiTro = 'DAI_DIEN' THEN 0 ELSE 1 END,
        hdnt.NgayThamGia ASC,
        nt.HoTen ASC
    `,
    [maHopDong]
  );

  return {
    maHopDong: contract.MaHopDong,
    ngayLapHopDong: contract.NgayTao ?? new Date(),
    ngayBatDau: contract.NgayBatDau,
    ngayKetThuc: contract.NgayKetThuc,
    tienThue: Number(contract.TienThue ?? 0),
    tienCoc: Number(contract.TienCoc ?? 0),
    ghiChu: contract.GhiChu,
    trangThai: contract.TrangThai,
    chuTro: {
      hoTen: contract.ChuTro_HoTen,
      soDienThoai: contract.ChuTro_SoDienThoai,
      email: contract.ChuTro_Email,
      diaChi: contract.ChuTro_DiaChi,
    },
    phong: {
      maNhaTro: contract.MaNhaTro,
      tenNhaTro: contract.TenNhaTro,
      diaChi: contract.NhaTro_DiaChi,
      dienTich: Number(contract.DienTich ?? 0),
      giaThueMacDinh: Number(contract.GiaThueMacDinh ?? 0),
      tienCocMacDinh: Number(contract.TienCocMacDinh ?? 0),
      tienNghi: contract.TienNghi,
      moTa: contract.NhaTro_MoTa,
    },
    nguoiDaiDien: {
      maNguoiThue: contract.NguoiDaiDien_MaNguoiThue,
      hoTen: contract.NguoiDaiDien_HoTen,
      ngaySinh: contract.NguoiDaiDien_NgaySinh,
      cccd: contract.NguoiDaiDien_CCCD,
      soDienThoai: contract.NguoiDaiDien_SoDienThoai,
      email: contract.NguoiDaiDien_Email,
      diaChi: contract.NguoiDaiDien_DiaChi,
    },
    nguoiThue: tenantRows.map((row) => ({
      maNguoiThue: row.MaNguoiThue,
      hoTen: row.HoTen,
      cccd: row.CCCD,
      soDienThoai: row.SoDienThoai,
      vaiTro: row.VaiTro,
      trangThai: row.TrangThai,
    })),
  };
}

export async function getContractFormOptions(maChuTro: string) {
  const [roomRows] = await pool.query<RoomOptionRow[]>(
    `
      SELECT
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi,
        n.DienTich,
        n.GiaThue,
        n.TienCoc,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM HOPDONG hd
            WHERE hd.MaNhaTro = n.MaNhaTro
              AND hd.TrangThai = 'DANG_HIEU_LUC'
          ) THEN 'DANG_THUE'
          WHEN n.TrangThai = 'BAO_TRI' THEN 'BAO_TRI'
          ELSE 'TRONG'
        END AS TrangThai
      FROM NHATRO n
      WHERE n.MaChuTro = ?
        AND n.IsDeleted = 0
      ORDER BY n.MaNhaTro ASC
    `,
    [maChuTro]
  );

  const [tenantRows] = await pool.query<TenantOptionRow[]>(
    `
      SELECT MaNguoiThue, HoTen, SoDienThoai, CCCD
      FROM NGUOITHUE
      ORDER BY MaNguoiThue DESC
    `
  );

  return {
    rooms: roomRows.map((row) => ({
      maNhaTro: row.MaNhaTro,
      tenNhaTro: row.TenNhaTro,
      diaChi: row.DiaChi,
      dienTich: Number(row.DienTich ?? 0),
      giaThue: Number(row.GiaThue ?? 0),
      tienCoc: Number(row.TienCoc ?? 0),
      trangThai: row.TrangThai,
    })),
    tenants: tenantRows.map((row) => ({
      maNguoiThue: row.MaNguoiThue,
      hoTen: row.HoTen,
      soDienThoai: row.SoDienThoai,
      cccd: row.CCCD,
    })),
  };
}

export async function createContract(input: CreateContractInput, maChuTro: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await ensureRoomOwned(conn, input.maNhaTro, maChuTro);
    await ensureTenantExists(conn, input.maNguoiDaiDien);

    const participants = normalizeParticipants(input.nguoiThue, input.maNguoiDaiDien, input.ngayBatDau);
    for (const participant of participants) {
      await ensureTenantExists(conn, participant.maNguoiThue);
    }

    const maHopDong = await generateContractId(conn);

    await conn.execute<ResultSetHeader>(
      `
        INSERT INTO HOPDONG (
          MaHopDong,
          MaNguoiDaiDien,
          MaNhaTro,
          NgayBatDau,
          NgayKetThuc,
          TienThue,
          TienCoc,
          GhiChu,
          TrangThai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DANG_HIEU_LUC')
      `,
      [
        maHopDong,
        input.maNguoiDaiDien,
        input.maNhaTro,
        input.ngayBatDau,
        input.ngayKetThuc ?? null,
        input.tienThue,
        input.tienCoc,
        normalizeNullableString(input.ghiChu),
      ]
    );

    for (const participant of participants) {
      if (participant.maNguoiThue === input.maNguoiDaiDien) {
        continue;
      }

      await conn.execute<ResultSetHeader>(
        `
          INSERT INTO HOPDONG_NGUOITHUE (
            MaHopDong,
            MaNguoiThue,
            VaiTro,
            NgayThamGia,
            NgayRoiDi,
            TrangThai
          )
          VALUES (?, ?, 'O_CUNG', ?, NULL, 'DANG_O')
          ON DUPLICATE KEY UPDATE
            VaiTro = 'O_CUNG',
            NgayThamGia = VALUES(NgayThamGia),
            NgayRoiDi = NULL,
            TrangThai = 'DANG_O'
        `,
        [maHopDong, participant.maNguoiThue, participant.ngayThamGia]
      );
    }

    await conn.commit();

    const created = await getContract(maHopDong, maChuTro);
    return created.item;
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateContract(maHopDong: string, input: UpdateContractInput, maChuTro: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const existing = await ensureContractOwned(conn, maHopDong, maChuTro);
    if (Number(existing.DaKy ?? 0) === 1) {
      throw new ApiError(
        409,
        "CONTRACT_ALREADY_SIGNED",
        "Hợp đồng đã xác nhận ký nên không thể chỉnh sửa"
      );
    }

    const nextRoomId = input.maNhaTro ?? existing.MaNhaTro;
    const nextRepresentative = input.maNguoiDaiDien ?? existing.MaNguoiDaiDien;
    const nextStartDate = input.ngayBatDau ?? toDateOnly(existing.NgayBatDau) ?? "";
    const nextEndDate = input.ngayKetThuc !== undefined ? input.ngayKetThuc : toDateOnly(existing.NgayKetThuc);
    const nextStatus = input.trangThai ?? existing.TrangThai;
    const nextTienThue = input.tienThue ?? Number(existing.TienThue ?? 0);
    const nextTienCoc = input.tienCoc ?? Number(existing.TienCoc ?? 0);

    if (input.maNhaTro && input.maNhaTro !== existing.MaNhaTro) {
      const hasInvoices = await contractHasInvoices(conn, maHopDong);
      if (hasInvoices) {
        throw new ApiError(
          409,
          "CONTRACT_ROOM_LOCKED_BY_INVOICES",
          "Không thể đổi phòng vì hợp đồng đã phát sinh hóa đơn"
        );
      }
    }

    await ensureRoomOwned(conn, nextRoomId, maChuTro);
    await ensureTenantExists(conn, nextRepresentative);

    if (Object.keys(input).length === 0) {
      throw new ApiError(400, "NO_UPDATABLE_FIELDS", "Không có trường nào để cập nhật");
    }

    await conn.execute<ResultSetHeader>(
      `
        UPDATE HOPDONG
        SET MaNguoiDaiDien = ?,
            MaNhaTro = ?,
            NgayBatDau = ?,
            NgayKetThuc = ?,
            TienThue = ?,
            TienCoc = ?,
            GhiChu = ?,
            TrangThai = ?
        WHERE MaHopDong = ?
      `,
      [
        nextRepresentative,
        nextRoomId,
        nextStartDate,
        nextEndDate,
        nextTienThue,
        nextTienCoc,
        input.ghiChu !== undefined ? normalizeNullableString(input.ghiChu) : existing.GhiChu,
        nextStatus,
        maHopDong,
      ]
    );

    if (input.nguoiThue) {
      const participants = normalizeParticipants(input.nguoiThue, nextRepresentative, nextStartDate);
      for (const participant of participants) {
        await ensureTenantExists(conn, participant.maNguoiThue);
      }

      const participantsSet = new Set(participants.map((item) => item.maNguoiThue));
      const offDate = nextEndDate ?? new Date().toISOString().slice(0, 10);

      for (const participant of participants) {
        const role: TenantRole = participant.maNguoiThue === nextRepresentative ? "DAI_DIEN" : "O_CUNG";
        const stayStatus: TenantStayStatus = nextStatus === "DANG_HIEU_LUC" ? "DANG_O" : "DA_ROI";

        await conn.execute<ResultSetHeader>(
          `
            INSERT INTO HOPDONG_NGUOITHUE (
              MaHopDong,
              MaNguoiThue,
              VaiTro,
              NgayThamGia,
              NgayRoiDi,
              TrangThai
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              VaiTro = VALUES(VaiTro),
              NgayThamGia = VALUES(NgayThamGia),
              NgayRoiDi = VALUES(NgayRoiDi),
              TrangThai = VALUES(TrangThai)
          `,
          [
            maHopDong,
            participant.maNguoiThue,
            role,
            participant.ngayThamGia,
            stayStatus === "DANG_O" ? null : offDate,
            stayStatus,
          ]
        );
      }

      const [existingRows] = await conn.query<RowDataPacket[]>(
        `
          SELECT MaNguoiThue
          FROM HOPDONG_NGUOITHUE
          WHERE MaHopDong = ?
        `,
        [maHopDong]
      );

      for (const row of existingRows) {
        const tenantId = String(row.MaNguoiThue);
        if (!participantsSet.has(tenantId) && tenantId !== nextRepresentative) {
          await conn.execute<ResultSetHeader>(
            `
              UPDATE HOPDONG_NGUOITHUE
              SET TrangThai = 'DA_ROI',
                  NgayRoiDi = COALESCE(NgayRoiDi, ?),
                  VaiTro = 'O_CUNG'
              WHERE MaHopDong = ?
                AND MaNguoiThue = ?
            `,
            [offDate, maHopDong, tenantId]
          );
        }
      }
    }

    await conn.commit();

    const updated = await getContract(maHopDong, maChuTro);
    return updated.item;
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function terminateContract(maHopDong: string, input: TerminateContractInput, maChuTro: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const contract = await ensureContractOwned(conn, maHopDong, maChuTro);
    if (contract.TrangThai !== "DANG_HIEU_LUC") {
      throw new ApiError(409, "CONTRACT_NOT_ACTIVE", "Chỉ có thể kết thúc hợp đồng đang hiệu lực");
    }

    const appendedNote = [
      normalizeNullableString(contract.GhiChu),
      normalizeNullableString(input.ghiChu),
    ]
      .filter(Boolean)
      .join("\n");

    await conn.execute<ResultSetHeader>(
      `
        UPDATE HOPDONG
        SET TrangThai = 'DA_KET_THUC',
            NgayKetThuc = ?,
            GhiChu = ?
        WHERE MaHopDong = ?
      `,
      [input.ngayKetThuc, appendedNote || null, maHopDong]
    );

    await conn.execute<ResultSetHeader>(
      `
        UPDATE HOPDONG_NGUOITHUE
        SET TrangThai = 'DA_ROI',
            NgayRoiDi = COALESCE(NgayRoiDi, ?)
        WHERE MaHopDong = ?
          AND TrangThai = 'DANG_O'
      `,
      [input.ngayKetThuc, maHopDong]
    );

    await conn.commit();

    const updated = await getContract(maHopDong, maChuTro);
    return updated.item;
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteContract(maHopDong: string, maChuTro: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const contract = await ensureContractOwned(conn, maHopDong, maChuTro);
    if (Number(contract.DaKy ?? 0) === 1) {
      throw new ApiError(409, "CONTRACT_ALREADY_SIGNED", "Hợp đồng đã xác nhận ký nên không thể xóa");
    }

    await conn.execute<ResultSetHeader>(
      `
        DELETE FROM HOADON
        WHERE MaHopDong = ?
      `,
      [maHopDong]
    );

    await conn.execute<ResultSetHeader>(
      `
        DELETE FROM HOPDONG
        WHERE MaHopDong = ?
      `,
      [maHopDong]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function confirmContractSigned(maHopDong: string, maChuTro: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const contract = await ensureContractOwned(conn, maHopDong, maChuTro);
    if (Number(contract.DaKy ?? 0) === 1) {
      throw new ApiError(409, "CONTRACT_ALREADY_SIGNED", "Hợp đồng đã được xác nhận ký");
    }

    await conn.execute<ResultSetHeader>(
      `
        UPDATE HOPDONG
        SET DaKy = 1,
            NgayKy = CURRENT_TIMESTAMP
        WHERE MaHopDong = ?
      `,
      [maHopDong]
    );

    await conn.commit();

    const updated = await getContract(maHopDong, maChuTro);
    return updated.item;
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function markTenantLeft(
  maHopDong: string,
  maNguoiThue: string,
  ngayRoiDi: string | null,
  maChuTro: string
) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const contract = await ensureContractOwned(conn, maHopDong, maChuTro);
    if (contract.TrangThai !== "DANG_HIEU_LUC") {
      throw new ApiError(
        409,
        "CONTRACT_NOT_ACTIVE",
        "Chỉ có thể đánh dấu rời khi hợp đồng đang hiệu lực"
      );
    }

    if (maNguoiThue === contract.MaNguoiDaiDien) {
      throw new ApiError(
        409,
        "CONTRACT_REPRESENTATIVE_CANNOT_LEAVE",
        "Không thể đánh dấu người đại diện đã rời khỏi hợp đồng"
      );
    }

    const [rows] = await conn.query<RowDataPacket[]>(
      `
        SELECT TrangThai
        FROM HOPDONG_NGUOITHUE
        WHERE MaHopDong = ?
          AND MaNguoiThue = ?
        LIMIT 1
      `,
      [maHopDong, maNguoiThue]
    );

    if (!rows[0]) {
      throw new ApiError(404, "CONTRACT_TENANT_NOT_FOUND", "Người thuê không thuộc hợp đồng này");
    }

    if (rows[0].TrangThai === "DA_ROI") {
      throw new ApiError(409, "CONTRACT_TENANT_ALREADY_LEFT", "Người thuê đã được đánh dấu rời");
    }

    await conn.execute<ResultSetHeader>(
      `
        UPDATE HOPDONG_NGUOITHUE
        SET TrangThai = 'DA_ROI',
            NgayRoiDi = COALESCE(?, CURDATE())
        WHERE MaHopDong = ?
          AND MaNguoiThue = ?
      `,
      [ngayRoiDi, maHopDong, maNguoiThue]
    );

    await conn.commit();

    const updated = await getContract(maHopDong, maChuTro);
    return updated.item;
  } catch (err) {
    await conn.rollback();
    const mapped = mapMysqlContractError(err);
    if (mapped) {
      throw mapped;
    }
    throw err;
  } finally {
    conn.release();
  }
}
