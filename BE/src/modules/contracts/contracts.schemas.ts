import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const contractStatusSchema = z.enum(["DANG_HIEU_LUC", "DA_KET_THUC", "DA_HUY"]);
const tenantRoleSchema = z.enum(["DAI_DIEN", "O_CUNG"]);

export const contractIdParamSchema = z.object({
  maHopDong: z.string().min(1, "maHopDong is required").max(20),
});

export const contractTenantParamSchema = z.object({
  maHopDong: z.string().min(1, "maHopDong is required").max(20),
  maNguoiThue: z.string().min(1, "maNguoiThue is required").max(20),
});

const participantSchema = z.object({
  maNguoiThue: z.string().min(1, "maNguoiThue is required").max(20),
  vaiTro: tenantRoleSchema.optional(),
  ngayThamGia: dateSchema.optional(),
});

export const createContractBodySchema = z
  .object({
    maNhaTro: z.string().min(1, "maNhaTro is required").max(20),
    maNguoiDaiDien: z.string().min(1, "maNguoiDaiDien is required").max(20),
    ngayBatDau: dateSchema,
    ngayKetThuc: dateSchema.nullable().optional(),
    tienThue: z.coerce.number().min(0, "tienThue must be >= 0"),
    tienCoc: z.coerce.number().min(0, "tienCoc must be >= 0"),
    ghiChu: z.string().max(2000).nullable().optional(),
    nguoiThue: z.array(participantSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.ngayKetThuc) {
        return data.ngayKetThuc > data.ngayBatDau;
      }
      return true;
    },
    {
      message: "ngayKetThuc must be after ngayBatDau",
      path: ["ngayKetThuc"],
    }
  );

export const updateContractBodySchema = z
  .object({
    maNhaTro: z.string().min(1).max(20).optional(),
    maNguoiDaiDien: z.string().min(1).max(20).optional(),
    ngayBatDau: dateSchema.optional(),
    ngayKetThuc: dateSchema.nullable().optional(),
    tienThue: z.coerce.number().min(0).optional(),
    tienCoc: z.coerce.number().min(0).optional(),
    ghiChu: z.string().max(2000).nullable().optional(),
    trangThai: contractStatusSchema.optional(),
    nguoiThue: z.array(participantSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.ngayBatDau && data.ngayKetThuc) {
        return data.ngayKetThuc > data.ngayBatDau;
      }
      return true;
    },
    {
      message: "ngayKetThuc must be after ngayBatDau",
      path: ["ngayKetThuc"],
    }
  )
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const terminateContractBodySchema = z.object({
  ngayKetThuc: dateSchema,
  ghiChu: z.string().max(2000).nullable().optional(),
});

export const leaveTenantBodySchema = z.object({
  ngayRoiDi: dateSchema.nullable().optional(),
});

export const contractSearchQuerySchema = z.object({
  keyword: z.string().optional(),
  status: contractStatusSchema.optional(),
  maNhaTro: z.string().optional(),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional(),
});
