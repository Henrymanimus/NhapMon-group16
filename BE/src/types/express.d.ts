declare namespace Express {
  interface Request {
    authUser?: {
      maChuTro: string;
      tenDangNhap: string;
    };
  }
}
