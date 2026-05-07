# Hệ thống Quản lý Nhà trọ — Hướng dẫn cài đặt

Dự án gồm hai phần độc lập:

| Thư mục | Công nghệ | Cổng mặc định |
|---------|-----------|---------------|
| `BE/`   | Express + TypeScript + MySQL | 4000 |
| `FE/`   | React + Vite + Tailwind CSS  | 5173 |

---

## Yêu cầu hệ thống

- **Node.js** ≥ 18 (Windows: dùng bản cài đặt từ [nodejs.org](https://nodejs.org), **không** dùng qua MSYS/WSL)
- **MySQL** 8.x đang chạy trên máy
- **pnpm** (FE) — cài một lần: `npm install -g pnpm`

---

## 1. Clone repo

```bash
git clone https://github.com/Henrymanimus/NhapMon-group16.git
cd NhapMon-group16
```

---

## 2. Cài đặt Backend

### 2.1 Cấu hình biến môi trường

```bash
cd BE
copy .env.example .env   # Windows
# hoặc: cp .env.example .env   (Linux/macOS)
```

Mở file `.env` và điền thông tin cơ sở dữ liệu:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=rental_house_management

JWT_SECRET=change_me_to_a_long_random_secret
```

### 2.2 Tạo database

Đăng nhập vào MySQL rồi chạy file schema:

```sql
CREATE DATABASE IF NOT EXISTS rental_house_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_house_management;
SOURCE database/final_schema.sql;
```

> Nếu muốn có dữ liệu mẫu, chạy thêm file seed trong `database/seeds/` (không có trong repo, tự tạo theo nhu cầu).

### 2.3 Cài dependencies và khởi động

```bash
cd BE
npm install
npm run dev
```

Server chạy tại: `http://localhost:4000`

Kiểm tra: `GET http://localhost:4000/api/health` → `{ "status": "ok" }`

---

## 3. Cài đặt Frontend

### 3.1 Cài dependencies

```bash
cd FE
pnpm install
```

### 3.2 Cấu hình API URL (tuỳ chọn)

Mặc định FE gọi `http://localhost:4000`. Nếu BE chạy ở cổng khác, sửa trong `FE/src/lib/api.ts`:

```ts
const API_BASE = "http://localhost:4000";
```

### 3.3 Khởi động

> **Lưu ý (Windows):** Phải đặt biến `DISABLE_TAILWIND=1` để tránh lỗi `napi-sys panic` khi dùng `@tailwindcss/vite`.

**Windows (CMD):**
```cmd
set DISABLE_TAILWIND=1 && pnpm run dev
```

**Windows (PowerShell):**
```powershell
$env:DISABLE_TAILWIND="1"; pnpm run dev
```

**Linux/macOS:**
```bash
pnpm run dev
```

Ứng dụng chạy tại: `http://localhost:5173`

---

## 4. Tài khoản demo

| Tên đăng nhập | Mật khẩu | Vai trò |
|--------------|----------|---------|
| `chutro001`  | `123456` | Chủ trọ |

---

## 5. Cấu trúc thư mục chính

```
project/
├── BE/                        # Backend API
│   ├── src/
│   │   ├── modules/           # auth, rooms, tenants, contracts, invoices
│   │   ├── middleware/        # auth, validate, error-handler
│   │   └── db/pool.ts         # MySQL connection pool
│   ├── database/
│   │   └── final_schema.sql   # Schema đầy đủ
│   └── .env.example
├── FE/                        # Frontend React
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # layouts, pages, shared UI
│   │   │   └── routes.tsx
│   │   └── lib/
│   │       ├── api.ts         # apiFetch helper
│   │       └── auth.ts        # token/user helpers
│   └── vite.config.ts
└── docs/                      # Tài liệu SRS, CSDL, BPMN
```

---

## 6. Scripts hữu ích

| Lệnh | Mô tả |
|------|-------|
| `cd BE && npm run dev` | Chạy BE ở chế độ watch |
| `cd BE && npm run build` | Build BE ra `dist/` |
| `cd BE && npm run typecheck` | Kiểm tra TypeScript |
| `cd FE && pnpm run dev` | Chạy FE dev server |
| `cd FE && pnpm run build` | Build FE ra `dist/` |
