-- 001_init_schema.sql
-- Initializes MySQL schema, core tables, and declarative constraints.

CREATE DATABASE IF NOT EXISTS rental_house_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rental_house_management;

CREATE TABLE IF NOT EXISTS CHUTRO (
  MaChuTro VARCHAR(20) PRIMARY KEY,
  HoTen VARCHAR(120) NOT NULL,
  SoDienThoai VARCHAR(20) NOT NULL,
  Email VARCHAR(120),
  TenDangNhap VARCHAR(50) NOT NULL,
  MatKhau VARCHAR(255) NOT NULL,
  DiaChi VARCHAR(255),
  CONSTRAINT uq_chutro_tendangnhap UNIQUE (TenDangNhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NHATRO (
  MaNhaTro VARCHAR(20) PRIMARY KEY,
  TenNhaTro VARCHAR(150) NOT NULL,
  DiaChi VARCHAR(255) NOT NULL,
  DienTich DECIMAL(10,2) NOT NULL,
  GiaThue DECIMAL(18,2) NOT NULL,
  TienCoc DECIMAL(18,2) NOT NULL,
  MoTa TEXT,
  TienNghi TEXT,
  TrangThai ENUM('TRONG', 'DANG_THUE', 'BAO_TRI') NOT NULL DEFAULT 'TRONG',
  MaChuTro VARCHAR(20) NOT NULL,
  CONSTRAINT fk_nhatro_chutro
    FOREIGN KEY (MaChuTro) REFERENCES CHUTRO(MaChuTro)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_nhatro_tien CHECK (GiaThue >= 0 AND TienCoc >= 0),
  CONSTRAINT ck_nhatro_dientich CHECK (DienTich > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_nhatro_machutro ON NHATRO(MaChuTro);
CREATE INDEX idx_nhatro_trangthai ON NHATRO(TrangThai);

CREATE TABLE IF NOT EXISTS NGUOITHUE (
  MaNguoiThue VARCHAR(20) PRIMARY KEY,
  HoTen VARCHAR(120) NOT NULL,
  SoDienThoai VARCHAR(20) NOT NULL,
  CCCD VARCHAR(20) NOT NULL,
  Email VARCHAR(120),
  NgaySinh DATE,
  DiaChi VARCHAR(255),
  GhiChu TEXT,
  CONSTRAINT uq_nguoithue_cccd UNIQUE (CCCD)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS HOPDONG (
  MaHopDong VARCHAR(20) PRIMARY KEY,
  MaNguoiDaiDien VARCHAR(20) NOT NULL,
  MaNhaTro VARCHAR(20) NOT NULL,
  NgayBatDau DATE NOT NULL,
  NgayKetThuc DATE,
  TienThue DECIMAL(18,2) NOT NULL,
  TienCoc DECIMAL(18,2) NOT NULL,
  GhiChu TEXT,
  TrangThai ENUM('DANG_HIEU_LUC', 'DA_KET_THUC', 'DA_HUY') NOT NULL,
  CONSTRAINT fk_hopdong_daidien
    FOREIGN KEY (MaNguoiDaiDien) REFERENCES NGUOITHUE(MaNguoiThue)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_hopdong_nhatro
    FOREIGN KEY (MaNhaTro) REFERENCES NHATRO(MaNhaTro)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_hopdong_tien CHECK (TienThue >= 0 AND TienCoc >= 0),
  CONSTRAINT ck_hopdong_ngay CHECK (NgayKetThuc IS NULL OR NgayKetThuc >= NgayBatDau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hopdong_manhatro ON HOPDONG(MaNhaTro);
CREATE INDEX idx_hopdong_daidien ON HOPDONG(MaNguoiDaiDien);
CREATE INDEX idx_hopdong_trangthai ON HOPDONG(TrangThai);

CREATE TABLE IF NOT EXISTS HOPDONG_NGUOITHUE (
  MaHopDong VARCHAR(20) NOT NULL,
  MaNguoiThue VARCHAR(20) NOT NULL,
  VaiTro ENUM('DAI_DIEN', 'O_CUNG') NOT NULL,
  NgayThamGia DATE NOT NULL,
  NgayRoiDi DATE,
  TrangThai ENUM('DANG_O', 'DA_ROI') NOT NULL DEFAULT 'DANG_O',
  PRIMARY KEY (MaHopDong, MaNguoiThue),
  CONSTRAINT fk_hdnt_hopdong
    FOREIGN KEY (MaHopDong) REFERENCES HOPDONG(MaHopDong)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_hdnt_nguoithue
    FOREIGN KEY (MaNguoiThue) REFERENCES NGUOITHUE(MaNguoiThue)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_hdnt_ngay CHECK (NgayRoiDi IS NULL OR NgayRoiDi >= NgayThamGia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hdnt_vaitro ON HOPDONG_NGUOITHUE(VaiTro);

CREATE TABLE IF NOT EXISTS HOADON (
  MaHoaDon VARCHAR(30) PRIMARY KEY,
  MaHopDong VARCHAR(20) NOT NULL,
  Thang INT NOT NULL,
  Nam INT NOT NULL,
  ChiSoDienCu INT NOT NULL,
  ChiSoDienMoi INT NOT NULL,
  ChiSoNuocCu INT NOT NULL,
  ChiSoNuocMoi INT NOT NULL,
  TienDien DECIMAL(18,2) NOT NULL,
  TienNuoc DECIMAL(18,2) NOT NULL,
  TienThue DECIMAL(18,2) NOT NULL,
  TongTien DECIMAL(18,2) NOT NULL,
  TrangThai ENUM('DA_THANH_TOAN', 'CHUA_THANH_TOAN') NOT NULL DEFAULT 'CHUA_THANH_TOAN',
  NgayLap DATE NOT NULL,
  HanThanhToan DATE,
  GhiChu TEXT,
  CONSTRAINT fk_hoadon_hopdong
    FOREIGN KEY (MaHopDong) REFERENCES HOPDONG(MaHopDong)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_hoadon_contract_period UNIQUE (MaHopDong, Thang, Nam),
  CONSTRAINT ck_hoadon_period CHECK (Thang BETWEEN 1 AND 12 AND Nam BETWEEN 2000 AND 2100),
  CONSTRAINT ck_hoadon_meter CHECK (ChiSoDienMoi >= ChiSoDienCu AND ChiSoNuocMoi >= ChiSoNuocCu),
  CONSTRAINT ck_hoadon_money CHECK (
    TienDien >= 0 AND TienNuoc >= 0 AND TienThue >= 0 AND TongTien >= 0
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hoadon_mahopdong ON HOADON(MaHopDong);
CREATE INDEX idx_hoadon_trangthai ON HOADON(TrangThai);
