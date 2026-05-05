import { z } from "zod";

export const roomIdParamSchema = z.object({
  maNhaTro: z.string().min(1, "maNhaTro is required"),
});

const roomBaseSchema = {
  maNhaTro: z.string().min(1, "maNhaTro is required").max(20, "maNhaTro max 20 chars"),
  tenNhaTro: z.string().min(1, "tenNhaTro is required").max(150),
  diaChi: z.string().min(1, "diaChi is required").max(255),
  dienTich: z.coerce.number().positive("dienTich must be > 0"),
  giaThue: z.coerce.number().min(0, "giaThue must be >= 0"),
  tienCoc: z.coerce.number().min(0, "tienCoc must be >= 0"),
  moTa: z.string().max(2000).nullable().optional(),
  tienNghi: z.string().max(2000).nullable().optional(),
  trangThai: z.enum(["TRONG", "BAO_TRI"]).optional(),
};

export const createRoomBodySchema = z.object(roomBaseSchema);

export const updateRoomBodySchema = z
  .object({
    tenNhaTro: roomBaseSchema.tenNhaTro.optional(),
    diaChi: roomBaseSchema.diaChi.optional(),
    dienTich: roomBaseSchema.dienTich.optional(),
    giaThue: roomBaseSchema.giaThue.optional(),
    tienCoc: roomBaseSchema.tienCoc.optional(),
    moTa: roomBaseSchema.moTa,
    tienNghi: roomBaseSchema.tienNghi,
    trangThai: roomBaseSchema.trangThai,
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");
