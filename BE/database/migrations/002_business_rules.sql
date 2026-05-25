-- 002_business_rules.sql
-- Adds business-rule triggers that cannot be enforced by declarative constraints alone.

USE rental_house_management;

DROP TRIGGER IF EXISTS trg_hopdong_before_insert;
DROP TRIGGER IF EXISTS trg_hopdong_before_update;
DROP TRIGGER IF EXISTS trg_hopdong_after_insert;
DROP TRIGGER IF EXISTS trg_hopdong_after_update;
DROP TRIGGER IF EXISTS trg_hopdong_after_delete;
DROP TRIGGER IF EXISTS trg_hdnt_before_insert;
DROP TRIGGER IF EXISTS trg_hdnt_before_update;
DROP TRIGGER IF EXISTS trg_hdnt_before_delete;
DROP TRIGGER IF EXISTS trg_hoadon_before_insert;
DROP TRIGGER IF EXISTS trg_hoadon_before_update;

DELIMITER $$

CREATE TRIGGER trg_hopdong_before_insert
BEFORE INSERT ON HOPDONG
FOR EACH ROW
BEGIN
  DECLARE v_room_status VARCHAR(20);

  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    SELECT TrangThai INTO v_room_status
    FROM NHATRO
    WHERE MaNhaTro = NEW.MaNhaTro
    FOR UPDATE;

    IF EXISTS (
      SELECT 1
      FROM HOPDONG hd
      WHERE hd.MaNhaTro = NEW.MaNhaTro
        AND hd.TrangThai = 'DANG_HIEU_LUC'
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot create duplicate active contract for the same room.';
    END IF;

    IF v_room_status <> 'TRONG' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room must be TRONG before creating an active contract.';
    END IF;
  END IF;
END $$

CREATE TRIGGER trg_hopdong_before_update
BEFORE UPDATE ON HOPDONG
FOR EACH ROW
BEGIN
  DECLARE v_room_status VARCHAR(20);

  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    SELECT TrangThai INTO v_room_status
    FROM NHATRO
    WHERE MaNhaTro = NEW.MaNhaTro
    FOR UPDATE;

    IF EXISTS (
      SELECT 1
      FROM HOPDONG hd
      WHERE hd.MaNhaTro = NEW.MaNhaTro
        AND hd.TrangThai = 'DANG_HIEU_LUC'
        AND hd.MaHopDong <> NEW.MaHopDong
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot set this contract to active: another active contract already exists for this room.';
    END IF;

    IF v_room_status = 'BAO_TRI' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room in BAO_TRI cannot have an active contract.';
    END IF;

    IF v_room_status <> 'TRONG'
       AND NOT (OLD.TrangThai = 'DANG_HIEU_LUC' AND OLD.MaNhaTro = NEW.MaNhaTro) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room must be TRONG before setting contract to active.';
    END IF;
  END IF;
END $$

CREATE TRIGGER trg_hopdong_after_insert
AFTER INSERT ON HOPDONG
FOR EACH ROW
BEGIN
  INSERT INTO HOPDONG_NGUOITHUE (
    MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai
  )
  VALUES (
    NEW.MaHopDong,
    NEW.MaNguoiDaiDien,
    'DAI_DIEN',
    NEW.NgayBatDau,
    CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN NULL ELSE NEW.NgayKetThuc END,
    CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN 'DANG_O' ELSE 'DA_ROI' END
  )
  ON DUPLICATE KEY UPDATE
    VaiTro = 'DAI_DIEN',
    NgayThamGia = VALUES(NgayThamGia),
    NgayRoiDi = VALUES(NgayRoiDi),
    TrangThai = VALUES(TrangThai);

  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO
    SET TrangThai = 'DANG_THUE'
    WHERE MaNhaTro = NEW.MaNhaTro;
  END IF;
END $$

CREATE TRIGGER trg_hopdong_after_update
AFTER UPDATE ON HOPDONG
FOR EACH ROW
BEGIN
  IF NEW.MaNguoiDaiDien <> OLD.MaNguoiDaiDien THEN
    UPDATE HOPDONG_NGUOITHUE
    SET VaiTro = 'O_CUNG'
    WHERE MaHopDong = NEW.MaHopDong
      AND MaNguoiThue = OLD.MaNguoiDaiDien;

    INSERT INTO HOPDONG_NGUOITHUE (
      MaHopDong, MaNguoiThue, VaiTro, NgayThamGia, NgayRoiDi, TrangThai
    )
    VALUES (
      NEW.MaHopDong,
      NEW.MaNguoiDaiDien,
      'DAI_DIEN',
      NEW.NgayBatDau,
      CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN NULL ELSE NEW.NgayKetThuc END,
      CASE WHEN NEW.TrangThai = 'DANG_HIEU_LUC' THEN 'DANG_O' ELSE 'DA_ROI' END
    )
    ON DUPLICATE KEY UPDATE
      VaiTro = 'DAI_DIEN',
      NgayThamGia = VALUES(NgayThamGia),
      NgayRoiDi = VALUES(NgayRoiDi),
      TrangThai = VALUES(TrangThai);
  END IF;

  IF NEW.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO
    SET TrangThai = 'DANG_THUE'
    WHERE MaNhaTro = NEW.MaNhaTro;

    IF OLD.MaNhaTro <> NEW.MaNhaTro THEN
      UPDATE NHATRO nt
      SET nt.TrangThai = 'TRONG'
      WHERE nt.MaNhaTro = OLD.MaNhaTro
        AND nt.TrangThai = 'DANG_THUE'
        AND NOT EXISTS (
          SELECT 1
          FROM HOPDONG hd
          WHERE hd.MaNhaTro = OLD.MaNhaTro
            AND hd.TrangThai = 'DANG_HIEU_LUC'
            AND hd.MaHopDong <> NEW.MaHopDong
        );
    END IF;
  ELSEIF OLD.TrangThai = 'DANG_HIEU_LUC'
     AND NEW.TrangThai IN ('DA_KET_THUC', 'DA_HUY') THEN
    UPDATE NHATRO nt
    SET nt.TrangThai = 'TRONG'
    WHERE nt.MaNhaTro = OLD.MaNhaTro
      AND NOT EXISTS (
        SELECT 1
        FROM HOPDONG hd
        WHERE hd.MaNhaTro = OLD.MaNhaTro
          AND hd.TrangThai = 'DANG_HIEU_LUC'
      );
  END IF;
END $$

CREATE TRIGGER trg_hopdong_after_delete
AFTER DELETE ON HOPDONG
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DANG_HIEU_LUC' THEN
    UPDATE NHATRO nt
    SET nt.TrangThai = 'TRONG'
    WHERE nt.MaNhaTro = OLD.MaNhaTro
      AND nt.TrangThai = 'DANG_THUE'
      AND NOT EXISTS (
        SELECT 1
        FROM HOPDONG hd
        WHERE hd.MaNhaTro = OLD.MaNhaTro
          AND hd.TrangThai = 'DANG_HIEU_LUC'
      );
  END IF;
END $$

CREATE TRIGGER trg_hdnt_before_insert
BEFORE INSERT ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  DECLARE v_rep VARCHAR(20);
  SELECT MaNguoiDaiDien INTO v_rep
  FROM HOPDONG
  WHERE MaHopDong = NEW.MaHopDong;

  IF NEW.VaiTro = 'DAI_DIEN' AND NEW.MaNguoiThue <> v_rep THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only MaNguoiDaiDien can be inserted with role DAI_DIEN.';
  END IF;

  IF NEW.VaiTro = 'O_CUNG' AND NEW.MaNguoiThue = v_rep THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'MaNguoiDaiDien cannot be inserted with role O_CUNG.';
  END IF;
END $$

CREATE TRIGGER trg_hdnt_before_update
BEFORE UPDATE ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  DECLARE v_rep VARCHAR(20);
  SELECT MaNguoiDaiDien INTO v_rep
  FROM HOPDONG
  WHERE MaHopDong = NEW.MaHopDong;

  IF NEW.VaiTro = 'DAI_DIEN' AND NEW.MaNguoiThue <> v_rep THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only MaNguoiDaiDien can have role DAI_DIEN.';
  END IF;

  IF NEW.VaiTro = 'O_CUNG' AND NEW.MaNguoiThue = v_rep THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'MaNguoiDaiDien cannot be changed to role O_CUNG.';
  END IF;
END $$

CREATE TRIGGER trg_hdnt_before_delete
BEFORE DELETE ON HOPDONG_NGUOITHUE
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DANG_O' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete tenant participation while tenant is staying.';
  END IF;
END $$

CREATE TRIGGER trg_hoadon_before_insert
BEFORE INSERT ON HOADON
FOR EACH ROW
BEGIN
  IF NEW.ChiSoDienMoi < NEW.ChiSoDienCu OR NEW.ChiSoNuocMoi < NEW.ChiSoNuocCu THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'New meter readings must be >= old meter readings.';
  END IF;
END $$

CREATE TRIGGER trg_hoadon_before_update
BEFORE UPDATE ON HOADON
FOR EACH ROW
BEGIN
  IF OLD.TrangThai = 'DA_THANH_TOAN' THEN
    IF NEW.TrangThai <> 'DA_THANH_TOAN' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Paid invoice status cannot be reverted.';
    END IF;

    IF NEW.TienDien <> OLD.TienDien
      OR NEW.TienNuoc <> OLD.TienNuoc
      OR NEW.TienThue <> OLD.TienThue
      OR NEW.TongTien <> OLD.TongTien
      OR NEW.MaHopDong <> OLD.MaHopDong
      OR NEW.Thang <> OLD.Thang
      OR NEW.Nam <> OLD.Nam
      OR NEW.ChiSoDienCu <> OLD.ChiSoDienCu
      OR NEW.ChiSoDienMoi <> OLD.ChiSoDienMoi
      OR NEW.ChiSoNuocCu <> OLD.ChiSoNuocCu
      OR NEW.ChiSoNuocMoi <> OLD.ChiSoNuocMoi
      OR NEW.NgayLap <> OLD.NgayLap
      OR (NEW.HanThanhToan <> OLD.HanThanhToan OR (NEW.HanThanhToan IS NULL) <> (OLD.HanThanhToan IS NULL)) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Paid invoice core fields are immutable.';
    END IF;
  END IF;

  IF NEW.ChiSoDienMoi < NEW.ChiSoDienCu OR NEW.ChiSoNuocMoi < NEW.ChiSoNuocCu THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'New meter readings must be >= old meter readings.';
  END IF;
END $$

DELIMITER ;
