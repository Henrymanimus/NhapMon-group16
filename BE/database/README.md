# Database Setup (MySQL 8)

This folder contains SQL-first database artifacts built from `docs/CSDL.md` and `docs/readme.md`.

## Files

- `migrations/001_init_schema.sql`: Core schema (6 tables, PK/FK, unique/check/index).
- `migrations/002_business_rules.sql`: Triggers for cross-row business rules.
- `seeds/001_seed_baseline.sql`: Deterministic baseline records.
- `verify/verify_rules.sql`: PASS/FAIL style verification script.

## Rule Mapping

| Readme rule | Enforcement |
|---|---|
| 1, 2 | No direct tenant-room table exists; mapping only via `HOPDONG` + `HOPDONG_NGUOITHUE`. |
| 3 | `HOPDONG.MaNhaTro` FK to `NHATRO.MaNhaTro`. |
| 4 | `HOPDONG.MaNguoiDaiDien` FK to `NGUOITHUE.MaNguoiThue`. |
| 5, 6 | Triggers on `HOPDONG_NGUOITHUE` enforce representative role consistency. |
| 7 | `HOADON.MaHopDong` FK to `HOPDONG.MaHopDong`; no direct room/tenant FK in invoice. |
| 8 | Trigger blocks duplicate `DANG_HIEU_LUC` contracts per room. |
| 9 | Unique constraint on (`MaHopDong`, `Thang`, `Nam`). |
| 10 | Trigger blocks monetary updates when `TrangThai = DA_THANH_TOAN`. |

## Apply (fresh database)

```bash
mysql -u <user> -p < BE/database/migrations/001_init_schema.sql
mysql -u <user> -p < BE/database/migrations/002_business_rules.sql
mysql -u <user> -p < BE/database/seeds/001_seed_baseline.sql
mysql -u <user> -p < BE/database/verify/verify_rules.sql
```

## Re-run safely

- Migrations are written with `IF NOT EXISTS` and trigger `DROP IF EXISTS` guards.
- Seed uses `ON DUPLICATE KEY UPDATE` for idempotent local reruns.
- Verification includes inserts used for checks; run on a disposable local DB or reset between runs if needed.

## Notes for BE integration

- Keep room status changes aligned with contract status transitions.
- Use DB transactions in backend when creating contract + member rows.
- Do not bypass triggers with direct production updates.
