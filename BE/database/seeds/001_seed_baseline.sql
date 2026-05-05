-- 001_seed_baseline.sql
-- Inserts deterministic baseline data for local development.

USE rental_house_management;

INSERT INTO CHUTRO (MaChuTro, HoTen, SoDienThoai, Email, TenDangNhap, MatKhau, DiaChi)
VALUES
  ('CT001', 'Nguyen Van Chu Tro', '0900000001', 'chutro1@example.com', 'chutro001', '123456', 'Ha Noi')
ON DUPLICATE KEY UPDATE HoTen = VALUES(HoTen);

INSERT INTO NHATRO (
  MaNhaTro, TenNhaTro, DiaChi, DienTich, GiaThue, TienCoc, MoTa, TienNghi, TrangThai, MaChuTro
)
VALUES
  ('NT001', 'Phong 101', 'So 1, Quan 1', 22.00, 3500000.00, 3500000.00, 'Phong co gac', 'May lanh, nong lanh', 'TRONG', 'CT001'),
  ('NT002', 'Phong 102', 'So 1, Quan 1', 18.00, 3000000.00, 3000000.00, 'Phong thuong', 'Quat, nong lanh', 'TRONG', 'CT001'),
  ('NT003', 'Phong 201', 'So 2, Quan 2', 25.00, 4200000.00, 4200000.00, 'Phong rong', 'May lanh, bep mini', 'TRONG', 'CT001')
ON DUPLICATE KEY UPDATE TenNhaTro = VALUES(TenNhaTro);

INSERT INTO NGUOITHUE (
  MaNguoiThue, HoTen, SoDienThoai, CCCD, Email, NgaySinh, DiaChi, GhiChu
)
VALUES
  ('NTEN001', 'Tran Van A', '0911111111', '012345678901', 'a@example.com', '2002-03-10', 'Ha Noi', 'Nguoi dai dien HD001'),
  ('NTEN002', 'Le Thi B', '0922222222', '012345678902', 'b@example.com', '2003-05-12', 'Ha Noi', 'Nguoi o cung HD001'),
  ('NTEN003', 'Pham Van C', '0933333333', '012345678903', 'c@example.com', '2001-08-20', 'Hai Phong', 'Nguoi dai dien HD002')
ON DUPLICATE KEY UPDATE HoTen = VALUES(HoTen);

INSERT INTO HOPDONG (
  MaHopDong, MaNguoiDaiDien, MaNhaTro, NgayBatDau, NgayKetThuc, TienThue, TienCoc, GhiChu, TrangThai
)
VALUES
  ('HD001', 'NTEN001', 'NT001', '2026-03-01', NULL, 3500000.00, 3500000.00, 'Hop dong dang hieu luc', 'DANG_HIEU_LUC'),
  ('HD002', 'NTEN003', 'NT002', '2026-01-01', '2026-03-31', 3000000.00, 3000000.00, 'Hop dong da ket thuc', 'DA_KET_THUC')
ON DUPLICATE KEY UPDATE GhiChu = VALUES(GhiChu);

INSERT INTO HOPDONG_NGUOITHUE (
  MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai
)
VALUES
  ('HD001', 'NTEN001', 'DAI_DIEN', '2026-03-01', NULL, 'DANG_O'),
  ('HD001', 'NTEN002', 'O_CUNG', '2026-03-01', NULL, 'DANG_O'),
  ('HD002', 'NTEN003', 'DAI_DIEN', '2026-01-01', '2026-03-31', 'DA_ROI')
ON DUPLICATE KEY UPDATE VaiTro = VALUES(VaiTro);

INSERT INTO HOADON (
  MaHoaDon, MaHopDong, Thang, Nam,
  ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi,
  TienDien, TienNuoc, TienThue, TongTien,
  TrangThai, NgayLap, HanThanhToan, GhiChu
)
VALUES
  (
    'INV-HD001-2026-03', 'HD001', 3, 2026,
    1000, 1080, 500, 530,
    320000.00, 180000.00, 3500000.00, 4000000.00,
    'DA_THANH_TOAN', '2026-03-31', '2026-04-10', 'Da thanh toan dung han'
  ),
  (
    'INV-HD001-2026-04', 'HD001', 4, 2026,
    1080, 1160, 530, 565,
    320000.00, 210000.00, 3500000.00, 4030000.00,
    'CHUA_THANH_TOAN', '2026-04-30', '2026-05-10', 'Con no 1 ky'
  )
ON DUPLICATE KEY UPDATE TongTien = VALUES(TongTien);
