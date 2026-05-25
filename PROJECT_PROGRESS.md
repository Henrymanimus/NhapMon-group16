# Project Progress Tracker

Last updated: 2026-05-25 (login landing route, contract signing/delete UI polish, invoice meter carry-forward, invoice K57 PDF preview)
Owner: Team + AI pair-programming

## Purpose
Single source of truth to track:
- What has been completed
- What is currently in progress
- What is next
- Decisions and blockers

Update this file at the end of each completed module to keep AI context stable and avoid hallucination/drift.

## Current Overall Status
- Auth module: DONE (BE + FE integration, Account tab wired to real API, profile update + password change, forgot-password OTP email, password visibility toggles, registration completed)
- Rooms module: DONE and tested CRUD
- Tenants module: DONE and tested CRUD + UI enhancements (sort by join date) + delete business rule updated/tested
- Contracts module: DONE (BE + FE integration) + UI enhancements (NgayTao column, sort by created date, auto-sort by status, PDF preview, sign lock, unsigned delete)
- Invoices module: DONE (BE + FE integration to real DB + UI polish validated, previous meter carry-forward, K57 PDF preview)
- Dashboard: DONE (real API data, revenue strip horizontal layout, occupancy progress bar fixed, expiring threshold 10 days)
- Reports: DEFERRED — UI skeleton exists (`Reports.tsx`) but route + sidebar item commented out. Will be implemented in the future.
- Docs: SRS updated for login/register/forgot-password (`docs/SRS/01_login.md`), tenant delete rule (`docs/SRS/04_NGT.md`), contract workflows (`docs/SRS/05_HD.md`), and invoice workflows (`docs/SRS/06_HDN.md`).

## Module Log

### [DONE] Rooms (Nha Tro)
- Scope:
  - List rooms
  - View room detail
  - Add new room
  - Update room
  - Delete room (soft delete)
- What was fixed recently:
  - FE delete flow failed after confirm because DELETE returns `204 No Content`.
  - Root cause: `apiFetch` always parsed JSON, causing error on empty body.
  - Fix: handle `204`/empty content in FE API client.
- Validation result:
  - Delete confirms successfully.
  - List refreshes correctly.
  - Soft-deleted item no longer appears in list.
  - Success message is shown.

## What We Are Doing Now
- Reports deferred. All core modules complete.
- Auth forgot-password and tenant deletion business rules are implemented and documented.
- Auth registration is implemented and documented.
- Dev servers are currently running for FE and BE.
- Next: final polish / presentation prep.

### [DONE] Daily Update 2026-05-25
- Routing:
  - FE root `/` now opens Login first.
  - Dashboard moved to `/dashboard`; login success navigates to `/dashboard`.
  - Sidebar Dashboard link updated to `/dashboard`.
- Contracts:
  - Added delete-contract business flow for unsigned contracts: `DELETE /api/contracts/:maHopDong`, confirmation modal, redirect to `/contracts`.
  - Delete button is disabled after contract signing.
  - Contract list action edit icon hidden for signed or ended contracts.
  - Contract detail header/card polished: `Preview Hợp đồng` and `Xác nhận ký/Đã ký` moved into the `Thông tin hợp đồng` card.
  - Local DB/final schema/migration updated for `DaKy`, `NgayKy`, and signed-contract edit lock trigger.
- Invoices:
  - Added previous meter carry-forward rule: from second invoice onward, old electric/water readings are taken from the previous invoice's new readings.
  - FE invoice form auto-fills and locks old meter fields when previous invoice exists.
  - BE validates old meter values on invoice creation to prevent API bypass.
  - Added invoice PDF preview route `GET /api/invoices/:maHoaDon/preview.pdf`.
  - Invoice detail now has `Preview hóa đơn` button beside `Xác nhận thanh toán`.
  - Invoice PDF preview changed to K57 thermal receipt size (`57mm` wide).
- Validation:
  - BE `npm.cmd run typecheck`: PASS on 2026-05-25.
  - FE `npm.cmd run build`: PASS on 2026-05-25.
  - Smoke-tested invoice contract options: returns `soHoaDon`, `chiSoDienMoiGanNhat`, `chiSoNuocMoiGanNhat`.
  - Smoke-tested invoice PDF preview: `200 OK`, `Content-Type: application/pdf`, K57 media box width `161.574803pt`.

### [DONE] Auth / Account
- Scope:
  - Login with real API
  - Load current landlord profile from API
  - Update profile information in Account tab
  - Change password with current password check
- Completed:
  - BE: added `/api/auth/me`, `/api/auth/profile`, `/api/auth/change-password`
  - BE: password change now verifies old password and hashes new password with `bcrypt`
  - FE: Account tab rewired to real API
  - FE: profile edit/save working with validation and success/error states
  - FE: change-password modal simplified to old password + new password + confirm password
  - FE: password modal backdrop updated to blur current page instead of dark overlay
- Validation:
  - Manual flow tested: Login → Account → edit landlord name → save → backend data updated
  - Password change flow tested and confirmed working

### [DONE] Auth / Forgot Password (ACC-01.1)
- Scope:
  - Forgot-password flow from login page
  - Send OTP through real email when SMTP is configured
  - Verify OTP before allowing password reset
  - Reset password with `bcrypt` hash
- Completed:
  - BE: added `/api/auth/forgot-password`, `/api/auth/verify-otp`, `/api/auth/reset-password`
  - BE: added `nodemailer` mail service and SMTP config variables in env layer / `.env.example`
  - BE: OTP is 5 digits, stored temporarily in memory, expires after 10 minutes, and is deleted after successful reset
  - FE: login page has forgot-password dialog with 3 stages: request OTP → verify OTP → reset password
  - FE: new password and confirm password fields have eye icons for show/hide
  - Docs: `docs/SRS/01_login.md` updated with forgot-password business flow, API notes, SMTP requirements, UI states, and messages
- Validation:
  - Backend restarted after SMTP env setup
  - OTP email send confirmed from backend log: `Password reset OTP email sent`
  - FE `npm.cmd run build`: PASS on 2026-05-20

### [DONE] Auth / Password Visibility Polish
- Scope:
  - Improve password input usability on login/forgot-password and Account module
- Completed:
  - FE: login password already supports show/hide
  - FE: forgot-password reset stage now supports show/hide for new password and confirm password
  - FE: Account change-password modal now supports show/hide for current password, new password, and confirm password
  - FE: visibility state resets when modal/dialog closes or password change succeeds
- Validation:
  - FE `npm.cmd run build`: PASS on 2026-05-20
  - Browser test on `/account`: modal opens, all 3 eye buttons render, toggling changes inputs from hidden to visible

### [DONE] Auth / Register Account (ACC-01.2)
- Scope:
  - Add registration entry point on login screen
  - Create landlord account from FE modal
  - Generate `CHUTRO.MaChuTro` using `CT###` prefix
  - Hash new account password with `bcrypt`
- Completed:
  - BE: added `POST /api/auth/register`
  - BE: validates required fields, email format, phone length, username uniqueness, email uniqueness, password length
  - BE: auto-generates next landlord id such as `CT001`, `CT002`
  - FE: added `Đăng ký tài khoản` button below login button with lighter styling
  - FE: added large registration modal with hoTen, email, soDienThoai, tenDangNhap, matKhau, xacNhanMatKhau
  - FE: validates password minimum length and confirm-password match before submit
  - Docs: `docs/SRS/01_login.md` updated with ACC-01.2 registration flow, UI, validation, API, and postconditions
- Validation:
  - BE `npm.cmd run typecheck`: PASS on 2026-05-24
  - FE `npm.cmd run build`: PASS on 2026-05-24
  - API test created `Nguyễn văn B` with username `vanb`, email `vanb@gmail.com`, phone `0909992221`, password `hieu123`; generated `MaChuTro = CT002`
  - Login test for `vanb` / `hieu123`: PASS, token received

### [DONE] Dashboard
- Scope:
  - Keep existing dashboard UI skeleton
  - Replace mock numbers/lists/charts with live data
  - Keep quick actions/navigation unchanged
- Completed:
  - FE: Dashboard now calls `/rooms`, `/tenants`, `/contracts`, `/invoices`
  - Room card + occupancy donut synced from room statuses
  - Contract card + expiring list synced from active contracts and end dates
  - Invoice card + unpaid/overdue list synced from invoice stats/items
  - Revenue area chart synced from paid invoices in the last 7 months
- Validation:
  - FE `npm run build` (with `DISABLE_TAILWIND=1`): PASS on 2026-05-05

### [DONE] Tenants (Nguoi Thue)
- Scope:
  - List tenants from database
  - View tenant detail from database
  - Create tenant
  - Update tenant
  - Delete tenant with business constraints
- Completed:
  - BE: tenants.service.ts, tenants.controller.ts, tenants.routes.ts, tenants.schemas.ts
  - FE: TenantsList, TenantForm (create/update), TenantDetail — all wired to real API
  - Delete guarded by business rule (block tenant whose contract participation status is `DANG_O`; allow delete when status is `DA_ROI`)
  - DB trigger updated so `HOPDONG_NGUOITHUE` delete is blocked only for rows with `TrangThai = 'DANG_O'`
  - `BE/database/final_schema.sql` updated; local migration `006_update_hdnt_delete_rule_by_tenant_status.sql` created under ignored `database/migrations/`
  - Docs: `docs/SRS/04_NGT.md` updated with the latest tenant delete business rule
- Validation:
  - List, detail, add, edit, delete all confirmed working against real DB
  - Tested on 2026-05-03
  - Browser-tested deletion on 2026-05-20: tenant `Nguyễn Xuân Thanh` with left status was deleted successfully

### [DONE] Contracts (Hop Dong)
- Scope:
  - List contracts from DB
  - View contract detail from DB (tenants + invoices)
  - Create contract with representative and co-tenants
  - Update contract
  - Confirm contract signing and lock editing after both parties sign
  - Delete unsigned contracts from DB
  - Terminate contract
  - Mark co-tenant as left
- Completed:
  - BE: contracts.service.ts, contracts.controller.ts, contracts.routes.ts, contracts.schemas.ts
  - BE routes wired: `/api/contracts` with auth guard
  - BE: added `/api/contracts/:maHopDong/preview.pdf` to generate contract PDF from the DOCX template structure/placeholders
  - BE: added `/api/contracts/:maHopDong/sign` plus `HOPDONG.DaKy`/`NgayKy` to confirm signing and block later contract edits
  - BE: added `DELETE /api/contracts/:maHopDong` to delete unsigned contracts and related invoices in a transaction
  - FE: ContractsList, ContractDetail, ContractForm rewired to real API/DB
  - FE: Contract detail now has `Preview Hợp đồng` button beside `Chỉnh sửa`, opening a PDF preview modal
  - FE: Contract detail now has green `Xác nhận ký` button, confirmation modal, signed state display, and disabled edit button after signing
  - FE: Contract detail now has `Xóa hợp đồng` button before edit, confirmation modal, and redirect to contract list after delete
  - Docs: `docs/SRS/05_HD.md` updated with HD-12 Preview hợp đồng PDF, API, modal behavior, template mapping, validation, and query notes
  - Docs: `docs/SRS/05_HD.md` updated with HD-13 Xác nhận ký hợp đồng, API, validation, UI, and postcondition
  - Docs: `docs/SRS/05_HD.md` updated with HD-14 Xóa hợp đồng, API, validation, UI, and postcondition
  - Business rules enforced via API + DB triggers (active contract uniqueness, representative constraints)
- Validation:
  - BE `npm run typecheck`: PASS
  - FE `npm run build` (with `DISABLE_TAILWIND=1`): PASS
  - BE `npm.cmd run typecheck`: PASS on 2026-05-21
  - FE `npm.cmd run build`: PASS on 2026-05-21
  - BE `npm.cmd run typecheck`: PASS on 2026-05-24 after contract signing workflow
  - FE `npm.cmd run build`: PASS on 2026-05-24 after contract signing workflow
  - BE `npm.cmd run typecheck`: PASS on 2026-05-25 after delete-contract flow
  - FE `npm.cmd run build`: PASS on 2026-05-25 after contract detail/list UI polish
  - DELETE route smoke-tested on 2026-05-25 with fake contract id; returned `CONTRACT_NOT_FOUND` after BE restart, confirming route is wired
  - PDF route smoke-tested with signed local token; returned a valid PDF response
  - PDF layout polish validated on 2026-05-21: terms aligned left consistently and extra blank pages reduced
  - Manual smoke test: login -> contracts list/detail/form loaded real DB data on 2026-05-03
  - Bug fixes applied and validated on 2026-05-03:
    - Login.tsx: switched from manual fetch to `apiFetch`, fixed field from `maChuTro` → `tenDangNhap`
    - ContractsList.tsx: removed stale `filtered` reference (server-side search/filter now active)
    - endDate > startDate cross-field validation in Zod schema (BE + FE tested)
    - Server-side search by keyword / status / maNhaTro confirmed working
  - Full flow test PASSED on 2026-05-03:
    - Login → Tạo nhà trọ → Thêm người thuê → Tạo hợp đồng → Search/filter contracts

### [DONE] Invoices (Hoa Don)
- Scope:
  - List invoices from DB with filter/search/pagination
  - View invoice detail from DB
  - Create invoice from active contract
  - Update invoice (respecting business constraints)
  - Confirm payment manually
  - Load contract options for active contracts
  - Carry forward previous invoice electric/water readings
  - Preview invoice PDF before printing
- Completed:
  - BE: invoices.service.ts, invoices.controller.ts, invoices.routes.ts, invoices.schemas.ts
  - BE routes wired: `/api/invoices` with auth guard
  - BE: invoice creation validates old electric/water readings against the latest previous invoice for the same contract
  - BE: added `/api/invoices/:maHoaDon/preview.pdf` to generate invoice PDF from `Template_Hoa_Don_K57.docx` structure/placeholders
  - FE: InvoicesList, InvoiceDetail, InvoiceForm rewired to real API/DB
  - FE: InvoiceForm auto-fills and locks old electric/water readings from the previous invoice when creating the second invoice onward
  - FE: Invoice detail now has `Preview hóa đơn` button beside `Xác nhận thanh toán`, opening a PDF preview modal
  - SQL ownership/deletion checks aligned with actual schema (`NHATRO.MaChuTro`, `NHATRO.IsDeleted`)
  - Docs: `docs/SRS/06_HDN.md` updated with previous-meter carry-forward rule
  - Docs: `docs/SRS/06_HDN.md` updated with HĐN-11 Preview hóa đơn PDF
- Validation:
  - End-to-end flow validated on 2026-05-04:
    - Login → Create invoice for `HD001` → View invoice detail → Edit amount/due date → Confirm reflected in list/detail
  - Runtime issue fixed: stale detail field mapping causing crash in invoice detail page
  - UI polish validated: summary/checklist sidebar no longer overlays while scrolling on create invoice page
  - BE `npm.cmd run typecheck`: PASS on 2026-05-25 after meter carry-forward and PDF preview
  - FE `npm.cmd run build`: PASS on 2026-05-25 after meter carry-forward and PDF preview
  - Contract options smoke-tested on 2026-05-25: previous meter fields returned correctly
  - Invoice PDF route smoke-tested on 2026-05-25: returned `200 OK`, `application/pdf`
  - Invoice PDF K57 size validated on 2026-05-25: `/MediaBox [0 0 161.574803 737.007874]`

## Next Planned Work
1. Reports module
  - Reporting polish and consistency checks across modules

## UI Enhancements Log (2026-05-05)
- **Dashboard**:
  - Revenue summary strip (TB/tháng, Cao nhất, Tổng 7T) changed to horizontal flex with dividers
  - Occupancy progress bar fixed (inline style height to bypass DISABLE_TAILWIND)
  - Contract expiring threshold changed from 30 → 10 days
- **Tenants list**:
  - Added "Ngày tham gia" column (from `ngayThamGiaGanNhat`)
  - Added sort toggle (Asc/Desc) on that column
- **Contracts list**:
  - Added DB migration `004_contract_created_at.sql` — `NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP` on `HOPDONG`
  - BE `contracts.service.ts` updated to SELECT and expose `ngayTao`
  - Added "Ngày tạo" column in FE table
  - Added sort toggle (Asc/Desc) on Ngày tạo column
  - Added auto-sort by status: Sắp hết hạn → Đang hiệu lực → Đã kết thúc → Đã hủy

## Decisions
- Use this file as mandatory checkpoint after each module completion.
- Keep updates factual and short; avoid speculative status.

## Update Template (copy for each module)
### [STATUS] <Module Name>
- Scope:
  - ...
- Completed:
  - ...
- In progress:
  - ...
- Blockers:
  - ...
- Validation:
  - ...
- Next action:
  - ...
