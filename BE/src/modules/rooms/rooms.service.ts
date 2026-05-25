import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../db/pool";
import { ApiError } from "../../errors/api-error";

type NhaTroRow = RowDataPacket & {
  MaNhaTro: string;
  TenNhaTro: string;
  DiaChi: string;
  DienTich: number;
  GiaThue: number;
  TienCoc: number;
  MoTa: string | null;
  TienNghi: string | null;
  TrangThai: "TRONG" | "DANG_THUE" | "BAO_TRI";
  MaChuTro: string;
};

type ListRoomRow = RowDataPacket & {
  MaNhaTro: string;
  TenNhaTro: string;
  DiaChi: string;
  DienTich: number;
  GiaThue: number;
  TienCoc: number;
  MoTa: string | null;
  TienNghi: string | null;
  TrangThaiHienThi: "TRONG" | "DANG_THUE" | "BAO_TRI";
  MaChuTro: string;
  MaNguoiDaiDien: string | null;
  NguoiDaiDien: string | null;
  SoDienThoaiNguoiDaiDien: string | null;
  SoNguoiDangO: number;
};

type OccupantRow = RowDataPacket & {
  MaNguoiThue: string;
  HoTen: string;
  SoDienThoai: string;
  VaiTro: "DAI_DIEN" | "O_CUNG";
};

type ContractHistoryRow = RowDataPacket & {
  MaHopDong: string;
  NguoiDaiDien: string | null;
  SoNguoi: number;
  NgayBatDau: Date;
  NgayKetThuc: Date | null;
  TrangThai: "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
};

type RevenueMonthlyRow = RowDataPacket & {
  Thang: number;
  Nam: number;
  TongTien: number;
};

type RevenueTotalRow = RowDataPacket & {
  TongDoanhThu: number | null;
  TongDoanhThu12Thang: number | null;
};

type CountRow = RowDataPacket & {
  total: number;
};

type ExistingRoomStateRow = RowDataPacket & {
  MaNhaTro: string;
  MaChuTro: string;
  IsDeleted: number;
};

export type CreateRoomInput = {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa?: string;
  tienNghi?: string;
  trangThai?: "TRONG" | "BAO_TRI";
};

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, "maNhaTro">>;

function toRoomDto(row: NhaTroRow | ListRoomRow) {
  const detail = row as ListRoomRow;
  return {
    maNhaTro: row.MaNhaTro,
    tenNhaTro: row.TenNhaTro,
    diaChi: row.DiaChi,
    dienTich: row.DienTich,
    giaThue: row.GiaThue,
    tienCoc: row.TienCoc,
    moTa: row.MoTa,
    tienNghi: row.TienNghi,
    trangThai:
      "TrangThaiHienThi" in detail
        ? detail.TrangThaiHienThi
        : row.TrangThai,
    maChuTro: row.MaChuTro,
    nguoiDaiDien:
      "NguoiDaiDien" in detail && detail.NguoiDaiDien
        ? {
            maNguoiThue: detail.MaNguoiDaiDien,
            hoTen: detail.NguoiDaiDien,
            soDienThoai: detail.SoDienThoaiNguoiDaiDien,
          }
        : null,
    soNguoiDangO:
      "SoNguoiDangO" in detail ? Number(detail.SoNguoiDangO ?? 0) : 0,
  };
}

async function getActiveContractCount(maNhaTro: string): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOPDONG
      WHERE MaNhaTro = ?
        AND TrangThai = 'DANG_HIEU_LUC'
    `,
    [maNhaTro]
  );
  return Number(rows[0]?.total ?? 0);
}

async function assertRoomExists(maNhaTro: string, maChuTro: string): Promise<void> {
  const [rows] = await pool.query<NhaTroRow[]>(
    `
      SELECT MaNhaTro, TenNhaTro, DiaChi, DienTich, GiaThue, TienCoc, MoTa, TienNghi, TrangThai, MaChuTro
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

function mapContractStatus(status: ContractHistoryRow["TrangThai"]) {
  switch (status) {
    case "DANG_HIEU_LUC":
      return "Đang hiệu lực";
    case "DA_KET_THUC":
      return "Đã kết thúc";
    default:
      return "Hủy";
  }
}

export async function listRooms(maChuTro: string) {
  const [rows] = await pool.query<ListRoomRow[]>(
    `
      SELECT
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi,
        n.DienTich,
        n.GiaThue,
        n.TienCoc,
        n.MoTa,
        n.TienNghi,
        n.MaChuTro,
        hd.MaNguoiDaiDien,
        nd.HoTen AS NguoiDaiDien,
        nd.SoDienThoai AS SoDienThoaiNguoiDaiDien,
        COUNT(hdnt.MaNguoiThue) AS SoNguoiDangO,
        CASE
          WHEN hd.MaHopDong IS NOT NULL THEN 'DANG_THUE'
          WHEN n.TrangThai = 'BAO_TRI' THEN 'BAO_TRI'
          ELSE 'TRONG'
        END AS TrangThaiHienThi
      FROM NHATRO n
      LEFT JOIN HOPDONG hd
        ON n.MaNhaTro = hd.MaNhaTro
       AND hd.TrangThai = 'DANG_HIEU_LUC'
      LEFT JOIN NGUOITHUE nd
        ON hd.MaNguoiDaiDien = nd.MaNguoiThue
      LEFT JOIN HOPDONG_NGUOITHUE hdnt
        ON hd.MaHopDong = hdnt.MaHopDong
       AND hdnt.TrangThai = 'DANG_O'
      WHERE n.MaChuTro = ?
        AND n.IsDeleted = 0
      GROUP BY
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi,
        n.DienTich,
        n.GiaThue,
        n.TienCoc,
        n.MoTa,
        n.TienNghi,
        n.MaChuTro,
        hd.MaHopDong,
        hd.MaNguoiDaiDien,
        nd.HoTen,
        nd.SoDienThoai,
        n.TrangThai
      ORDER BY n.MaNhaTro ASC
    `,
    [maChuTro]
  );

  return rows.map(toRoomDto);
}

export async function getRoom(maNhaTro: string, maChuTro: string) {
  const [rows] = await pool.query<ListRoomRow[]>(
    `
      SELECT
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi,
        n.DienTich,
        n.GiaThue,
        n.TienCoc,
        n.MoTa,
        n.TienNghi,
        n.MaChuTro,
        hd.MaNguoiDaiDien,
        nd.HoTen AS NguoiDaiDien,
        nd.SoDienThoai AS SoDienThoaiNguoiDaiDien,
        COUNT(hdnt.MaNguoiThue) AS SoNguoiDangO,
        CASE
          WHEN hd.MaHopDong IS NOT NULL THEN 'DANG_THUE'
          WHEN n.TrangThai = 'BAO_TRI' THEN 'BAO_TRI'
          ELSE 'TRONG'
        END AS TrangThaiHienThi
      FROM NHATRO n
      LEFT JOIN HOPDONG hd
        ON n.MaNhaTro = hd.MaNhaTro
       AND hd.TrangThai = 'DANG_HIEU_LUC'
      LEFT JOIN NGUOITHUE nd
        ON hd.MaNguoiDaiDien = nd.MaNguoiThue
      LEFT JOIN HOPDONG_NGUOITHUE hdnt
        ON hd.MaHopDong = hdnt.MaHopDong
       AND hdnt.TrangThai = 'DANG_O'
      WHERE n.MaNhaTro = ?
        AND n.MaChuTro = ?
        AND n.IsDeleted = 0
      GROUP BY
        n.MaNhaTro,
        n.TenNhaTro,
        n.DiaChi,
        n.DienTich,
        n.GiaThue,
        n.TienCoc,
        n.MoTa,
        n.TienNghi,
        n.MaChuTro,
        hd.MaHopDong,
        hd.MaNguoiDaiDien,
        nd.HoTen,
        nd.SoDienThoai,
        n.TrangThai
      LIMIT 1
    `,
    [maNhaTro, maChuTro]
  );

  const room = rows[0];
  if (!room) {
    throw new ApiError(404, "ROOM_NOT_FOUND", "Không tìm thấy phòng");
  }

  const [occupantRows] = await pool.query<OccupantRow[]>(
    `
      SELECT
        nt.MaNguoiThue,
        nt.HoTen,
        nt.SoDienThoai,
        hdnt.VaiTro
      FROM HOPDONG hd
      JOIN HOPDONG_NGUOITHUE hdnt
        ON hd.MaHopDong = hdnt.MaHopDong
      JOIN NGUOITHUE nt
        ON hdnt.MaNguoiThue = nt.MaNguoiThue
      WHERE hd.MaNhaTro = ?
        AND hd.TrangThai = 'DANG_HIEU_LUC'
        AND hdnt.TrangThai = 'DANG_O'
      ORDER BY hdnt.VaiTro DESC, nt.HoTen ASC
    `,
    [maNhaTro]
  );

  const [historyRows] = await pool.query<ContractHistoryRow[]>(
    `
      SELECT
        hd.MaHopDong,
        nd.HoTen AS NguoiDaiDien,
        COUNT(hdnt.MaNguoiThue) AS SoNguoi,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TrangThai
      FROM HOPDONG hd
      LEFT JOIN NGUOITHUE nd
        ON hd.MaNguoiDaiDien = nd.MaNguoiThue
      LEFT JOIN HOPDONG_NGUOITHUE hdnt
        ON hd.MaHopDong = hdnt.MaHopDong
      WHERE hd.MaNhaTro = ?
      GROUP BY
        hd.MaHopDong,
        nd.HoTen,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.TrangThai
      ORDER BY hd.NgayBatDau DESC
    `,
    [maNhaTro]
  );

  const [revenueTotalRows] = await pool.query<RevenueTotalRow[]>(
    `
      SELECT
        COALESCE(SUM(hd.TongTien), 0) AS TongDoanhThu,
        COALESCE(
          SUM(
            CASE
              WHEN hd.NgayLap >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
              THEN hd.TongTien
              ELSE 0
            END
          ),
          0
        ) AS TongDoanhThu12Thang
      FROM HOADON hd
      JOIN HOPDONG h
        ON hd.MaHopDong = h.MaHopDong
      WHERE h.MaNhaTro = ?
    `,
    [maNhaTro]
  );

  const [revenueMonthlyRows] = await pool.query<RevenueMonthlyRow[]>(
    `
      SELECT
        hd.Thang,
        hd.Nam,
        SUM(hd.TongTien) AS TongTien
      FROM HOADON hd
      JOIN HOPDONG h
        ON hd.MaHopDong = h.MaHopDong
      WHERE h.MaNhaTro = ?
      GROUP BY hd.Nam, hd.Thang
      ORDER BY hd.Nam DESC, hd.Thang DESC
      LIMIT 12
    `,
    [maNhaTro]
  );

  return {
    item: toRoomDto(room),
    nguoiDangO: occupantRows.map((row) => ({
      maNguoiThue: row.MaNguoiThue,
      hoTen: row.HoTen,
      soDienThoai: row.SoDienThoai,
      vaiTro: row.VaiTro === "DAI_DIEN" ? "Đại diện" : "Ở cùng",
    })),
    lichSuHopDong: historyRows.map((row) => ({
      maHopDong: row.MaHopDong,
      nguoiDaiDien: row.NguoiDaiDien,
      soNguoi: Number(row.SoNguoi ?? 0),
      ngayBatDau: row.NgayBatDau,
      ngayKetThuc: row.NgayKetThuc,
      trangThai: mapContractStatus(row.TrangThai),
    })),
    doanhThu: {
      tongTatCa: Number(revenueTotalRows[0]?.TongDoanhThu ?? 0),
      tong12Thang: Number(revenueTotalRows[0]?.TongDoanhThu12Thang ?? 0),
      theoThang: revenueMonthlyRows.map((row) => ({
        thang: row.Thang,
        nam: row.Nam,
        tongTien: Number(row.TongTien ?? 0),
      })),
    },
  };
}

type MaxRoomSuffixRow = RowDataPacket & {
  maxSuffix: number | null;
};

export async function generateNextRoomCode(maChuTro: string) {
  const [rows] = await pool.query<MaxRoomSuffixRow[]>(
    `
      SELECT MAX(CAST(SUBSTRING(MaNhaTro, 3) AS UNSIGNED)) AS maxSuffix
      FROM NHATRO
      WHERE MaChuTro = ?
        AND MaNhaTro REGEXP '^NT[0-9]{3}$'
    `,
    [maChuTro]
  );

  const maxSuffix = Number(rows[0]?.maxSuffix ?? 0);
  const nextSuffix = maxSuffix + 1;
  return `NT${String(nextSuffix).padStart(3, "0")}`;
}

export async function createRoom(input: CreateRoomInput, maChuTro: string) {
  let maNhaTro = input.maNhaTro;
  const generatedCode = !maNhaTro;

  if (!maNhaTro) {
    maNhaTro = await generateNextRoomCode(maChuTro);
  }

  const [existingRows] = await pool.query<ExistingRoomStateRow[]>(
    `
      SELECT MaNhaTro, MaChuTro, IsDeleted
      FROM NHATRO
      WHERE MaNhaTro = ?
      LIMIT 1
    `,
    [maNhaTro]
  );

  const existing = existingRows[0];
  if (existing) {
    if (existing.MaChuTro !== maChuTro || existing.IsDeleted === 0) {
      throw new ApiError(409, "ROOM_DUPLICATE", "Mã phòng đã tồn tại");
    }

    await pool.execute<ResultSetHeader>(
      `
        UPDATE NHATRO
        SET TenNhaTro = ?,
            DiaChi = ?,
            DienTich = ?,
            GiaThue = ?,
            TienCoc = ?,
            MoTa = ?,
            TienNghi = ?,
            TrangThai = ?,
            IsDeleted = 0,
            DeletedAt = NULL
        WHERE MaNhaTro = ?
          AND MaChuTro = ?
          AND IsDeleted = 1
      `,
      [
        input.tenNhaTro,
        input.diaChi,
        input.dienTich,
        input.giaThue,
        input.tienCoc,
        input.moTa ?? null,
        input.tienNghi ?? null,
        input.trangThai ?? "TRONG",
        maNhaTro,
        maChuTro,
      ]
    );

    const restored = await getRoom(maNhaTro, maChuTro);
    return restored.item;
  }

  const insertRoom = async (roomCode: string) => {
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO NHATRO (MaNhaTro, TenNhaTro, DiaChi, DienTich, GiaThue, TienCoc, MoTa, TienNghi, TrangThai, MaChuTro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        roomCode,
        input.tenNhaTro,
        input.diaChi,
        input.dienTich,
        input.giaThue,
        input.tienCoc,
        input.moTa ?? null,
        input.tienNghi ?? null,
        input.trangThai ?? "TRONG",
        maChuTro,
      ]
    );
  };

  try {
    await insertRoom(maNhaTro);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      if (generatedCode) {
        maNhaTro = await generateNextRoomCode(maChuTro);
        try {
          await insertRoom(maNhaTro);
        } catch (err2: any) {
          if (err2?.code === "ER_DUP_ENTRY") {
            throw new ApiError(409, "ROOM_DUPLICATE", "Mã phòng đã tồn tại");
          }
          throw err2;
        }
      } else {
        throw new ApiError(409, "ROOM_DUPLICATE", "Mã phòng đã tồn tại");
      }
    } else {
      throw err;
    }
  }

  const result = await getRoom(maNhaTro, maChuTro);
  return result.item;
}

export async function updateRoom(maNhaTro: string, input: UpdateRoomInput, maChuTro: string) {
  await assertRoomExists(maNhaTro, maChuTro);

  if (Object.prototype.hasOwnProperty.call(input, "trangThai")) {
    const activeContractCount = await getActiveContractCount(maNhaTro);
    if (activeContractCount > 0) {
      throw new ApiError(
        409,
        "ROOM_STATUS_LOCKED_BY_ACTIVE_CONTRACT",
        "Không thể cập nhật trạng thái khi phòng đang có hợp đồng hiệu lực"
      );
    }
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const fieldMap: Array<[keyof UpdateRoomInput, string]> = [
    ["tenNhaTro", "TenNhaTro"],
    ["diaChi", "DiaChi"],
    ["dienTich", "DienTich"],
    ["giaThue", "GiaThue"],
    ["tienCoc", "TienCoc"],
    ["moTa", "MoTa"],
    ["tienNghi", "TienNghi"],
    ["trangThai", "TrangThai"],
  ];

  for (const [inputKey, dbKey] of fieldMap) {
    if (Object.prototype.hasOwnProperty.call(input, inputKey)) {
      fields.push(`${dbKey} = ?`);
      values.push((input as Record<string, unknown>)[inputKey] as string | number | null);
    }
  }

  if (fields.length === 0) {
    throw new ApiError(400, "NO_UPDATABLE_FIELDS", "Không có trường nào để cập nhật");
  }

  await pool.execute<ResultSetHeader>(
    `
      UPDATE NHATRO
      SET ${fields.join(", ")}
      WHERE MaNhaTro = ? AND MaChuTro = ?
    `,
    [...values, maNhaTro, maChuTro]
  );

  const result = await getRoom(maNhaTro, maChuTro);
  return result.item;
}

export async function deleteRoom(maNhaTro: string, maChuTro: string) {
  await assertRoomExists(maNhaTro, maChuTro);

  const [contractRows] = await pool.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOPDONG
      WHERE MaNhaTro = ?
    `,
    [maNhaTro]
  );

  if (Number(contractRows[0]?.total ?? 0) > 0) {
    throw new ApiError(
      409,
      "ROOM_DELETE_BLOCKED_BY_CONTRACT",
      "Không thể xóa phòng vì đã phát sinh hợp đồng"
    );
  }

  const [invoiceRows] = await pool.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM HOADON hd
      JOIN HOPDONG h
        ON hd.MaHopDong = h.MaHopDong
      WHERE h.MaNhaTro = ?
    `,
    [maNhaTro]
  );

  if (Number(invoiceRows[0]?.total ?? 0) > 0) {
    throw new ApiError(
      409,
      "ROOM_DELETE_BLOCKED_BY_INVOICE",
      "Không thể xóa phòng vì đã phát sinh hóa đơn"
    );
  }

  await pool.execute<ResultSetHeader>(
    `
      UPDATE NHATRO
      SET IsDeleted = 1,
          DeletedAt = NOW()
      WHERE MaNhaTro = ?
        AND MaChuTro = ?
        AND IsDeleted = 0
    `,
    [maNhaTro, maChuTro]
  );
}
