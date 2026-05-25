import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../db/pool";
import { ApiError } from "../../errors/api-error";

type TenantRow = RowDataPacket & {
  MaNguoiThue: string;
  HoTen: string;
  SoDienThoai: string;
  CCCD: string;
  Email: string | null;
  NgaySinh: Date | null;
  DiaChi: string | null;
  GhiChu: string | null;
};

type TenantListRow = TenantRow & {
  MaNhaTroHienTai: string | null;
  TenNhaTroHienTai: string | null;
  VaiTroHienTai: "DAI_DIEN" | "O_CUNG" | null;
  TrangThaiHienTai: "DANG_O" | "DA_ROI";
  NgayThamGiaGanNhat: Date | null;
  SoHopDong: number;
};

type TenantContractRow = RowDataPacket & {
  MaHopDong: string;
  MaNhaTro: string;
  TenNhaTro: string;
  VaiTro: "DAI_DIEN" | "O_CUNG";
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TrangThai: "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
};

type TenantInvoiceRow = RowDataPacket & {
  MaHoaDon: string;
  MaHopDong: string;
  Thang: number;
  Nam: number;
  TongTien: number;
  TrangThai: "CHUA_THANH_TOAN" | "DA_THANH_TOAN";
};

type CountRow = RowDataPacket & {
  total: number;
};

type ContractReferenceRow = RowDataPacket & {
  MaHopDong: string;
  TrangThai: "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
};

export type CreateTenantInput = {
  hoTen: string;
  soDienThoai: string;
  cccd: string;
  email?: string | null;
  ngaySinh?: string | null;
  diaChi?: string | null;
  ghiChu?: string | null;
};

export type UpdateTenantInput = Partial<CreateTenantInput>;

function normalizeNullableString(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapContractStatus(status: TenantContractRow["TrangThai"]): string {
  if (status === "DANG_HIEU_LUC") {
    return "DANG_HIEU_LUC";
  }
  if (status === "DA_KET_THUC") {
    return "DA_KET_THUC";
  }
  return "DA_HUY";
}

function toTenantListDto(row: TenantListRow) {
  return {
    maNguoiThue: row.MaNguoiThue,
    hoTen: row.HoTen,
    soDienThoai: row.SoDienThoai,
    cccd: row.CCCD,
    email: row.Email,
    ngaySinh: row.NgaySinh,
    diaChi: row.DiaChi,
    ghiChu: row.GhiChu,
    currentRoom: row.MaNhaTroHienTai
      ? {
          maNhaTro: row.MaNhaTroHienTai,
          tenNhaTro: row.TenNhaTroHienTai,
        }
      : null,
    vaiTroHienTai: row.VaiTroHienTai,
    trangThaiHienTai: row.TrangThaiHienTai,
    ngayThamGiaGanNhat: row.NgayThamGiaGanNhat,
    soHopDong: Number(row.SoHopDong ?? 0),
  };
}

function toTenantDto(row: TenantRow) {
  return {
    maNguoiThue: row.MaNguoiThue,
    hoTen: row.HoTen,
    soDienThoai: row.SoDienThoai,
    cccd: row.CCCD,
    email: row.Email,
    ngaySinh: row.NgaySinh,
    diaChi: row.DiaChi,
    ghiChu: row.GhiChu,
  };
}

async function getContractParticipationCount(maNguoiThue: string): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOPDONG_NGUOITHUE
      WHERE MaNguoiThue = ?
    `,
    [maNguoiThue]
  );
  return Number(rows[0]?.total ?? 0);
}

async function getStayingParticipationCount(maNguoiThue: string): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOPDONG_NGUOITHUE hdnt
      WHERE hdnt.MaNguoiThue = ?
        AND hdnt.TrangThai = 'DANG_O'
    `,
    [maNguoiThue]
  );
  return Number(rows[0]?.total ?? 0);
}

async function ensureTenantExists(maNguoiThue: string): Promise<TenantRow> {
  const [rows] = await pool.query<TenantRow[]>(
    `
      SELECT MaNguoiThue, HoTen, SoDienThoai, CCCD, Email, NgaySinh, DiaChi, GhiChu
      FROM NGUOITHUE
      WHERE MaNguoiThue = ?
      LIMIT 1
    `,
    [maNguoiThue]
  );

  const tenant = rows[0];
  if (!tenant) {
    throw new ApiError(404, "TENANT_NOT_FOUND", "Không tìm thấy người thuê");
  }

  return tenant;
}

async function generateTenantId(): Promise<string> {
  for (let i = 0; i < 5; i += 1) {
    const candidate = `NT${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10)}`;
    const [rows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM NGUOITHUE WHERE MaNguoiThue = ?`,
      [candidate]
    );
    if (Number(rows[0]?.total ?? 0) === 0) {
      return candidate;
    }
  }

  throw new ApiError(500, "TENANT_ID_GENERATION_FAILED", "Không thể tạo mã người thuê");
}

export async function listTenants() {
  const [rows] = await pool.query<TenantListRow[]>(
    `
      SELECT
        nt.MaNguoiThue,
        nt.HoTen,
        nt.SoDienThoai,
        nt.CCCD,
        nt.Email,
        nt.NgaySinh,
        nt.DiaChi,
        nt.GhiChu,
        cur.MaNhaTro AS MaNhaTroHienTai,
        cur.TenNhaTro AS TenNhaTroHienTai,
        cur.VaiTro AS VaiTroHienTai,
        CASE WHEN cur.MaNhaTro IS NULL THEN 'DA_ROI' ELSE 'DANG_O' END AS TrangThaiHienTai,
        cur.NgayThamGia AS NgayThamGiaGanNhat,
        COALESCE(hdcount.SoHopDong, 0) AS SoHopDong
      FROM NGUOITHUE nt
      LEFT JOIN (
        SELECT
          hdnt.MaNguoiThue,
          hd.MaNhaTro,
          n.TenNhaTro,
          hdnt.VaiTro,
          hdnt.NgayThamGia
        FROM HOPDONG_NGUOITHUE hdnt
        INNER JOIN HOPDONG hd ON hd.MaHopDong = hdnt.MaHopDong
        INNER JOIN NHATRO n ON n.MaNhaTro = hd.MaNhaTro
        WHERE hdnt.TrangThai = 'DANG_O'
          AND hd.TrangThai = 'DANG_HIEU_LUC'
      ) cur ON cur.MaNguoiThue = nt.MaNguoiThue
      LEFT JOIN (
        SELECT MaNguoiThue, COUNT(*) AS SoHopDong
        FROM HOPDONG_NGUOITHUE
        GROUP BY MaNguoiThue
      ) hdcount ON hdcount.MaNguoiThue = nt.MaNguoiThue
      ORDER BY nt.MaNguoiThue DESC
    `
  );

  return rows.map(toTenantListDto);
}

export async function getTenant(maNguoiThue: string) {
  const tenant = await ensureTenantExists(maNguoiThue);

  const [historyRows] = await pool.query<TenantContractRow[]>(
    `
      SELECT
        hd.MaHopDong,
        hd.MaNhaTro,
        n.TenNhaTro,
        hdnt.VaiTro,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TrangThai
      FROM HOPDONG_NGUOITHUE hdnt
      INNER JOIN HOPDONG hd ON hd.MaHopDong = hdnt.MaHopDong
      INNER JOIN NHATRO n ON n.MaNhaTro = hd.MaNhaTro
      WHERE hdnt.MaNguoiThue = ?
      ORDER BY hd.NgayBatDau DESC, hd.MaHopDong DESC
    `,
    [maNguoiThue]
  );

  const [invoiceRows] = await pool.query<TenantInvoiceRow[]>(
    `
      SELECT
        hdon.MaHoaDon,
        hdon.MaHopDong,
        hdon.Thang,
        hdon.Nam,
        hdon.TongTien,
        hdon.TrangThai
      FROM HOPDONG_NGUOITHUE hdnt
      INNER JOIN HOADON hdon ON hdon.MaHopDong = hdnt.MaHopDong
      WHERE hdnt.MaNguoiThue = ?
      ORDER BY hdon.Nam DESC, hdon.Thang DESC
      LIMIT 12
    `,
    [maNguoiThue]
  );

  const [debtRows] = await pool.query<RowDataPacket[]>(
    `
      SELECT
        COUNT(*) AS soHoaDon,
        COALESCE(SUM(hdon.TongTien), 0) AS tongNo
      FROM HOPDONG_NGUOITHUE hdnt
      INNER JOIN HOADON hdon ON hdon.MaHopDong = hdnt.MaHopDong
      WHERE hdnt.MaNguoiThue = ?
        AND hdon.TrangThai = 'CHUA_THANH_TOAN'
    `,
    [maNguoiThue]
  );

  return {
    item: toTenantDto(tenant),
    lichSuHopDong: historyRows.map((row) => ({
      maHopDong: row.MaHopDong,
      maNhaTro: row.MaNhaTro,
      tenNhaTro: row.TenNhaTro,
      vaiTro: row.VaiTro,
      ngayBatDau: row.NgayBatDau,
      ngayKetThuc: row.NgayKetThuc,
      trangThai: mapContractStatus(row.TrangThai),
    })),
    hoaDonGanDay: invoiceRows.map((row) => ({
      maHoaDon: row.MaHoaDon,
      maHopDong: row.MaHopDong,
      thang: row.Thang,
      nam: row.Nam,
      tongTien: Number(row.TongTien ?? 0),
      trangThai: row.TrangThai,
    })),
    congNo: {
      soHoaDon: Number(debtRows[0]?.soHoaDon ?? 0),
      tongNo: Number(debtRows[0]?.tongNo ?? 0),
    },
  };
}

export async function createTenant(input: CreateTenantInput) {
  const maNguoiThue = await generateTenantId();

  try {
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO NGUOITHUE (
          MaNguoiThue,
          HoTen,
          SoDienThoai,
          CCCD,
          Email,
          NgaySinh,
          DiaChi,
          GhiChu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        maNguoiThue,
        input.hoTen.trim(),
        input.soDienThoai.trim(),
        input.cccd.trim(),
        normalizeNullableString(input.email),
        input.ngaySinh ?? null,
        normalizeNullableString(input.diaChi),
        normalizeNullableString(input.ghiChu),
      ]
    );
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string; errno?: number; sqlMessage?: string };
    if (mysqlErr?.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "TENANT_DUPLICATE_CCCD", "CCCD đã tồn tại trong hệ thống");
    }
    throw err;
  }

  const created = await ensureTenantExists(maNguoiThue);
  return toTenantDto(created);
}

export async function updateTenant(maNguoiThue: string, input: UpdateTenantInput) {
  const existing = await ensureTenantExists(maNguoiThue);
  const participatedCount = await getContractParticipationCount(maNguoiThue);

  const nextCccd = input.cccd?.trim();
  if (nextCccd && nextCccd !== existing.CCCD && participatedCount > 0) {
    throw new ApiError(
      409,
      "TENANT_CCCD_LOCKED",
      "Không thể thay đổi CCCD vì người thuê đã tham gia hợp đồng"
    );
  }

  try {
    await pool.execute<ResultSetHeader>(
      `
        UPDATE NGUOITHUE
        SET HoTen = ?,
            SoDienThoai = ?,
            CCCD = ?,
            Email = ?,
            NgaySinh = ?,
            DiaChi = ?,
            GhiChu = ?
        WHERE MaNguoiThue = ?
      `,
      [
        input.hoTen?.trim() ?? existing.HoTen,
        input.soDienThoai?.trim() ?? existing.SoDienThoai,
        nextCccd ?? existing.CCCD,
        input.email !== undefined ? normalizeNullableString(input.email) : existing.Email,
        input.ngaySinh !== undefined ? input.ngaySinh : existing.NgaySinh,
        input.diaChi !== undefined ? normalizeNullableString(input.diaChi) : existing.DiaChi,
        input.ghiChu !== undefined ? normalizeNullableString(input.ghiChu) : existing.GhiChu,
        maNguoiThue,
      ]
    );
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr?.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "TENANT_DUPLICATE_CCCD", "CCCD đã tồn tại trong hệ thống");
    }
    throw err;
  }

  const updated = await ensureTenantExists(maNguoiThue);
  return toTenantDto(updated);
}

export async function deleteTenant(maNguoiThue: string) {
  await ensureTenantExists(maNguoiThue);

  const stayingCount = await getStayingParticipationCount(maNguoiThue);
  if (stayingCount > 0) {
    throw new ApiError(
      409,
      "TENANT_ACTIVE_IN_CONTRACT",
      "Không thể xóa người thuê đang ở"
    );
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [representativeContracts] = await conn.query<ContractReferenceRow[]>(
      `
        SELECT MaHopDong, TrangThai
        FROM HOPDONG
        WHERE MaNguoiDaiDien = ?
      `,
      [maNguoiThue]
    );

    const hasActiveRepresentativeContract = representativeContracts.some(
      (contract) => contract.TrangThai === "DANG_HIEU_LUC"
    );
    if (hasActiveRepresentativeContract) {
      throw new ApiError(
        409,
        "TENANT_ACTIVE_IN_CONTRACT",
        "Không thể xóa người thuê đang là đại diện hợp đồng hiệu lực"
      );
    }

    const endedRepresentativeContractIds = representativeContracts.map(
      (contract) => contract.MaHopDong
    );

    if (endedRepresentativeContractIds.length > 0) {
      await conn.query(
        `
          UPDATE HOPDONG_NGUOITHUE
          SET TrangThai = 'DA_ROI',
              NgayRoiDi = COALESCE(NgayRoiDi, (
                SELECT hd.NgayKetThuc
                FROM HOPDONG hd
                WHERE hd.MaHopDong = HOPDONG_NGUOITHUE.MaHopDong
              ))
          WHERE MaHopDong IN (?)
        `,
        [endedRepresentativeContractIds]
      );

      await conn.query(
        `
          DELETE FROM HOADON
          WHERE MaHopDong IN (?)
        `,
        [endedRepresentativeContractIds]
      );

      await conn.query(
        `
          DELETE FROM HOPDONG_NGUOITHUE
          WHERE MaHopDong IN (?)
        `,
        [endedRepresentativeContractIds]
      );

      await conn.query(
        `
          DELETE FROM HOPDONG
          WHERE MaHopDong IN (?)
        `,
        [endedRepresentativeContractIds]
      );
    }

    await conn.execute<ResultSetHeader>(
      `
        DELETE FROM HOPDONG_NGUOITHUE
        WHERE MaNguoiThue = ?
          AND TrangThai = 'DA_ROI'
      `,
      [maNguoiThue]
    );

    await conn.execute<ResultSetHeader>(
      `
        DELETE FROM NGUOITHUE
        WHERE MaNguoiThue = ?
        LIMIT 1
      `,
      [maNguoiThue]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
