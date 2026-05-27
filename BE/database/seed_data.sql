-- =============================================================
-- seed_data.sql
-- Du lieu mau cho he thong Quan ly nha tro
-- Chay sau khi da chay final_schema.sql
-- MySQL >= 8.0
-- =============================================================

USE rental_house_management;
SET NAMES utf8mb4;

START TRANSACTION;

-- =============================================================
-- 1. Phong tro mau
-- =============================================================
INSERT INTO NHATRO
  (MaNhaTro, TenNhaTro, DiaChi, DienTich, GiaThue, TienCoc, MoTa, TienNghi, TrangThai, MaChuTro)
VALUES
  ('NT001', 'Vanila Studio 201', '277 Vo Nguyen Giap, phuong Thao Dien, TP Thu Duc, TP.HCM', 28.00, 10000000, 4000000, 'Phong studio sang, cua so lon, phu hop 1-2 nguoi.', 'May lanh, Tu lanh, Giuong, Nem, Ban hoc, May nuoc nong, Wifi', 'TRONG', 'CT001'),
  ('NT002', 'Sunrise Corner 302', '18 Nguyen Huu Canh, phuong 22, quan Binh Thanh, TP.HCM', 32.50, 8500000, 3500000, 'Phong goc thoang, co ban cong nho, gan khu van phong.', 'May lanh, Tu quan ao, Bep dien, May giat chung, Wifi', 'TRONG', 'CT001'),
  ('NT003', 'Sakura Mini 105', '45 Le Van Sy, phuong 13, quan 3, TP.HCM', 22.00, 6200000, 2500000, 'Phong mini gon gang, khu dan cu yen tinh.', 'May lanh, Giuong, Nem, Ban lam viec, Wifi', 'TRONG', 'CT001'),
  ('NT004', 'Blue House 101', '12 Nguyen Trai, phuong Ben Thanh, quan 1, TP.HCM', 25.00, 7200000, 3000000, 'Phong trong, co the vao o ngay.', 'May lanh, Giuong, Ke bep, Wifi', 'TRONG', 'CT001'),
  ('NT005', 'Green Nest 204', '88 Phan Xich Long, phuong 2, quan Phu Nhuan, TP.HCM', 26.00, 7600000, 3000000, 'Phong dang bao tri he thong nuoc va son lai tuong.', 'May lanh, Giuong, Tu lanh mini, Wifi', 'BAO_TRI', 'CT001'),
  ('NT006', 'Riverside Loft 401', '5 Ton Duc Thang, phuong Ben Nghe, quan 1, TP.HCM', 35.00, 12000000, 5000000, 'Loft rong, view song, phu hop nguoi di lam.', 'May lanh, Tu lanh, Sofa, Bep dien, May giat rieng, Wifi', 'TRONG', 'CT001'),
  ('NT007', 'Old Town Mini 203', '64 Nguyen Dinh Chieu, phuong 6, quan 3, TP.HCM', 20.00, 5800000, 2000000, 'Phong nho da co lich su thue, hien dang trong.', 'May lanh, Giuong, Ban hoc, Wifi', 'TRONG', 'CT001'),
  ('NT008', 'Garden View 305', '22 Hoa Lan, phuong 2, quan Phu Nhuan, TP.HCM', 30.00, 9000000, 4000000, 'Phong nhieu anh sang, nhin ra san vuon noi bo.', 'May lanh, Tu lanh, Giuong, Ban an, Bep dien, Wifi', 'TRONG', 'CT001')
ON DUPLICATE KEY UPDATE
  TenNhaTro = VALUES(TenNhaTro),
  DiaChi = VALUES(DiaChi),
  DienTich = VALUES(DienTich),
  GiaThue = VALUES(GiaThue),
  TienCoc = VALUES(TienCoc),
  MoTa = VALUES(MoTa),
  TienNghi = VALUES(TienNghi),
  TrangThai = VALUES(TrangThai),
  MaChuTro = VALUES(MaChuTro),
  IsDeleted = 0,
  DeletedAt = NULL;

-- =============================================================
-- 2. Nguoi thue mau
-- =============================================================
INSERT INTO NGUOITHUE
  (MaNguoiThue, HoTen, SoDienThoai, CCCD, Email, NgaySinh, DiaChi, GhiChu)
VALUES
  ('NGT001', 'Nguyen Van An', '0901001001', '079201000001', 'an.nguyen@example.com', '1998-03-12', 'Quan 7, TP.HCM', 'Nhan vien van phong, thanh toan dung han.'),
  ('NGT002', 'Le Minh Chau', '0901001002', '079201000002', 'chau.le@example.com', '1999-07-22', 'Thu Duc, TP.HCM', 'O cung voi Nguyen Van An.'),
  ('NGT003', 'Tran Quoc Bao', '0901001003', '079201000003', 'bao.tran@example.com', '1996-11-05', 'Quan Binh Thanh, TP.HCM', 'Khach thue dai han.'),
  ('NGT004', 'Pham Thu Ha', '0901001004', '079201000004', 'ha.pham@example.com', '2000-02-18', 'Quan Go Vap, TP.HCM', 'O cung voi Tran Quoc Bao.'),
  ('NGT005', 'Vo Minh Khang', '0901001005', '079201000005', 'khang.vo@example.com', '1997-09-30', 'Quan 10, TP.HCM', 'Da ket thuc hop dong cu.'),
  ('NGT006', 'Do Thi Mai', '0901001006', '079201000006', 'mai.do@example.com', '1995-01-08', 'Quan 3, TP.HCM', 'Nguoi dai dien hop dong phong Sakura.'),
  ('NGT007', 'Hoang Gia Huy', '0901001007', '079201000007', 'huy.hoang@example.com', '2001-04-14', 'Quan Tan Binh, TP.HCM', 'O cung voi Do Thi Mai.'),
  ('NGT008', 'Dang Thuy Linh', '0901001008', '079201000008', 'linh.dang@example.com', '1998-12-02', 'Quan Phu Nhuan, TP.HCM', 'O cung voi Do Thi Mai.'),
  ('NGT009', 'Bui Nam Phong', '0901001009', '079201000009', 'phong.bui@example.com', '1994-05-27', 'Quan 1, TP.HCM', 'Da roi phong Riverside.'),
  ('NGT010', 'Ly Phuong Anh', '0901001010', '079201000010', 'anh.ly@example.com', '1999-10-19', 'Quan Phu Nhuan, TP.HCM', 'Hop dong sap het han.'),
  ('NGT011', 'Nguyen Quang Minh', '0901001011', '079201000011', 'minh.nguyen@example.com', '2002-08-11', 'Quan 5, TP.HCM', 'Khach tiem nang, chua co hop dong.'),
  ('NGT012', 'Tran My Duyen', '0901001012', '079201000012', 'duyen.tran@example.com', '1997-06-06', 'Quan 4, TP.HCM', 'Khach tiem nang, chua co hop dong.')
ON DUPLICATE KEY UPDATE
  HoTen = VALUES(HoTen),
  SoDienThoai = VALUES(SoDienThoai),
  Email = VALUES(Email),
  NgaySinh = VALUES(NgaySinh),
  DiaChi = VALUES(DiaChi),
  GhiChu = VALUES(GhiChu);

-- =============================================================
-- 3. Hop dong mau
--    Trigger se tu dong chuyen phong active sang DANG_THUE
-- =============================================================
INSERT INTO HOPDONG
  (MaHopDong, MaNguoiDaiDien, MaNhaTro, NgayBatDau, NgayKetThuc, TienThue, TienCoc, GhiChu, TrangThai, NgayTao, DaKy, NgayKy)
VALUES
  ('HD001', 'NGT001', 'NT001', '2026-05-01', '2027-04-30', 10000000, 4000000, 'Hop dong studio Vanila, thanh toan truoc ngay 05 hang thang.', 'DANG_HIEU_LUC', '2026-04-25 09:15:00', 1, '2026-04-25 10:00:00'),
  ('HD002', 'NGT003', 'NT002', '2026-04-15', '2026-10-14', 8500000, 3500000, 'Hop dong dang hieu luc, chua xac nhan ky de demo chinh sua/xoa.', 'DANG_HIEU_LUC', '2026-04-12 14:30:00', 0, NULL),
  ('HD003', 'NGT005', 'NT007', '2025-01-01', '2025-12-31', 5600000, 2000000, 'Hop dong cu da ket thuc, giu lai de xem lich su phong.', 'DA_KET_THUC', '2024-12-20 08:45:00', 1, '2024-12-20 09:20:00'),
  ('HD004', 'NGT006', 'NT003', '2026-03-01', '2026-08-31', 6200000, 2500000, 'Phong mini Sakura co 3 nguoi thue.', 'DANG_HIEU_LUC', '2026-02-24 16:10:00', 1, '2026-02-25 09:00:00'),
  ('HD005', 'NGT009', 'NT006', '2025-06-01', '2026-02-28', 11500000, 5000000, 'Hop dong Riverside da ket thuc, phong hien dang trong.', 'DA_KET_THUC', '2025-05-25 10:30:00', 1, '2025-05-25 11:00:00'),
  ('HD006', 'NGT010', 'NT008', '2026-05-20', '2026-06-20', 9000000, 4000000, 'Hop dong sap het han trong 30 ngay de demo canh bao.', 'DANG_HIEU_LUC', '2026-05-18 15:00:00', 0, NULL)
ON DUPLICATE KEY UPDATE
  MaNguoiDaiDien = VALUES(MaNguoiDaiDien),
  MaNhaTro = VALUES(MaNhaTro),
  NgayBatDau = VALUES(NgayBatDau),
  NgayKetThuc = VALUES(NgayKetThuc),
  TienThue = VALUES(TienThue),
  TienCoc = VALUES(TienCoc),
  GhiChu = VALUES(GhiChu),
  TrangThai = VALUES(TrangThai),
  NgayTao = VALUES(NgayTao),
  DaKy = VALUES(DaKy),
  NgayKy = VALUES(NgayKy);

-- Thanh vien trong hop dong.
-- Nguoi dai dien duoc insert lai bang ON DUPLICATE de seed co the chay lai an toan.
INSERT INTO HOPDONG_NGUOITHUE
  (MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai)
VALUES
  ('HD001', 'NGT001', 'DAI_DIEN', '2026-05-01', NULL, 'DANG_O'),
  ('HD001', 'NGT002', 'O_CUNG', '2026-05-01', NULL, 'DANG_O'),
  ('HD002', 'NGT003', 'DAI_DIEN', '2026-04-15', NULL, 'DANG_O'),
  ('HD002', 'NGT004', 'O_CUNG', '2026-04-15', NULL, 'DANG_O'),
  ('HD003', 'NGT005', 'DAI_DIEN', '2025-01-01', '2025-12-31', 'DA_ROI'),
  ('HD004', 'NGT006', 'DAI_DIEN', '2026-03-01', NULL, 'DANG_O'),
  ('HD004', 'NGT007', 'O_CUNG', '2026-03-01', NULL, 'DANG_O'),
  ('HD004', 'NGT008', 'O_CUNG', '2026-03-15', NULL, 'DANG_O'),
  ('HD005', 'NGT009', 'DAI_DIEN', '2025-06-01', '2026-02-28', 'DA_ROI'),
  ('HD006', 'NGT010', 'DAI_DIEN', '2026-05-20', NULL, 'DANG_O')
ON DUPLICATE KEY UPDATE
  VaiTro = VALUES(VaiTro),
  NgayThamGia = VALUES(NgayThamGia),
  NgayRoiDi = VALUES(NgayRoiDi),
  TrangThai = VALUES(TrangThai);

-- =============================================================
-- 4. Hoa don mau
--    Co du hoa don da thanh toan, chua thanh toan va qua han
-- =============================================================
INSERT INTO HOADON
  (MaHoaDon, MaHopDong, Thang, Nam, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, TienDien, TienNuoc, TienThue, TongTien, TrangThai, NgayLap, HanThanhToan, GhiChu)
VALUES
  ('HDON001', 'HD001', 5, 2026, 1200, 1325, 310, 322, 500000, 180000, 10000000, 10680000, 'DA_THANH_TOAN', '2026-05-01', '2026-05-05', 'Da thanh toan bang chuyen khoan.'),
  ('HDON002', 'HD001', 6, 2026, 1325, 1458, 322, 336, 532000, 210000, 10000000, 10742000, 'CHUA_THANH_TOAN', '2026-06-01', '2026-06-05', 'Hoa don thang 06 cho Vanila Studio.'),
  ('HDON003', 'HD002', 4, 2026, 850, 940, 220, 230, 360000, 150000, 8500000, 9010000, 'DA_THANH_TOAN', '2026-04-15', '2026-04-20', 'Tinh tu ngay bat dau hop dong.'),
  ('HDON004', 'HD002', 5, 2026, 940, 1068, 230, 244, 512000, 210000, 8500000, 9222000, 'CHUA_THANH_TOAN', '2026-05-15', '2026-05-20', 'Qua han thanh toan de demo cong no.'),
  ('HDON005', 'HD004', 3, 2026, 430, 515, 118, 128, 340000, 150000, 6200000, 6690000, 'DA_THANH_TOAN', '2026-03-01', '2026-03-05', 'Hoa don dau tien cua phong Sakura.'),
  ('HDON006', 'HD004', 4, 2026, 515, 632, 128, 143, 468000, 225000, 6200000, 6893000, 'DA_THANH_TOAN', '2026-04-01', '2026-04-05', 'Da thanh toan tien mat.'),
  ('HDON007', 'HD004', 5, 2026, 632, 760, 143, 158, 512000, 225000, 6200000, 6937000, 'CHUA_THANH_TOAN', '2026-05-01', '2026-05-05', 'Chua thanh toan.'),
  ('HDON008', 'HD006', 5, 2026, 100, 158, 40, 47, 232000, 105000, 9000000, 9337000, 'CHUA_THANH_TOAN', '2026-05-20', '2026-05-25', 'Hop dong sap het han, hoa don chua thanh toan.'),
  ('HDON009', 'HD003', 12, 2025, 700, 790, 180, 191, 360000, 165000, 5600000, 6125000, 'DA_THANH_TOAN', '2025-12-01', '2025-12-05', 'Hoa don cu cua hop dong da ket thuc.')
ON DUPLICATE KEY UPDATE
  ChiSoDienCu = VALUES(ChiSoDienCu),
  ChiSoDienMoi = VALUES(ChiSoDienMoi),
  ChiSoNuocCu = VALUES(ChiSoNuocCu),
  ChiSoNuocMoi = VALUES(ChiSoNuocMoi),
  TienDien = VALUES(TienDien),
  TienNuoc = VALUES(TienNuoc),
  TienThue = VALUES(TienThue),
  TongTien = VALUES(TongTien),
  TrangThai = VALUES(TrangThai),
  NgayLap = VALUES(NgayLap),
  HanThanhToan = VALUES(HanThanhToan),
  GhiChu = VALUES(GhiChu);

COMMIT;

-- =============================================================
-- Tai khoan dang nhap sau khi seed
-- Username: chutro001
-- Password: 123456
-- =============================================================
