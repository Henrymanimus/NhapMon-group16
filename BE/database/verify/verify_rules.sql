-- verify_rules.sql
-- Runs rule verification checks and prints PASS/FAIL rows.

USE rental_house_management;

DROP TEMPORARY TABLE IF EXISTS verification_results;
CREATE TEMPORARY TABLE verification_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_name VARCHAR(120) NOT NULL,
  expected VARCHAR(100) NOT NULL,
  actual VARCHAR(255) NOT NULL,
  result ENUM('PASS', 'FAIL') NOT NULL,
  details VARCHAR(255)
);

DROP PROCEDURE IF EXISTS run_case;
DELETE FROM HOPDONG WHERE MaHopDong = 'HD003_VERIFY';
DELETE FROM HOPDONG WHERE MaHopDong = 'HD_DUP_ACTIVE';
DELETE FROM HOADON WHERE MaHoaDon = 'INV-HD001-2026-05';

DELIMITER $$

CREATE PROCEDURE run_case(
  IN p_test_name VARCHAR(120),
  IN p_sql TEXT,
  IN p_expect_error BOOLEAN,
  IN p_expected_message_like VARCHAR(120)
)
BEGIN
  DECLARE v_had_error BOOLEAN DEFAULT FALSE;
  DECLARE v_error_msg TEXT DEFAULT '';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
    SET v_had_error = TRUE;
  END;

  SET @stmt_text = p_sql;
  PREPARE stmt FROM @stmt_text;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  INSERT INTO verification_results (test_name, expected, actual, result, details)
  VALUES (
    p_test_name,
    IF(p_expect_error, 'ERROR', 'SUCCESS'),
    IF(v_had_error, 'ERROR', 'SUCCESS'),
    IF(
      (p_expect_error AND v_had_error AND (p_expected_message_like IS NULL OR v_error_msg LIKE CONCAT('%', p_expected_message_like, '%')))
      OR ((NOT p_expect_error) AND (NOT v_had_error)),
      'PASS',
      'FAIL'
    ),
    IF(v_had_error, CONCAT('Error: ', v_error_msg), 'Statement completed')
  );
END $$

DELIMITER ;

-- 1) Room status sync after active contract exists.
INSERT INTO verification_results (test_name, expected, actual, result, details)
SELECT
  'room_status_synced_for_active_contract',
  'DANG_THUE',
  IFNULL((SELECT TrangThai FROM NHATRO WHERE MaNhaTro = 'NT001'), 'NULL'),
  IF((SELECT TrangThai FROM NHATRO WHERE MaNhaTro = 'NT001') = 'DANG_THUE', 'PASS', 'FAIL'),
  'NT001 should be DANG_THUE while HD001 is active';

-- 2) Reject duplicate active contract for same room.
CALL run_case(
  'reject_duplicate_active_contract_same_room',
  "INSERT INTO HOPDONG (MaHopDong, MaNguoiDaiDien, MaNhaTro, NgayBatDau, NgayKetThuc, TienThue, TienCoc, GhiChu, TrangThai) VALUES ('HD_DUP_ACTIVE', 'NTEN001', 'NT001', '2026-05-01', NULL, 3500000.00, 3500000.00, 'should fail', 'DANG_HIEU_LUC')",
  TRUE,
  'duplicate active contract'
);

-- 2b) Active contract creation succeeds on available room and syncs room status.
CALL run_case(
  'allow_active_contract_creation_on_available_room',
  "INSERT INTO HOPDONG (MaHopDong, MaNguoiDaiDien, MaNhaTro, NgayBatDau, NgayKetThuc, TienThue, TienCoc, GhiChu, TrangThai) VALUES ('HD003_VERIFY', 'NTEN003', 'NT003', '2026-06-01', NULL, 4200000.00, 4200000.00, 'verify happy path', 'DANG_HIEU_LUC')",
  FALSE,
  NULL
);

INSERT INTO verification_results (test_name, expected, actual, result, details)
SELECT
  'room_status_after_active_contract_creation',
  'DANG_THUE',
  IFNULL((SELECT TrangThai FROM NHATRO WHERE MaNhaTro = 'NT003'), 'NULL'),
  IF((SELECT TrangThai FROM NHATRO WHERE MaNhaTro = 'NT003') = 'DANG_THUE', 'PASS', 'FAIL'),
  'NT003 should become DANG_THUE after HD003_VERIFY insert';

-- 3) Reject duplicate invoice for same contract month/year.
CALL run_case(
  'reject_duplicate_invoice_contract_month_year',
  "INSERT INTO HOADON (MaHoaDon, MaHopDong, Thang, Nam, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, TienDien, TienNuoc, TienThue, TongTien, TrangThai, NgayLap, HanThanhToan, GhiChu) VALUES ('INV-HD001-2026-04-DUP', 'HD001', 4, 2026, 1160, 1200, 565, 590, 160000.00, 150000.00, 3500000.00, 3810000.00, 'CHUA_THANH_TOAN', '2026-04-30', '2026-05-12', 'should fail')",
  TRUE,
  'Duplicate entry'
);

-- 4) Reject monetary update on paid invoice.
CALL run_case(
  'reject_monetary_update_on_paid_invoice',
  "UPDATE HOADON SET TongTien = TongTien + 1000 WHERE MaHoaDon = 'INV-HD001-2026-03'",
  TRUE,
  'immutable'
);

-- 5) Accept adding invoice for new period.
CALL run_case(
  'allow_new_invoice_for_new_period',
  "INSERT INTO HOADON (MaHoaDon, MaHopDong, Thang, Nam, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, TienDien, TienNuoc, TienThue, TongTien, TrangThai, NgayLap, HanThanhToan, GhiChu) VALUES ('INV-HD001-2026-05', 'HD001', 5, 2026, 1160, 1240, 565, 595, 320000.00, 180000.00, 3500000.00, 4000000.00, 'CHUA_THANH_TOAN', '2026-05-31', '2026-06-10', 'should pass')",
  FALSE,
  NULL
);

-- 6) Reject status rollback on paid invoice.
CALL run_case(
  'reject_status_rollback_on_paid_invoice',
  "UPDATE HOADON SET TrangThai = 'CHUA_THANH_TOAN' WHERE MaHoaDon = 'INV-HD001-2026-03'",
  TRUE,
  'cannot be reverted'
);

DELETE FROM HOADON WHERE MaHoaDon = 'INV-HD001-2026-05';
DELETE FROM HOPDONG WHERE MaHopDong = 'HD_DUP_ACTIVE';
DELETE FROM HOPDONG WHERE MaHopDong = 'HD003_VERIFY';

SELECT *
FROM verification_results
ORDER BY id;

DROP PROCEDURE IF EXISTS run_case;
