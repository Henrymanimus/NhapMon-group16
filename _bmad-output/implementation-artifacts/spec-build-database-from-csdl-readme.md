---
title: 'Build MySQL database from CSDL and readme rules'
type: 'feature'
created: '2026-05-02'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/docs/CSDL.md'
  - '{project-root}/docs/readme.md'
  - '{project-root}/docs/BPMN.MD'
  - '{project-root}/_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The project has frontend routes and domain documents but has no real database implementation yet. Without a concrete schema, constraints, and migration workflow, backend/API work cannot safely start and core business invariants can be violated.

**Approach:** Build a MySQL-first database foundation directly from the ER model in CSDL and the 10 business rules in readme. Deliver executable SQL migration + seed + guard triggers so data integrity is enforced at the database layer before backend integration.

## Boundaries & Constraints

**Always:**
- Use MySQL 8.x with utf8mb4 and a deterministic migration file under source control.
- Implement the six business tables from CSDL: ChuTro, NhaTro, NguoiThue, HopDong, HopDong_NguoiThue, HoaDon.
- Keep IDs as VARCHAR codes as described by CSDL (no implicit numeric auto-increment substitution).
- Enforce referential integrity via foreign keys matching documented relationships.
- Enforce readme rules in DB where possible:
  - No direct tenant-to-room linkage outside contract tables.
  - One active contract per room at a time.
  - One invoice per contract per month/year.
  - Paid invoice monetary fields must be immutable.
  - Invoice attaches to contract only.
- Keep room and contract statuses compatible with BPMN/domain states.
- Provide seed data for one realistic happy path and one debt/unpaid scenario.

**Ask First:**
- Whether to keep passwords plaintext for prototype parity with docs or enforce hashing-ready column policy now.
- Whether to include audit columns (created_at, updated_at, deleted_at) on all tables in v1.
- Whether to use Vietnamese enum strings exactly as docs text or normalize to machine enums.

**Never:**
- Never create application-specific API/service code in this scope.
- Never drop/alter FE files in this scope.
- Never bypass documented business rules with “validate later in backend”.
- Never create duplicate active contracts for a room or duplicate monthly invoices for a contract.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CREATE_ACTIVE_CONTRACT_HAPPY | Existing room status = Trống, valid representative tenant exists in contract members | Contract inserts successfully and room transitions to Đang thuê | Transaction rollback on any FK/state failure |
| CREATE_ACTIVE_CONTRACT_DUPLICATE | Room already has another active contract | Insert rejected | SQLSTATE with business-rule violation message |
| CREATE_MONTHLY_INVOICE_HAPPY | Existing contract + target month/year has no invoice | Invoice created with unique month/year per contract | Reject on negative meter deltas |
| CREATE_MONTHLY_INVOICE_DUPLICATE | Existing invoice for same contract and month/year | Insert rejected | Unique constraint violation |
| UPDATE_PAID_INVOICE_MONEY | Invoice status = Đã thanh toán; update tries to change TienDien/TienNuoc/TienThue/TongTien | Update blocked | Trigger raises explicit error |

</frozen-after-approval>

## Code Map

- `docs/CSDL.md` -- Canonical ER structure and base attributes/relationships.
- `docs/readme.md` -- Ten mandatory business integrity rules.
- `docs/BPMN.MD` -- Workflow/status transitions to reflect in constraints.
- `_bmad-output/project-context.md` -- Consolidated guardrails already derived from docs.

## Tasks & Acceptance

**Execution:**
- [x] `BE/database/migrations/001_init_schema.sql` -- create schema, tables, PK/FK, unique/indexes, check constraints where MySQL supports -- foundational relational model.
- [x] `BE/database/migrations/002_business_rules.sql` -- add triggers/procedures for active-contract exclusivity, paid-invoice money immutability, and status synchronization rules -- enforce invariants close to data.
- [x] `BE/database/seeds/001_seed_baseline.sql` -- insert deterministic baseline landlord/rooms/tenants/contracts/invoices including unpaid case -- make local testing reproducible.
- [x] `BE/database/README.md` -- document apply/reset/verify commands and rule-to-constraint mapping table -- ensure student-friendly onboarding.
- [x] `BE/database/verify/verify_rules.sql` -- script of pass/fail validation statements for edge cases in matrix -- objective integrity verification.

**Acceptance Criteria:**
- Given a room already bound to an active contract, when inserting another active contract for the same room, then the database rejects it with a business-rule error.
- Given an existing invoice for a contract in month M/year Y, when inserting another invoice for same contract/month/year, then the database rejects it by unique constraint.
- Given an invoice marked Đã thanh toán, when any monetary field is updated, then the database blocks the update.
- Given a new active contract creation transaction succeeds, when querying related room status, then status is Đang thuê.
- Given schema + seed scripts run on an empty MySQL database, when verification script executes, then all expected success checks pass and all intentional violation checks fail.

## Spec Change Log

## Design Notes

- Rule coverage strategy:
  - Declarative first (PK/FK/UNIQUE/CHECK/index).
  - Trigger second for cross-row and stateful constraints.
  - Verification scripts to prove each readme invariant.
- Keep migration files append-only and idempotent-safe for local reruns using explicit guards.
- Table/column naming should stay close to domain docs to reduce cognitive load for year-2 student contributors.

## Verification

**Commands:**
- `mysql -u <user> -p <db_name> < BE/database/migrations/001_init_schema.sql` -- expected: schema and base constraints created with no errors.
- `mysql -u <user> -p <db_name> < BE/database/migrations/002_business_rules.sql` -- expected: triggers/procedures created with no errors.
- `mysql -u <user> -p <db_name> < BE/database/seeds/001_seed_baseline.sql` -- expected: baseline data inserted successfully.
- `mysql -u <user> -p <db_name> < BE/database/verify/verify_rules.sql` -- expected: validation output shows required pass/fail outcomes per rule.

## Suggested Review Order

**Business Rule Enforcement**

- Start here to understand invariant enforcement and state synchronization strategy.
  [`002_business_rules.sql:19`](../../BE/database/migrations/002_business_rules.sql#L19)

- Representative auto-membership keeps contract representative rule coherent at write time.
  [`002_business_rules.sql:84`](../../BE/database/migrations/002_business_rules.sql#L84)

- Contract update logic handles room moves, endings, and representative handoffs.
  [`002_business_rules.sql:112`](../../BE/database/migrations/002_business_rules.sql#L112)

- Paid invoice protections and rollback blocking live in one guard point.
  [`002_business_rules.sql:255`](../../BE/database/migrations/002_business_rules.sql#L255)

**Schema Foundation**

- Validate enum/status vocabulary and relational boundary design first.
  [`001_init_schema.sql:21`](../../BE/database/migrations/001_init_schema.sql#L21)

- Contract and contract-member tables encode the core tenancy model.
  [`001_init_schema.sql:55`](../../BE/database/migrations/001_init_schema.sql#L55)

- Invoice uniqueness and meter constraints enforce monthly billing integrity.
  [`001_init_schema.sql:102`](../../BE/database/migrations/001_init_schema.sql#L102)

**Verification and Fixtures**

- Dynamic verification harness records PASS/FAIL with expected error matching.
  [`verify_rules.sql:23`](../../BE/database/verify/verify_rules.sql#L23)

- Happy/negative verification cases cover active contract and invoice invariants.
  [`verify_rules.sql:69`](../../BE/database/verify/verify_rules.sql#L69)

- Seed scenarios provide one paid and one unpaid invoice baseline.
  [`001_seed_baseline.sql:29`](../../BE/database/seeds/001_seed_baseline.sql#L29)

**Documentation**

- Rule-to-constraint traceability for reviewer and backend onboarding.
  [`README.md:12`](../../BE/database/README.md#L12)
