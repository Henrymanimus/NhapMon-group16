import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { pool } from "../../db/pool";
import { env } from "../../config/env";
import { ApiError } from "../../errors/api-error";
import { sendPasswordResetOtpEmail } from "./mail.service";

type ChuTroRow = RowDataPacket & {
  MaChuTro: string;
  TenDangNhap: string;
  MatKhau: string;
  HoTen: string;
  SoDienThoai: string | null;
  Email: string | null;
  DiaChi: string | null;
};

type ChuTroIdRow = RowDataPacket & {
  MaChuTro: string;
};

export type RegisterInput = {
  hoTen: string;
  email: string;
  soDienThoai: string;
  tenDangNhap: string;
  matKhau: string;
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

type PasswordResetOtp = {
  otp: string;
  expiresAt: number;
  maChuTro: string;
  email: string;
  tenDangNhap: string;
};

const passwordResetStore = new Map<string, PasswordResetOtp>();
const PASSWORD_RESET_TTL = 1000 * 60 * 10;
const PASSWORD_RESET_TTL_MINUTES = 10;

function buildResetKey(identifier: string) {
  return identifier.trim().toLowerCase();
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }

  const visibleLocal = local.length <= 2 ? local[0] + "*" : `${local[0]}${"*".repeat(Math.max(1, local.length - 2))}${local.slice(-1)}`;
  return `${visibleLocal}@${domain}`;
}

async function findUserByIdentifier(identifier: string): Promise<ChuTroRow | null> {
  const [rows] = await pool.query<ChuTroRow[]>(
    `
      SELECT MaChuTro, TenDangNhap, MatKhau, HoTen, SoDienThoai, Email, DiaChi
      FROM CHUTRO
      WHERE TenDangNhap = ? OR Email = ?
      LIMIT 1
    `,
    [identifier, identifier]
  );
  return rows[0] ?? null;
}

async function generateOwnerId(): Promise<string> {
  const [rows] = await pool.query<ChuTroIdRow[]>(
    `
      SELECT MaChuTro
      FROM CHUTRO
      WHERE MaChuTro LIKE 'CT%'
      ORDER BY CAST(SUBSTRING(MaChuTro, 3) AS UNSIGNED) DESC
      LIMIT 1
    `
  );

  const lastId = rows[0]?.MaChuTro;
  const lastNumber = lastId ? Number.parseInt(lastId.slice(2), 10) : 0;
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
  return `CT${nextNumber.toString().padStart(3, "0")}`;
}

export async function registerOwner(input: RegisterInput): Promise<{
  maChuTro: string;
  tenDangNhap: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  diaChi: null;
}> {
  const normalizedUsername = input.tenDangNhap.trim();
  const normalizedEmail = input.email.trim();
  const normalizedPhone = input.soDienThoai.trim();

  const existing = await findUserByIdentifier(normalizedUsername);
  if (existing) {
    throw new ApiError(409, "USERNAME_EXISTS", "Tên đăng nhập đã tồn tại");
  }

  const [emailRows] = await pool.query<RowDataPacket[]>(
    `SELECT MaChuTro FROM CHUTRO WHERE Email = ? LIMIT 1`,
    [normalizedEmail]
  );
  if (emailRows[0]) {
    throw new ApiError(409, "EMAIL_EXISTS", "Email đã được sử dụng");
  }

  const hashedPassword = await bcrypt.hash(input.matKhau, 10);
  const maChuTro = await generateOwnerId();

  try {
    await pool.query(
      `
        INSERT INTO CHUTRO (MaChuTro, HoTen, SoDienThoai, Email, TenDangNhap, MatKhau, DiaChi)
        VALUES (?, ?, ?, ?, ?, ?, NULL)
      `,
      [maChuTro, input.hoTen.trim(), normalizedPhone, normalizedEmail, normalizedUsername, hashedPassword]
    );
  } catch (err) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "ACCOUNT_DUPLICATE", "Tên đăng nhập hoặc mã chủ trọ đã tồn tại");
    }
    throw err;
  }

  return {
    maChuTro,
    tenDangNhap: normalizedUsername,
    hoTen: input.hoTen.trim(),
    soDienThoai: normalizedPhone,
    email: normalizedEmail,
    diaChi: null,
  };
}

export async function requestPasswordReset(identifier: string): Promise<{ email: string }> {
  const user = await findUserByIdentifier(identifier.trim());
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "Không tìm thấy tài khoản");
  }

  if (!user.Email) {
    throw new ApiError(400, "NO_EMAIL", "Tài khoản chưa cấu hình email");
  }

  const key = buildResetKey(identifier);
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = Date.now() + PASSWORD_RESET_TTL;

  passwordResetStore.set(key, {
    otp,
    expiresAt,
    maChuTro: user.MaChuTro,
    email: user.Email,
    tenDangNhap: user.TenDangNhap,
  });

  try {
    await sendPasswordResetOtpEmail({
      to: user.Email,
      otp,
      tenDangNhap: user.TenDangNhap,
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
    });
  } catch (err) {
    passwordResetStore.delete(key);
    throw err;
  }

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
  console.log(`[OTP] Mã OTP quên mật khẩu cho ${user.TenDangNhap} (${user.Email}): ${otp}`);
  }
  return { email: maskEmail(user.Email) };
}

export async function verifyPasswordResetOtp(identifier: string, otp: string): Promise<void> {
  const key = buildResetKey(identifier);
  const stored = passwordResetStore.get(key);

  if (!stored || stored.expiresAt < Date.now() || stored.otp !== otp) {
    passwordResetStore.delete(key);
    throw new ApiError(400, "INVALID_OTP", "OTP không đúng hoặc đã hết hạn");
  }
}

export async function resetPasswordWithOtp(identifier: string, otp: string, matKhauMoi: string): Promise<void> {
  const key = buildResetKey(identifier);
  const stored = passwordResetStore.get(key);

  if (!stored || stored.expiresAt < Date.now() || stored.otp !== otp) {
    passwordResetStore.delete(key);
    throw new ApiError(400, "INVALID_OTP", "OTP không đúng hoặc đã hết hạn");
  }

  const hashed = await bcrypt.hash(matKhauMoi, 10);
  await pool.query(`UPDATE CHUTRO SET MatKhau = ? WHERE MaChuTro = ?`, [hashed, stored.maChuTro]);
  passwordResetStore.delete(key);
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
