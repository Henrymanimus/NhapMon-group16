# Backend (Express + TypeScript)

This backend provides first API slices for authentication and room management, using the existing MySQL schema in `BE/database`.

## 1) Setup

1. Copy `.env.example` to `.env` and adjust DB/JWT values.
2. Install dependencies:

```bash
npm install
```

## 2) Run

```bash
npm run dev
```

Default server URL: `http://localhost:4000`

## 3) API Overview

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/rooms` (Bearer token)
- `GET /api/rooms/:maNhaTro` (Bearer token)
- `POST /api/rooms` (Bearer token)
- `PUT /api/rooms/:maNhaTro` (Bearer token)

## 4) Notes

- `AUTH_ALLOW_PLAINTEXT_FALLBACK=true` can be used temporarily if existing sample users were stored with plaintext password. Keep it `false` for production.
- Room status accepted from APIs: `TRONG`, `BAO_TRI`. `DANG_THUE` should be managed by contract business flow and DB triggers.
