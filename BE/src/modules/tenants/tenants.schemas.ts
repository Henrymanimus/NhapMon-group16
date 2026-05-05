import { z } from "zod";

export const tenantIdParamSchema = z.object({
  maNguoiThue: z.string().min(1, "maNguoiThue is required").max(20),
});

const tenantBaseSchema = {
  hoTen: z.string().min(1, "hoTen is required").max(120),
  soDienThoai: z
    .string()
    .min(1, "soDienThoai is required")
    .max(20)
    .regex(/^[0-9]{9,12}$/, "soDienThoai must contain 9-12 digits"),
  cccd: z
    .string()
    .min(1, "cccd is required")
    .max(20)
    .regex(/^[0-9]{9,12}$/, "cccd must contain 9-12 digits"),
  email: z.string().email("email is invalid").max(120).nullable().optional(),
  ngaySinh: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ngaySinh must be YYYY-MM-DD")
    .nullable()
    .optional(),
  diaChi: z.string().max(255).nullable().optional(),
  ghiChu: z.string().max(2000).nullable().optional(),
};

export const createTenantBodySchema = z.object(tenantBaseSchema);

export const updateTenantBodySchema = z
  .object({
    hoTen: tenantBaseSchema.hoTen.optional(),
    soDienThoai: tenantBaseSchema.soDienThoai.optional(),
    cccd: tenantBaseSchema.cccd.optional(),
    email: tenantBaseSchema.email,
    ngaySinh: tenantBaseSchema.ngaySinh,
    diaChi: tenantBaseSchema.diaChi,
    ghiChu: tenantBaseSchema.ghiChu,
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");
