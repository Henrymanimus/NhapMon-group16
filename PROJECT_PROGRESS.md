# Project Progress Tracker

Last updated: 2026-05-05 (UI polish & enhancements across all modules)
Owner: Team + AI pair-programming

## Purpose
Single source of truth to track:
- What has been completed
- What is currently in progress
- What is next
- Decisions and blockers

Update this file at the end of each completed module to keep AI context stable and avoid hallucination/drift.

## Current Overall Status
- Auth module: DONE (BE + FE integration, Account tab wired to real API, profile update + password change completed)
- Rooms module: DONE and tested CRUD
- Tenants module: DONE and tested CRUD + UI enhancements (sort by join date)
- Contracts module: DONE (BE + FE integration) + UI enhancements (NgayTao column, sort by created date, auto-sort by status)
- Invoices module: DONE (BE + FE integration to real DB + UI polish validated)
- Dashboard: DONE (real API data, revenue strip horizontal layout, occupancy progress bar fixed, expiring threshold 10 days)
- Reports: DEFERRED — UI skeleton exists (`Reports.tsx`) but route + sidebar item commented out. Will be implemented in the future.

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
- Next: final polish / presentation prep.

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
  - Delete guarded by business rule (block if tenant has active contract)
- Validation:
  - List, detail, add, edit, delete all confirmed working against real DB
  - Tested on 2026-05-03

### [DONE] Contracts (Hop Dong)
- Scope:
  - List contracts from DB
  - View contract detail from DB (tenants + invoices)
  - Create contract with representative and co-tenants
  - Update contract
  - Terminate contract
  - Mark co-tenant as left
- Completed:
  - BE: contracts.service.ts, contracts.controller.ts, contracts.routes.ts, contracts.schemas.ts
  - BE routes wired: `/api/contracts` with auth guard
  - FE: ContractsList, ContractDetail, ContractForm rewired to real API/DB
  - Business rules enforced via API + DB triggers (active contract uniqueness, representative constraints)
- Validation:
  - BE `npm run typecheck`: PASS
  - FE `npm run build` (with `DISABLE_TAILWIND=1`): PASS
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
- Completed:
  - BE: invoices.service.ts, invoices.controller.ts, invoices.routes.ts, invoices.schemas.ts
  - BE routes wired: `/api/invoices` with auth guard
  - FE: InvoicesList, InvoiceDetail, InvoiceForm rewired to real API/DB
  - SQL ownership/deletion checks aligned with actual schema (`NHATRO.MaChuTro`, `NHATRO.IsDeleted`)
- Validation:
  - End-to-end flow validated on 2026-05-04:
    - Login → Create invoice for `HD001` → View invoice detail → Edit amount/due date → Confirm reflected in list/detail
  - Runtime issue fixed: stale detail field mapping causing crash in invoice detail page
  - UI polish validated: summary/checklist sidebar no longer overlays while scrolling on create invoice page

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
