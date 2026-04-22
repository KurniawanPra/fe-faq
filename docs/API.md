# API Reference — FAQ Portal PT INL

> **Base URL Frontend (Next.js):** `NEXT_PUBLIC_APP_URL` (lihat `.env.example`)
> **Base URL Backend (Laravel):** `NEXT_PUBLIC_API_URL` (lihat `.env.example`)
>
> Semua endpoint di bawah ini adalah **API Routes Next.js** (stub/mock).
> Saat production, frontend akan memanggil backend Laravel menggunakan `NEXT_PUBLIC_API_URL`.

---

## Daftar Isi

1. [Konvensi & Format Umum](#1-konvensi--format-umum)
2. [Authentication](#2-authentication)
3. [FAQ Portal — Publik](#3-faq-portal--publik)
4. [User Inquiry — Publik](#4-user-inquiry--publik)
5. [Topics — Admin](#5-topics--admin)
6. [Questions — Admin](#6-questions--admin)
7. [User Inquiries — Admin](#7-user-inquiries--admin)
8. [Error Reference](#8-error-reference)
9. [TypeScript Types](#9-typescript-types)

---

## 1. Konvensi & Format Umum

### Headers

Semua request ke endpoint yang **memerlukan autentikasi** wajib menyertakan header:

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

### Format Response Sukses

```json
{
  "success": true,
  "data": { ... },
  "message": "Opsional, hanya untuk POST/PUT/DELETE"
}
```

### Format Response List (Paginasi)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 128,
    "last_page": 9
  }
}
```

### Format Response Error

```json
{
  "success": false,
  "error": "Pesan error singkat",
  "errors": {
    "field_name": ["Pesan validasi detail"]
  }
}
```

### HTTP Status Codes

| Code | Arti                                            |
| :--- | :---------------------------------------------- |
| 200  | OK — Request berhasil                           |
| 201  | Created — Resource berhasil dibuat              |
| 400  | Bad Request — Body/param tidak valid            |
| 401  | Unauthorized — Token tidak ada atau expired     |
| 403  | Forbidden — Tidak punya akses ke resource ini   |
| 404  | Not Found — Resource tidak ditemukan            |
| 422  | Unprocessable Entity — Validasi gagal           |
| 429  | Too Many Requests — Rate limit terlampaui       |
| 500  | Internal Server Error — Error di sisi server    |

---

## 2. Authentication

> **Catatan:** Endpoint ini diimplementasi di **backend Laravel**, bukan di Next.js.

### `POST /api/login`

Login admin dan mendapat token sesi.

**Access:** Public

**Request Body:**

```json
{
  "email": "admin@inl.co.id",
  "password": "password123"
}
```

**Field:**

| Field      | Type   | Required | Keterangan              |
| :--------- | :----- | :------: | :---------------------- |
| `email`    | string | ✅       | Email terdaftar admin   |
| `password` | string | ✅       | Password akun admin     |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "token": "1|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_at": "2026-04-23T11:00:00Z",
    "user": {
      "id": 1,
      "name": "Admin PT INL",
      "email": "admin@inl.co.id",
      "role": "admin"
    }
  }
}
```

**Response `401 Unauthorized`:**

```json
{
  "success": false,
  "error": "Email atau password salah"
}
```

---

### `POST /api/logout`

Logout dan invalidate token aktif.

**Access:** 🔒 Requires Auth

**Request Body:** *(none)*

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Berhasil logout"
}
```

---

## 3. FAQ Portal — Publik

### `GET /api/faqs`

Mengambil semua topik FAQ beserta daftar pertanyaan di dalamnya.
Digunakan oleh halaman utama frontend (`/`).

**Access:** Public

**Query Parameters (Opsional):**

| Param | Type   | Contoh          | Keterangan                                      |
| :---- | :----- | :-------------- | :---------------------------------------------- |
| `q`   | string | `?q=password`   | Filter pertanyaan yang mengandung kata kunci ini |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "topic": "Akun & Registrasi",
      "items": [
        {
          "q": "Bagaimana cara mendaftarkan akun baru?",
          "a": "Klik tombol Daftar di pojok kanan atas..."
        },
        {
          "q": "Apakah pendaftaran akun gratis?",
          "a": "Ya, pendaftaran akun dasar sepenuhnya gratis."
        }
      ]
    },
    {
      "id": 2,
      "topic": "Password & Keamanan",
      "items": [
        {
          "q": "Bagaimana cara mereset password?",
          "a": "Klik Lupa Password di halaman login..."
        }
      ]
    }
  ]
}
```

> **Catatan Backend:** Data diurutkan berdasarkan kolom `urutan` (ASC) dari tabel `topik`.
> Pencarian `?q=` sebaiknya diimplementasikan di level database (`LIKE %keyword%` atau Full-Text Search).

---

## 4. User Inquiry — Publik

### `POST /api/user-inquiries`

Menyimpan pertanyaan baru yang diajukan oleh pengguna umum melalui form "Hubungi Kami".
Memetakan ke tabel ERD: `pertanyaan_from_user`.

**Access:** Public

**Request Body:**

```json
{
  "nama_user":     "Budi Santoso",
  "email":         "budi@example.com",
  "jabatan":       "Staff IT",
  "bagian":        "Divisi Teknologi",
  "pertanyaan":    "Bagaimana cara mengakses sistem dari rumah?",
  "jawaban_melalui": "email"
}
```

**Field:**

| Field             | Type   | Required | Keterangan                                          |
| :---------------- | :----- | :------: | :-------------------------------------------------- |
| `nama_user`       | string | ✅       | Nama lengkap pengguna                               |
| `email`           | string | ✅       | Email aktif untuk dihubungi balik                   |
| `jabatan`         | string | ✅       | Jabatan pengguna di perusahaan                      |
| `bagian`          | string | ✅       | Divisi/departemen pengguna                          |
| `pertanyaan`      | string | ✅       | Isi pertanyaan (min. 10 karakter)                   |
| `jawaban_melalui` | string | ✅       | Media balasan: `"email"` \| `"whatsapp"` \| `"telepon"` |

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Pertanyaan berhasil dikirim. Kami akan menghubungi Anda segera.",
  "data": {
    "id": 42,
    "nama_user": "Budi Santoso",
    "email": "budi@example.com",
    "jabatan": "Staff IT",
    "bagian": "Divisi Teknologi",
    "pertanyaan": "Bagaimana cara mengakses sistem dari rumah?",
    "jawaban_melalui": "email",
    "status": false,
    "created_at": "2026-04-22T11:57:00Z"
  }
}
```

**Response `400 Bad Request`:**

```json
{
  "success": false,
  "error": "nama_user is required"
}
```

**Response `422 Unprocessable Entity`:**

```json
{
  "success": false,
  "errors": {
    "email": ["Format email tidak valid"],
    "pertanyaan": ["Pertanyaan minimal 10 karakter"]
  }
}
```

---

## 5. Topics — Admin

> Semua endpoint di seksi ini memerlukan autentikasi admin.

### `GET /api/topics`

Mengambil semua topik FAQ yang tersedia, diurutkan berdasarkan `urutan`.

**Access:** 🔒 Requires Auth

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    { "id": 1, "nama": "Akun & Registrasi",   "urutan": 1 },
    { "id": 2, "nama": "Password & Keamanan",  "urutan": 2 },
    { "id": 3, "nama": "Pembayaran & Tagihan", "urutan": 3 },
    { "id": 4, "nama": "Layanan & Fitur",      "urutan": 4 }
  ]
}
```

---

### `POST /api/topics`

Membuat topik FAQ baru.

**Access:** 🔒 Requires Auth

**Request Body:**

```json
{
  "nama": "Kebijakan Privasi",
  "urutan": 5
}
```

**Field:**

| Field    | Type    | Required | Keterangan                           |
| :------- | :------ | :------: | :----------------------------------- |
| `nama`   | string  | ✅       | Nama topik (unik, maks. 100 karakter)|
| `urutan` | integer | ✅       | Urutan tampil di frontend (min. 1)   |

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Topik berhasil dibuat",
  "data": {
    "id": 5,
    "nama": "Kebijakan Privasi",
    "urutan": 5
  }
}
```

---

### `PUT /api/topics/{id}`

Update data topik berdasarkan ID.

**Access:** 🔒 Requires Auth

**Path Parameter:** `id` — ID topik yang ingin diupdate

**Request Body:**

```json
{
  "nama": "Kebijakan & Privasi",
  "urutan": 5
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Topik berhasil diupdate",
  "data": {
    "id": 5,
    "nama": "Kebijakan & Privasi",
    "urutan": 5
  }
}
```

**Response `404 Not Found`:**

```json
{
  "success": false,
  "error": "Topik dengan ID 99 tidak ditemukan"
}
```

---

### `DELETE /api/topics/{id}`

Menghapus topik beserta semua pertanyaan di dalamnya.

**Access:** 🔒 Requires Auth

> ⚠️ **Cascading Delete:** Menghapus topik akan menghapus seluruh pertanyaan (`pertanyaan`) yang berelasi. Pastikan konfirmasi dari user sebelum memanggil endpoint ini.

**Path Parameter:** `id` — ID topik yang ingin dihapus

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Topik dan seluruh pertanyaan terkait berhasil dihapus"
}
```

---

## 6. Questions — Admin

> Semua endpoint di seksi ini memerlukan autentikasi admin.

### `GET /api/questions`

Mengambil semua pertanyaan FAQ. Mendukung filter berdasarkan topik.

**Access:** 🔒 Requires Auth

**Query Parameters (Opsional):**

| Param        | Type    | Contoh                    | Keterangan                                         |
| :----------- | :------ | :------------------------ | :------------------------------------------------- |
| `topik_id`   | integer | `?topik_id=1`             | Filter berdasarkan ID topik                        |
| `sort`       | string  | `?sort=urutan`            | Sort field: `urutan` \| `topik_urutan` \| `created_at` |
| `direction`  | string  | `?direction=asc`          | Arah sort: `asc` \| `desc` (default: `asc`)         |
| `search`     | string  | `?search=password`        | Cari dalam pertanyaan & jawaban                    |
| `page`       | integer | `?page=2`                 | Halaman (default: 1)                               |
| `per_page`   | integer | `?per_page=20`            | Item per halaman (default: 15)                     |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "topik_id": 1,
      "topik_nama": "Akun & Registrasi",
      "topik_urutan": 1,
      "user_id": 1,
      "urutan": 1,
      "pertanyaan": "Bagaimana cara mendaftarkan akun baru?",
      "jawaban_admin": "Klik tombol Daftar di pojok kanan atas...",
      "created_at": "2026-04-22T10:00:00Z",
      "updated_at": "2026-04-22T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 28,
    "last_page": 2
  }
}
```

---

### `POST /api/questions`

Membuat pertanyaan FAQ baru beserta jawaban admin.

**Access:** 🔒 Requires Auth

**Request Body:**

```json
{
  "topik_id":     1,
  "user_id":      1,
  "pertanyaan":   "Apakah ada fitur dark mode?",
  "jawaban_admin": "Saat ini fitur dark mode sedang dalam pengembangan dan akan tersedia di versi berikutnya."
}
```

**Field:**

| Field           | Type    | Required | Keterangan                                   |
| :-------------- | :------ | :------: | :------------------------------------------- |
| `topik_id`      | integer | ✅       | ID topik yang terkait (FK)                   |
| `user_id`       | integer | ✅       | ID admin yang membuat                        |
| `urutan`        | integer | ✅       | Urutan pertanyaan dalam topik (min. 1)       |
| `pertanyaan`    | string  | ✅       | Teks pertanyaan                              |
| `jawaban_admin` | string  | ❌       | Jawaban admin (bisa diisi belakangan)        |

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Pertanyaan berhasil ditambahkan",
  "data": {
    "id": 29,
    "topik_id": 1,
    "user_id": 1,
    "pertanyaan": "Apakah ada fitur dark mode?",
    "jawaban_admin": "Saat ini fitur dark mode sedang dalam pengembangan...",
    "created_at": "2026-04-22T12:00:00Z"
  }
}
```

---

### `PUT /api/questions/{id}`

Update pertanyaan atau jawaban berdasarkan ID.

**Access:** 🔒 Requires Auth

**Path Parameter:** `id` — ID pertanyaan yang ingin diupdate

**Request Body:**

```json
{
  "jawaban_admin": "Jawaban yang sudah diperbarui."
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Pertanyaan berhasil diupdate",
  "data": {
    "id": 29,
    "topik_id": 1,
    "user_id": 1,
    "pertanyaan": "Apakah ada fitur dark mode?",
    "jawaban_admin": "Jawaban yang sudah diperbarui.",
    "created_at": "2026-04-22T12:00:00Z"
  }
}
```

---

### `DELETE /api/questions/{id}`

Menghapus satu pertanyaan berdasarkan ID.

**Access:** 🔒 Requires Auth

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Pertanyaan berhasil dihapus"
}
```

---

## 7. User Inquiries — Admin

> Semua endpoint di seksi ini memerlukan autentikasi admin.

### `GET /api/user-inquiries`

Mengambil semua pertanyaan yang masuk dari pengguna umum.

**Access:** 🔒 Requires Auth

**Query Parameters (Opsional):**

| Param              | Type    | Contoh                      | Keterangan                                              |
| :----------------- | :------ | :-------------------------- | :------------------------------------------------------ |
| `status`           | boolean | `?status=false`             | Filter status: `true` (selesai) \| `false` (pending)    |
| `jawaban_melalui`  | string  | `?jawaban_melalui=email`    | Filter channel: `email` \| `whatsapp` \| `telepon`      |
| `search`           | string  | `?search=nama+pengirim`     | Cari dalam nama, email, jabatan, bagian, pertanyaan     |
| `sort`             | string  | `?sort=created_at`          | Sort field: `created_at` (default)                      |
| `direction`        | string  | `?direction=desc`           | Arah sort: `asc` \| `desc` (default: `desc`)            |
| `page`             | integer | `?page=1`                   | Halaman (default: 1)                                    |
| `per_page`         | integer | `?per_page=15`              | Item per halaman (default: 15)                          |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "nama_user": "Budi Santoso",
      "email": "budi@example.com",
      "jabatan": "Staff IT",
      "bagian": "Divisi Teknologi",
      "pertanyaan": "Bagaimana cara mengakses sistem dari rumah?",
      "jawaban_melalui": "email",
      "status": false,
      "catatan_admin": null,
      "created_at": "2026-04-22T11:57:00Z",
      "updated_at": "2026-04-22T11:57:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 12,
    "last_page": 1
  }
}
```

---

### `PATCH /api/user-inquiries/{id}/status`

Mengubah status penanganan pertanyaan user dari **Pending** (`false`) menjadi **Resolved** (`true`).

**Access:** 🔒 Requires Auth

**Path Parameter:** `id` — ID inquiry yang ingin diupdate

**Request Body:**

```json
{
  "status": true
}
```

**Field:**

| Field    | Type    | Required | Keterangan                            |
| :------- | :------ | :------: | :------------------------------------ |
| `status` | boolean | ✅       | `true` = Selesai, `false` = Pending   |

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Status berhasil diupdate menjadi Selesai",
  "data": {
    "id": 42,
    "status": true
  }
}
```

**Response `404 Not Found`:**

```json
{
  "success": false,
  "error": "Inquiry dengan ID 99 tidak ditemukan"
}
```

---

### `DELETE /api/user-inquiries/{id}`

Menghapus satu inquiry pengguna berdasarkan ID.

**Access:** 🔒 Requires Auth

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Inquiry berhasil dihapus"
}
```

---

## 8. Error Reference

| Kode | Situasi                             | Contoh Response Body                                           |
| :--- | :---------------------------------- | :------------------------------------------------------------- |
| 400  | Field wajib kosong                  | `{ "error": "nama_user is required" }`                         |
| 401  | Token tidak ada / expired           | `{ "error": "Unauthenticated" }`                               |
| 403  | Role tidak cukup (bukan admin)      | `{ "error": "Akses ditolak" }`                                 |
| 404  | Resource tidak ditemukan            | `{ "error": "Topik dengan ID 99 tidak ditemukan" }`            |
| 422  | Validasi Laravel gagal              | `{ "errors": { "email": ["Format email tidak valid"] } }`      |
| 429  | Rate limit terlampaui               | `{ "error": "Too Many Requests. Coba lagi dalam 60 detik." }`  |
| 500  | Error server                        | `{ "error": "Internal Server Error" }`                         |

---

## 9. TypeScript Types

Semua tipe didefinisikan di `src/types/faq.ts` dan bisa langsung di-import:

```typescript
import type {
  FAQItem,          // { q: string; a: string }
  FAQTopic,         // { id; topic; items: FAQItem[] }
  APIResponse,      // { success: boolean; data: T; message?: string }
  PaginatedResponse,// APIResponse<T[]> + meta pagination
  Topic,            // { id; nama; urutan }
  Question,         // { id; topik_id; topik_nama; topik_urutan; user_id; urutan; pertanyaan; jawaban_admin; created_at; updated_at }
  QuestionFormData, // Omit<Question, 'id'|'created_at'|'updated_at'|'topik_nama'|'topik_urutan'>
  UserInquiry,      // { id; nama_user; email; jabatan; bagian; pertanyaan; jawaban_melalui; status; catatan_admin?; created_at; updated_at }
  JawabanMelalui,   // 'email' | 'whatsapp' | 'telepon'
  DashboardStats,   // Stats untuk dashboard overview
} from "@/types/faq";
```

**Contoh penggunaan fetch dari frontend:**

```typescript
// GET /api/faqs
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
const json: APIResponse<FAQTopic[]> = await res.json();
const topics = json.data; // FAQTopic[]
```

```typescript
// POST /api/user-inquiries
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-inquiries`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nama_user: "Budi",
    email: "budi@example.com",
    jabatan: "Staff",
    bagian: "IT",
    pertanyaan: "Pertanyaan saya...",
    jawaban_melalui: "email",
  }),
});
const json: APIResponse<UserInquiry> = await res.json();
```

```typescript
// GET /api/topics (Admin — with auth token)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/topics`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
const json: APIResponse<Topic[]> = await res.json();
```

---

> 📄 Lihat [`.env.example`](../.env.example) untuk daftar environment variable yang perlu dikonfigurasi.
> 🔧 Next.js API stubs tersedia di `app/api/` untuk development tanpa backend.
