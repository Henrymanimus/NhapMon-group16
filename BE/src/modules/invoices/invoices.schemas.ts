import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const invoiceIdParamSchema = z.object({
  maHoaDon: z.string().min(1),
});

export const createInvoiceBodySchema = z
  .object({
    maHopDong: z.string().min(1, "Mã hợp đồng là bắt buộc"),
    thang: z.number().int().min(1).max(12),
    nam: z.number().int().min(2000).max(2100),
    ngayLap: dateSchema,
    hanThanhToan: dateSchema.optional().nullable(),
    tienThue: z.number().min(0, "Tiền thuê không được âm"),
    chiSoDienCu: z.number().int().min(0),
    chiSoDienMoi: z.number().int().min(0),
    tienDien: z.number().min(0),
    chiSoNuocCu: z.number().int().min(0),
    chiSoNuocMoi: z.number().int().min(0),
    tienNuoc: z.number().min(0),
    ghiChu: z.string().optional().nullable(),
  })
  .refine((d) => d.chiSoDienMoi >= d.chiSoDienCu, {
    message: "Chỉ số điện mới phải >= chỉ số điện cũ",
    path: ["chiSoDienMoi"],
  })
  .refine((d) => d.chiSoNuocMoi >= d.chiSoNuocCu, {
    message: "Chỉ số nước mới phải >= chỉ số nước cũ",
    path: ["chiSoNuocMoi"],
  });

export const updateInvoiceBodySchema = z
  .object({
    thang: z.number().int().min(1).max(12).optional(),
    nam: z.number().int().min(2000).max(2100).optional(),
    ngayLap: dateSchema.optional(),
    hanThanhToan: dateSchema.optional().nullable(),
    tienThue: z.number().min(0).optional(),
    chiSoDienCu: z.number().int().min(0).optional(),
    chiSoDienMoi: z.number().int().min(0).optional(),
    tienDien: z.number().min(0).optional(),
    chiSoNuocCu: z.number().int().min(0).optional(),
    chiSoNuocMoi: z.number().int().min(0).optional(),
    tienNuoc: z.number().min(0).optional(),
    ghiChu: z.string().optional().nullable(),
  })
  .refine(
    (d) => {
      if (d.chiSoDienMoi !== undefined && d.chiSoDienCu !== undefined) {
        return d.chiSoDienMoi >= d.chiSoDienCu;
      }
      return true;
    },
    { message: "Chỉ số điện mới phải >= chỉ số điện cũ", path: ["chiSoDienMoi"] }
  )
  .refine(
    (d) => {
      if (d.chiSoNuocMoi !== undefined && d.chiSoNuocCu !== undefined) {
        return d.chiSoNuocMoi >= d.chiSoNuocCu;
      }
      return true;
    },
    { message: "Chỉ số nước mới phải >= chỉ số nước cũ", path: ["chiSoNuocMoi"] }
  );

export const invoiceSearchQuerySchema = z.object({
  keyword: z.string().optional(),
  thang: z.coerce.number().int().min(1).max(12).optional(),
  nam: z.coerce.number().int().min(2000).max(2100).optional(),
  trangThai: z.enum(["DA_THANH_TOAN", "CHUA_THANH_TOAN", "QUA_HAN"]).optional(),
});
