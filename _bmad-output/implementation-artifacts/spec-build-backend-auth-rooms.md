---
title: 'Build backend skeleton with auth and rooms APIs'
type: 'feature'
created: '2026-05-02'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/BE/database/README.md'
  - '{project-root}/BE/database/migrations/001_init_schema.sql'
  - '{project-root}/BE/database/migrations/002_business_rules.sql'
  - '{project-root}/docs/readme.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The project already has a completed MySQL schema but no executable backend server to expose authentication and room management APIs for frontend integration.

**Approach:** Build a minimal Express + TypeScript backend with shared middleware, MySQL access helpers, JWT authentication, and first feature slices for auth and rooms.

## Boundaries & Constraints

**Always:** Use existing MySQL tables and trigger rules; validate request payloads with zod; protect room routes with JWT middleware; return consistent JSON error shape.

**Ask First:** Add refresh token flow; add soft-delete; include advanced pagination/filtering semantics.

**Never:** Modify existing DB migrations/triggers in this slice; bypass contract/room status business rules; add unrelated domain modules.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| AUTH_LOGIN_OK | Valid username/password for CHUTRO | Return signed JWT + owner profile | N/A |
| AUTH_LOGIN_FAIL | Unknown username or wrong password | Return 401 with stable error code | No credential leak |
| ROOM_CREATE_OK | Valid payload + owner exists | Insert NHATRO and return created row | N/A |
| ROOM_CREATE_DUP | MaNhaTro already exists | Return 409 conflict | Stable DB-to-API error mapping |
| ROOM_UPDATE_NOT_FOUND | Unknown room id | Return 404 | Stable not-found shape |

</frozen-after-approval>

## Code Map

- `BE/database/migrations/001_init_schema.sql` -- Source of CHUTRO and NHATRO schema contracts.
- `BE/database/migrations/002_business_rules.sql` -- Trigger behavior constraining room lifecycle.
- `BE/database/README.md` -- Local DB application and integration guardrails.

## Tasks & Acceptance

**Execution:**
- [x] `BE/package.json` -- Add Node/TS backend scripts and runtime dependencies -- enable local API execution.
- [x] `BE/tsconfig.json` -- Configure TypeScript compilation for Node 20 -- ensure strict and predictable build.
- [x] `BE/.env.example` -- Define environment contract for DB/JWT/server settings -- consistent startup.
- [x] `BE/src/app.ts` -- Compose Express app with security middleware and error handling -- shared runtime foundation.
- [x] `BE/src/server.ts` -- Start HTTP server and verify DB connectivity -- production-like boot flow.
- [x] `BE/src/db/*` -- Implement mysql2 pool and transaction helpers -- safe DB access.
- [x] `BE/src/modules/auth/*` -- Implement login and current-user endpoints with bcrypt/JWT -- authentication slice.
- [x] `BE/src/modules/rooms/*` -- Implement list/get/create/update rooms with zod validation -- first CRUD slice.

**Acceptance Criteria:**
- Given valid CHUTRO credentials, when posting login payload, then backend returns a JWT and owner profile.
- Given missing or invalid JWT, when calling any room endpoint, then backend returns 401.
- Given valid room payload, when creating room, then NHATRO row is inserted and returned.
- Given duplicate room code, when creating room, then backend returns 409 with structured message.
- Given unknown room id, when fetching or updating room, then backend returns 404.

## Spec Change Log

## Design Notes

- Keep SQL-first design by using explicit query files/functions close to domain modules.
- Normalize API responses to camelCase while preserving Vietnamese DB column names in SQL layer.
- Use middleware composition (`requireAuth`, `validate`) to keep route handlers small.

## Verification

**Commands:**
- `cd BE && npm install` -- expected: dependencies installed successfully.
- `cd BE && npm run typecheck` -- expected: TypeScript has no errors.
- `cd BE && npm run build` -- expected: dist output created with no compile errors.
