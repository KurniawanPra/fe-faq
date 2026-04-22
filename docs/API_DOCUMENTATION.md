# API Documentation — FAQ Portal PT INL

Dokumentasi ini berisi daftar seluruh endpoint API yang digunakan oleh Frontend (Next.js) untuk berkomunikasi dengan Backend (Laravel).

---

## 🛠️ General Information

- **Base URL (Local):** `http://localhost:8000/api`
- **Base URL (Render):** `https://faq-inl-backend.onrender.com/api` (contoh)
- **Content-Type:** `application/json`
- **Accept:** `application/json`

### Authentication
Beberapa endpoint memerlukan header Authorization:
`Authorization: Bearer {token}`

---

## 📌 Endpoint Summary

| Category | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/login` | Login admin & generate token | 🔓 |
| | `GET` | `/me` | Ambil profil admin aktif | 🔒 |
| | `POST` | `/logout` | Logout & hapus token | 🔒 |
| **Public** | `GET` | `/faqs` | List FAQ untuk pengunjung | 🔓 |
| | `POST` | `/user-inquiries` | Kirim pertanyaan baru dari user | 🔓 |
| **Admin** | `GET` | `/dashboard/stats` | Statistik dashboard overview | 🔒 |
| | `GET` | `/topics` | List semua topik FAQ | 🔒 |
| | `POST` | `/topics` | Buat topik baru | 🔒 |
| | `PUT` | `/topics/{id}` | Update topik | 🔒 |
| | `DELETE` | `/topics/{id}` | Hapus topik | 🔒 |
| | `GET` | `/questions` | List semua pertanyaan | 🔒 |
| | `POST` | `/questions` | Buat pertanyaan baru | 🔒 |
| | `PUT` | `/questions/{id}` | Update pertanyaan | 🔒 |
| | `DELETE` | `/questions/{id}` | Hapus pertanyaan | 🔒 |
| | `GET` | `/user-inquiries` | List masuk pertanyaan user | 🔒 |
| | `PATCH` | `/user-inquiries/{id}/status` | Update status inquiry | 🔒 |
| | `DELETE` | `/user-inquiries/{id}` | Hapus inquiry | 🔒 |

---

## 📖 Endpoint Details

### 1. Authentication

#### `POST /login`
Digunakan untuk masuk ke dashboard admin.
- **Payload:**
  ```json
  {
    "email": "admin@inl.co.id",
    "password": "password"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "token": "1|abc123token...",
      "user": { "id": 1, "name": "Admin", "email": "admin@inl.co.id" }
    }
  }
  ```

---

### 2. FAQ (Public)

#### `GET /faqs`
Mengambil data FAQ yang sudah dijawab oleh admin.
- **Query Params:** `?q=kata_kunci` (opsional)
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "topic": "Sistem",
      "items": [
        { "q": "Pertanyaan?", "a": "Jawaban" }
      ]
    }
  ]
  ```

#### `POST /user-inquiries`
Form "Hubungi Kami" untuk user umum.
- **Payload:**
  ```json
  {
    "nama_user": "Budi",
    "email": "budi@mail.com",
    "jabatan": "Staff",
    "bagian": "IT",
    "pertanyaan": "Isi pertanyaan minimal 10 karakter",
    "jawaban_melalui": "email" // email, whatsapp, telepon
  }
  ```

---

### 3. Management (Admin)

#### `GET /dashboard/stats`
Data chart dan angka untuk dashboard.
- **Response (200):**
  ```json
  {
    "total_pertanyaan": 10,
    "inquiry_pending": 2,
    "pertanyaan_per_topik": [ { "topik": "HR", "count": 5 } ]
  }
  ```

#### `GET /questions`
List pertanyaan untuk tabel admin.
- **Query Params:** `?topik_id=1&search=apa&page=1`
- **Response (200):**
  ```json
  {
    "data": [
      { "id": 1, "pertanyaan": "...", "topik_nama": "..." }
    ],
    "meta": { "total": 100, "current_page": 1 }
  }
  ```

#### `POST /questions`
- **Payload:**
  ```json
  {
    "topik_id": 1,
    "user_id": 1,
    "pertanyaan": "Apa itu INL?",
    "jawaban_admin": "INL adalah..."
  }
  ```

#### `PATCH /user-inquiries/{id}/status`
Update status penanganan pertanyaan user.
- **Payload:**
  ```json
  {
    "status": true, // true = resolved, false = pending
    "catatan_admin": "Sudah dijawab via email"
  }
  ```

---

## ⚠️ Error Handling

| Code | Message | Reason |
| :--- | :--- | :--- |
| 401 | `Unauthenticated` | Token tidak valid atau kosong |
| 422 | `Validation Error` | Data yang dikirim tidak sesuai aturan (misal: email salah format) |
| 404 | `Not Found` | ID yang dicari tidak ada |

---

> **Note for Developer:** Pastikan `NEXT_PUBLIC_API_URL` di file `.env.local` mengarah ke URL backend yang benar.
