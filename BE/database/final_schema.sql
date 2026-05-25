-- =============================================================
-- final_schema.sql
-- Quản lý nhà trọ – Schema hoàn chỉnh
-- Chạy file này trên MySQL Workbench để khởi tạo toàn bộ CSDL.
-- MySQL >= 8.0
-- =============================================================

-- 1. Tạo & chọn database
-- =============================================================
DROP DATABASE IF EXISTS rental_house_management;

CREATE DATABASE rental_house_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rental_house_management;

-- =============================================================
-- 2. Bảng CHUTRO
-- =============================================================
CREATE TABLE CHUTRO (
  MaChuTro     VARCHAR(20)  NOT NULL,
  HoTen        VARCHAR(120) NOT NULL,
  SoDienThoai  VARCHAR(20)  NOT NULL,
  Email        VARCHAR(120),
  TenDangNhap  VARCHAR(50)  NOT NULL,
  MatKhau      VARCHAR(255) NOT NULL,
  DiaChi       VARCHAR(255),
  PRIMARY KEY (MaChuTro),
  CONSTRAINT uq_chutro_tendangnhap UNIQUE (TenDangNhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 3. Bảng NHATRO
--    (bao gồm cột IsDeleted / DeletedAt từ migration 003)
-- =============================================================
CREATE TABLE NHATRO (
  MaNhaTro    VARCHAR(20)    NOT NULL,
  TenNhaTro   VARCHAR(150)   NOT NULL,
  DiaChi      VARCHAR(255)   NOT NULL,
  DienTich    DECIMAL(10,2)  NOT NULL,
  GiaThue     DECIMAL(18,2)  NOT NULL,
  TienCoc     DECIMAL(18,2)  NOT NULL,
  MoTa        TEXT,
  TienNghi    TEXT,
  TrangThai   ENUM('TRONG','DANG_THUE','BAO_TRI') NOT NULL DEFAULT 'TRONG',
  MaChuTro    VARCHAR(20)    NOT NULL,
  IsDeleted   TINYINT(1)     NOT NULL DEFAULT 0,
  DeletedAt   DATETIME       NULL,
  PRIMARY KEY (MaNhaTro),
  CONSTRAINT fk_nhatro_chutro
    FOREIGN KEY (MaChuTro) REFERENCES CHUTRO(MaChuTro)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_nhatro_tien     CHECK (GiaThue >= 0 AND TienCoc >= 0),
  CONSTRAINT ck_nhatro_dientich CHECK (DienTich > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_nhatro_machutro  ON NHATRO(MaChuTro);
CREATE INDEX idx_nhatro_trangthai ON NHATRO(TrangThai);
CREATE INDEX IX_NHATRO_IsDeleted  ON NHATRO(IsDeleted);

-- =============================================================
-- 4. Bảng NGUOITHUE
-- =============================================================
CREATE TABLE NGUOITHUE (
  MaNguoiThue  VARCHAR(20)  NOT NULL,
  HoTen        VARCHAR(120) NOT NULL,
  SoDienThoai  VARCHAR(20)  NOT NULL,
  CCCD         VARCHAR(20)  NOT NULL,
  Email        VARCHAR(120),
  NgaySinh     DATE,
  DiaChi       VARCHAR(255),
  GhiChu       TEXT,
  PRIMARY KEY (MaNguoiThue),
  CONSTRAINT uq_nguoithue_cccd UNIQUE (CCCD)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 5. Bảng HOPDONG
--    (bao gồm cột NgayTao từ migration 004)
-- =============================================================
CREATE TABLE HOPDONG (
  MaHopDong       VARCHAR(20)   NOT NULL,
  MaNguoiDaiDien  VARCHAR(20)   NOT NULL,
  MaNhaTro        VARCHAR(20)   NOT NULL,
  NgayBatDau      DATE          NOT NULL,
  NgayKetThuc     DATE,
  TienThue        DECIMAL(18,2) NOT NULL,
  TienCoc         DECIMAL(18,2) NOT NULL,
  GhiChu          TEXT,
  TrangThai       ENUM('DANG_HIEU_LUC','DA_KET_THUC','DA_HUY') NOT NULL,
  NgayTao         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DaKy            TINYINT(1)    NOT NULL DEFAULT 0,
  NgayKy          DATETIME      NULL,
  PRIMARY KEY (MaHopDong),
  CONSTRAINT fk_hopdong_daidien
    FOREIGN KEY (MaNguoiDaiDien) REFERENCES NGUOITHUE(MaNguoiThue)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_hopdong_nhatro
    FOREIGN KEY (MaNhaTro) REFERENCES NHATRO(MaNhaTro)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_hopdong_tien CHECK (TienThue >= 0 AND TienCoc >= 0),
  CONSTRAINT ck_hopdong_ngay CHECK (NgayKetThuc IS NULL OR NgayKetThuc >= NgayBatDau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hopdong_manhatro  ON HOPDONG(MaNhaTro);
CREATE INDEX idx_hopdong_daidien   ON HOPDONG(MaNguoiDaiDien);
CREATE INDEX idx_hopdong_trangthai ON HOPDONG(TrangThai);

-- =============================================================
-- 6. Bảng HOPDONG_NGUOITHUE
-- =============================================================
CREATE TABLE HOPDONG_NGUOITHUE (
  MaHopDong   VARCHAR(20) NOT NULL,
  MaNguoiThue VARCHAR(20) NOT NULL,
  VaiTro      ENUM('DAI_DIEN','O_CUNG') NOT NULL,
  NgayThamGia DATE        NOT NULL,
  NgayRoiDi   DATE,
  TrangThai   ENUM('DANG_O','DA_ROI') NOT NULL DEFAULT 'DANG_O',
  PRIMARY KEY (MaHopDong, MaNguoiThue),
  CONSTRAINT fk_hdnt_hopdong
    FOREIGN KEY (MaHopDong) REFERENCES HOPDONG(MaHopDong)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_hdnt_nguoithue
    FOREIGN KEY (MaNguoiThue) REFERENCES NGUOITHUE(MaNguoiThue)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_hdnt_ngay CHECK (NgayRoiDi IS NULL OR NgayRoiDi >= NgayThamGia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hdnt_vaitro ON HOPDONG_NGUOITHUE(VaiTro);

-- =============================================================
-- 7. Bảng HOADON
-- =============================================================
CREATE TABLE HOADON (
  MaHoaDon     VARCHAR(30)   NOT NULL,
  MaHopDong    VARCHAR(20)   NOT NULL,
  Thang        INT           NOT NULL,
  Nam          INT           NOT NULL,
  ChiSoDienCu  INT           NOT NULL,
  ChiSoDienMoi INT           NOT NULL,
  ChiSoNuocCu  INT           NOT NULL,
  ChiSoNuocMoi INT           NOT NULL,
  TienDien     DECIMAL(18,2) NOT NULL,
  TienNuoc     DECIMAL(18,2) NOT NULL,
  TienThue     DECIMAL(18,2) NOT NULL,
  TongTien     DECIMAL(18,2) NOT NULL,
  TrangThai    ENUM('DA_THANH_TOAN','CHUA_THANH_TOAN') NOT NULL DEFAULT 'CHUA_THANH_TOAN',
  NgayLap      DATE          NOT NULL,
  HanThanhToan DATE,
  GhiChu       TEXT,
  PRIMARY KEY (MaHoaDon),
  CONSTRAINT fk_hoadon_hopdong
    FOREIGN KEY (MaHopDong) REFERENCES HOPDONG(MaHopDong)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_hoadon_contract_period UNIQUE (MaHopDong, Thang, Nam),
  CONSTRAINT ck_hoadon_period  CHECK (Thang BETWEEN 1 AND 12 AND Nam BETWEEN 2000 AND 2100),
  CONSTRAINT ck_hoadon_meter   CHECK (ChiSoDienMoi >= ChiSoDienCu AND ChiSoNuocMoi >= ChiSoNuocCu),
  CONSTRAINT ck_hoadon_money   CHECK (TienDien >= 0 AND TienNuoc >= 0 AND TienThue >= 0 AND TongTien >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hoadon_mahopdong ON HOADON(MaHopDong);
CREATE INDEX idx_hoadon_trangthai  ON HOADON(TrangThai);

-- =============================================================
-- 8. TRIGGERS – Business rules
-- =============================================================
DELIMITER $$

-- 8.1 Không cho tạo hợp đồng khi phòng không trống / đã có HĐ hiệu lực
CREATE TRIGGER trg_hopdong_before_insert
BEFORE INSERT ON HOPDONG
FOR EACH ROW
BEGIN
  DECLARE v_room_status VARCHAR(20);
  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    SELECT TrangThai INTO v_room_status FROM NHATRO WHERE MaNhaTro = NEW.MaNhaTro FOR UPDATE;
    IF EXISTS (SELECT 1 FROM HOPDONG WHERE MaNhaTro = NEW.MaNhaTro AND TrangThai = 'DANG_HIEU_LUC') THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot create duplicate active contract for the same room.';
    END IF;
    IF v_room_status <> 'TRONG' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room must be TRONG before creating an active contract.';
    END IF;
  END IF;
END $$

-- 8.2 Không cho cập nhật HĐ vi phạm ràng buộc phòng
CREATE TRIGGER trg_hopdong_before_update
BEFORE UPDATE ON HOPDONG
FOR EACH ROW
BEGIN
  DECLARE v_room_status VARCHAR(20);

  IF OLD.DaKy = 1
    AND (
      NOT (OLD.MaNguoiDaiDien <=> NEW.MaNguoiDaiDien)
      OR NOT (OLD.MaNhaTro <=> NEW.MaNhaTro)
      OR NOT (OLD.NgayBatDau <=> NEW.NgayBatDau)
      OR NOT (OLD.TienThue <=> NEW.TienThue)
      OR NOT (OLD.TienCoc <=> NEW.TienCoc)
    )
  THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Signed contract cannot be edited.';
  END IF;

  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    SELECT TrangThai INTO v_room_status FROM NHATRO WHERE MaNhaTro = NEW.MaNhaTro FOR UPDATE;
    IF EXISTS (SELECT 1 FROM HOPDONG WHERE MaNhaTro = NEW.MaNhaTro AND TrangThai = 'DANG_HIEU_LUC' AND MaHopDong <> NEW.MaHopDong) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot set this contract to active: another active contract already exists for this room.';
    END IF;
    IF v_room_status = 'BAO_TRI' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room in BAO_TRI cannot have an active contract.';
    END IF;
    IF v_room_status <> 'TRONG' AND NOT (OLD.TrangThai = 'DANG_HIEU_LUC' AND OLD.MaNhaTro = NEW.MaNhaTro) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room must be TRONG before setting contract to active.';
    END IF;
  END IF;
END $$

-- 8.3 Sau khi tạo HĐ: auto-insert người đại diện vào HDNT + đổi trạng thái phòng
CREATE TRIGGER trg_hopdong_after_insert
AFTER INSERT ON HOPDONG
FOR EACH ROW
BEGIN
  INSERT INTO HOPDONG_NGUOITHUE (MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai)
  VALUES (
    NEW.MaHopDong, NEW.MaNguoiDaiDien, 'DAI_DIEN', NEW.NgayBatDau,
    CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN NULL ELSE NEW.NgayKetThuc END,
    CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN 'DANG_O' ELSE 'DA_ROI' END
  )
  ON DUPLICATE KEY UPDATE
    VaiTro      = 'DAI_DIEN',
    NgayThamGia = VALUES(NgayThamGia),
    NgayRoiDi   = VALUES(NgayRoiDi),
    TrangThai   = VALUES(TrangThai);
  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO SET TrangThai = 'DANG_THUE' WHERE MaNhaTro = NEW.MaNhaTro;
  END IF;
END $$

-- 8.4 Sau khi cập nhật HĐ: đồng bộ người đại diện + trạng thái phòng
CREATE TRIGGER trg_hopdong_after_update
AFTER UPDATE ON HOPDONG
FOR EACH ROW
BEGIN
  IF NEW.MaNguoiDaiDien <> OLD.MaNguoiDaiDien THEN
    UPDATE HOPDONG_NGUOITHUE SET VaiTro = 'O_CUNG'
      WHERE MaHopDong = NEW.MaHopDong AND MaNguoiThue = OLD.MaNguoiDaiDien;
    INSERT INTO HOPDONG_NGUOITHUE (MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai)
    VALUES (
      NEW.MaHopDong, NEW.MaNguoiDaiDien, 'DAI_DIEN', NEW.NgayBatDau,
      CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN NULL ELSE NEW.NgayKetThuc END,
      CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN 'DANG_O' ELSE 'DA_ROI' END
    )
    ON DUPLICATE KEY UPDATE
      VaiTro      = 'DAI_DIEN',
      NgayThamGia = VALUES(NgayThamGia),
      NgayRoiDi   = VALUES(NgayRoiDi),
      TrangThai   = VALUES(TrangThai);
  END IF;
  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO SET TrangThai = 'DANG_THUE' WHERE MaNhaTro = NEW.MaNhaTro;
    IF OLD.MaNhaTro <> NEW.MaNhaTro THEN
      UPDATE NHATRO SET TrangThai = 'TRONG'
        WHERE MaNhaTro = OLD.MaNhaTro AND TrangThai = 'DANG_THUE'
          AND NOT EXISTS (SELECT 1 FROM HOPDONG WHERE MaNhaTro = OLD.MaNhaTro AND TrangThai = 'DANG_HIEU_LUC' AND MaHopDong <> NEW.MaHopDong);
    END IF;
  ELSEIF OLD.TrangThai = 'DANG_HIEU_LUC' AND NEW.TrangThai IN ('DA_KET_THUC','DA_HUY') THEN
    UPDATE NHATRO SET TrangThai = 'TRONG'
      WHERE MaNhaTro = OLD.MaNhaTro
        AND NOT EXISTS (SELECT 1 FROM HOPDONG WHERE MaNhaTro = OLD.MaNhaTro AND TrangThai = 'DANG_HIEU_LUC');
  END IF;
END $$

-- 8.5 Sau khi xóa HĐ: trả phòng về TRONG nếu không còn HĐ hiệu lực
CREATE TRIGGER trg_hopdong_after_delete
AFTER DELETE ON HOPDONG
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO SET TrangThai = 'TRONG'
      WHERE MaNhaTro = OLD.MaNhaTro AND TrangThai = 'DANG_THUE'
        AND NOT EXISTS (SELECT 1 FROM HOPDONG WHERE MaNhaTro = OLD.MaNhaTro AND TrangThai = 'DANG_HIEU_LUC');
  END IF;
END $$

-- 8.6 Validate vai trò trước khi thêm vào HOPDONG_NGUOITHUE
CREATE TRIGGER trg_hdnt_before_insert
BEFORE INSERT ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  DECLARE v_rep VARCHAR(20);
  SELECT MaNguoiDaiDien INTO v_rep FROM HOPDONG WHERE MaHopDong = NEW.MaHopDong;
  IF NEW.VaiTro = 'DAI_DIEN' AND NEW.MaNguoiThue <> v_rep THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only MaNguoiDaiDien can be inserted with role DAI_DIEN.';
  END IF;
  IF NEW.VaiTro = 'O_CUNG' AND NEW.MaNguoiThue = v_rep THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'MaNguoiDaiDien cannot be inserted with role O_CUNG.';
  END IF;
END $$

-- 8.7 Validate vai trò trước khi cập nhật HOPDONG_NGUOITHUE
CREATE TRIGGER trg_hdnt_before_update
BEFORE UPDATE ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  DECLARE v_rep VARCHAR(20);
  SELECT MaNguoiDaiDien INTO v_rep FROM HOPDONG WHERE MaHopDong = NEW.MaHopDong;
  IF NEW.VaiTro = 'DAI_DIEN' AND NEW.MaNguoiThue <> v_rep THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only MaNguoiDaiDien can have role DAI_DIEN.';
  END IF;
  IF NEW.VaiTro = 'O_CUNG' AND NEW.MaNguoiThue = v_rep THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'MaNguoiDaiDien cannot be changed to role O_CUNG.';
  END IF;
END $$

-- 8.8 Không cho xóa người thuê khỏi HOPDONG_NGUOITHUE khi người thuê đang ở
CREATE TRIGGER trg_hdnt_before_delete
BEFORE DELETE ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DANG_O' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete tenant participation while tenant is staying.';
  END IF;
END $$

-- 8.9 Validate chỉ số đồng hồ khi tạo hóa đơn
CREATE TRIGGER trg_hoadon_before_insert
BEFORE INSERT ON HOADON
FOR EACH ROW
BEGIN
  IF NEW.ChiSoDienMoi < NEW.ChiSoDienCu OR NEW.ChiSoNuocMoi < NEW.ChiSoNuocCu THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'New meter readings must be >= old meter readings.';
  END IF;
END $$

-- 8.10 Không cho sửa hóa đơn đã thanh toán
CREATE TRIGGER trg_hoadon_before_update
BEFORE UPDATE ON HOADON
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DA_THANH_TOAN' THEN
    IF NEW.TrangThai <> 'DA_THANH_TOAN' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paid invoice status cannot be reverted.';
    END IF;
    IF NEW.TienDien <> OLD.TienDien OR NEW.TienNuoc <> OLD.TienNuoc OR NEW.TienThue <> OLD.TienThue
      OR NEW.TongTien <> OLD.TongTien OR NEW.MaHopDong <> OLD.MaHopDong
      OR NEW.Thang <> OLD.Thang OR NEW.Nam <> OLD.Nam
      OR NEW.ChiSoDienCu <> OLD.ChiSoDienCu OR NEW.ChiSoDienMoi <> OLD.ChiSoDienMoi
      OR NEW.ChiSoNuocCu <> OLD.ChiSoNuocCu OR NEW.ChiSoNuocMoi <> OLD.ChiSoNuocMoi
      OR NEW.NgayLap <> OLD.NgayLap
      OR (NEW.HanThanhToan <> OLD.HanThanhToan OR (NEW.HanThanhToan IS NULL) <> (OLD.HanThanhToan IS NULL)) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paid invoice core fields are immutable.';
    END IF;
  END IF;
  IF NEW.ChiSoDienMoi < NEW.ChiSoDienCu OR NEW.ChiSoNuocMoi < NEW.ChiSoNuocCu THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'New meter readings must be >= old meter readings.';
  END IF;
END $$

DELIMITER ;

-- =============================================================
-- 9. Dữ liệu khởi tạo (chủ trọ demo)
-- =============================================================
INSERT INTO CHUTRO (MaChuTro, HoTen, SoDienThoai, Email, TenDangNhap, MatKhau, DiaChi)
VALUES ('CT001', 'Nguyen Van Chu Tro', '0900000001', 'chutro1@example.com', 'chutro001', '123456', 'Ha Noi')
ON DUPLICATE KEY UPDATE HoTen = VALUES(HoTen);
