import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { pool } from "../../db/pool";
import { env } from "../../config/env";
import { ApiError } from "../../errors/api-error";

type ChuTroRow = RowDataPacket & {
  MaChuTro: string;
  TenDangNhap: string;
  MatKhau: string;
  HoTen: string;
  SoDienThoai: string | null;
  Email: string | null;
  DiaChi: string | null;
};

async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  try {
    const matched = await bcrypt.compare(inputPassword, storedPassword);
    if (matched) {
      return true;
    }
  } catch {
    // Ignore and allow optional fallback below.
  }

  if (env.AUTH_ALLOW_PLAINTEXT_FALLBACK) {
    return inputPassword === storedPassword;
  }

  return false;
}

export async function login(tenDangNhap: string, matKhau: string): Promise<{
  token: string;
  chuTro: {
    maChuTro: string;
    tenDangNhap: string;
    hoTen: string;
    soDienThoai: string | null;
    email: string | null;
    diaChi: string | null;
  };
}> {
  const [rows] = await pool.query<ChuTroRow[]>(
    `
      SELECT MaChuTro, TenDangNhap, MatKhau, HoTen, SoDienThoai, Email, DiaChi
      FROM CHUTRO
      WHERE TenDangNhap = ?
      LIMIT 1
    `,
    [tenDangNhap]
  );

  const user = rows[0];
  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không chính xác");
  }

  const ok = await verifyPassword(matKhau, user.MatKhau);
  if (!ok) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không chính xác");
  }

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      maChuTro: user.MaChuTro,
      tenDangNhap: user.TenDangNhap,
    },
    env.JWT_SECRET,
    signOptions
  );

  return {
    token,
    chuTro: {
      maChuTro: user.MaChuTro,
      tenDangNhap: user.TenDangNhap,
      hoTen: user.HoTen,
      soDienThoai: user.SoDienThoai,
      email: user.Email,
      diaChi: user.DiaChi,
    },
  };
}

export async function getCurrentUser(maChuTro: string): Promise<{
  maChuTro: string;
  tenDangNhap: string;
  hoTen: string;
  soDienThoai: string | null;
  email: string | null;
  diaChi: string | null;
}> {
  const [rows] = await pool.query<ChuTroRow[]>(
    `
      SELECT MaChuTro, TenDangNhap, MatKhau, HoTen, SoDienThoai, Email, DiaChi
      FROM CHUTRO
      WHERE MaChuTro = ?
      LIMIT 1
    `,
    [maChuTro]
  );

  const user = rows[0];
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return {
    maChuTro: user.MaChuTro,
    tenDangNhap: user.TenDangNhap,
    hoTen: user.HoTen,
    soDienThoai: user.SoDienThoai,
    email: user.Email,
    diaChi: user.DiaChi,
  };
}

export async function updateProfile(
  maChuTro: string,
  data: { hoTen: string; email?: string | null; soDienThoai?: string | null; diaChi?: string | null }
): Promise<{ maChuTro: string; tenDangNhap: string; hoTen: string; soDienThoai: string | null; email: string | null; diaChi: string | null }> {
  await pool.query(
    `UPDATE CHUTRO SET HoTen = ?, Email = ?, SoDienThoai = ?, DiaChi = ? WHERE MaChuTro = ?`,
    [data.hoTen, data.email ?? null, data.soDienThoai ?? null, data.diaChi ?? null, maChuTro]
  );
  return getCurrentUser(maChuTro);
}

export async function changePassword(
  maChuTro: string,
  matKhauCu: string,
  matKhauMoi: string
): Promise<void> {
  const [rows] = await pool.query<ChuTroRow[]>(
    `SELECT MaChuTro, TenDangNhap, MatKhau, HoTen, SoDienThoai, Email, DiaChi FROM CHUTRO WHERE MaChuTro = ? LIMIT 1`,
    [maChuTro]
  );
  const user = rows[0];
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const ok = await verifyPassword(matKhauCu, user.MatKhau);
  if (!ok) {
    throw new ApiError(400, "WRONG_PASSWORD", "Mật khẩu cũ không đúng");
  }

  const hashed = await bcrypt.hash(matKhauMoi, 10);
  await pool.query(`UPDATE CHUTRO SET MatKhau = ? WHERE MaChuTro = ?`, [hashed, maChuTro]);
}
