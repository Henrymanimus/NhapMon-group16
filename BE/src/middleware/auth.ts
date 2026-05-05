import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../errors/api-error";

type JwtPayload = {
  maChuTro: string;
  tenDangNhap: string;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new ApiError(401, "UNAUTHORIZED", "Missing or invalid authorization header"));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.authUser = {
      maChuTro: decoded.maChuTro,
      tenDangNhap: decoded.tenDangNhap,
    };
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
};
