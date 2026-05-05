import { RequestHandler } from "express";
import { login, getCurrentUser } from "./auth.service";
import { ApiError } from "../../errors/api-error";

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as {
      tenDangNhap?: string;
      matKhau?: string;
      username?: string;
      password?: string;
    };
    const tenDangNhap = payload.tenDangNhap ?? payload.username ?? "";
    const matKhau = payload.matKhau ?? payload.password ?? "";
    const result = await login(tenDangNhap, matKhau);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.authUser) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing authentication context");
    }
    const user = await getCurrentUser(req.authUser.maChuTro);
    res.json({ chuTro: user });
  } catch (err) {
    next(err);
  }
};
