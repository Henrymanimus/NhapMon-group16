import { z } from "zod";

export const updateProfileBodySchema = z.object({
  hoTen: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ").nullable().optional(),
  soDienThoai: z
    .string()
    .regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
    .nullable()
    .optional(),
  diaChi: z.string().nullable().optional(),
});

export const changePasswordBodySchema = z.object({
  matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  matKhauMoi: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

export const loginBodySchema = z.object({
  tenDangNhap: z.string().optional(),
  matKhau: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
}).superRefine((value, ctx) => {
  const loginRaw = value.tenDangNhap ?? value.username;
  const passwordRaw = value.matKhau ?? value.password;
  const login = loginRaw?.trim();
  const password = passwordRaw?.trim();

  if (!login) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tenDangNhap"],
      message: "Vui lòng nhập tên đăng nhập",
    });
  }

  if (!password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["matKhau"],
      message: "Vui lòng nhập mật khẩu",
    });
  }
});
