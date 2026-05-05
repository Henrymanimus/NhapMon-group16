import { z } from "zod";

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
