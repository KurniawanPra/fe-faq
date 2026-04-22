/**
 * Mock data untuk development.
 * Ganti seluruh isi file ini dengan fetch ke NEXT_PUBLIC_API_URL saat integrasi backend.
 */

import type { Topic, Question, UserInquiry } from "@/types/faq";

// ─── Topics ───────────────────────────────────────────────────────────────────

export const MOCK_TOPICS: Topic[] = [
  { id: 1, nama: "Akun & Registrasi",   urutan: 1 },
  { id: 2, nama: "Password & Keamanan", urutan: 2 },
  { id: 3, nama: "Pembayaran & Tagihan",urutan: 3 },
  { id: 4, nama: "Layanan & Fitur",     urutan: 4 },
];

// ─── Questions ────────────────────────────────────────────────────────────────

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 1,
    pertanyaan: "Bagaimana cara mendaftarkan akun baru?",
    jawaban_admin: "Klik tombol \"Daftar\" di pojok kanan atas, isi formulir dengan nama lengkap, email aktif, dan buat password minimal 8 karakter.",
    created_at: "2026-04-10T08:00:00Z", updated_at: "2026-04-10T08:00:00Z",
  },
  {
    id: 2, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 2,
    pertanyaan: "Apakah pendaftaran akun gratis?",
    jawaban_admin: "Ya, pendaftaran akun dasar sepenuhnya gratis. Untuk fitur premium, tersedia paket berlangganan.",
    created_at: "2026-04-10T08:05:00Z", updated_at: "2026-04-10T08:05:00Z",
  },
  {
    id: 3, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 3,
    pertanyaan: "Bagaimana jika email verifikasi tidak masuk?",
    jawaban_admin: "Cek folder Spam atau Promotions. Jika tidak ada, tunggu 5 menit lalu klik Kirim Ulang.",
    created_at: "2026-04-10T08:10:00Z", updated_at: "2026-04-10T08:10:00Z",
  },
  {
    id: 4, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 4,
    pertanyaan: "Bisakah satu email untuk beberapa akun?",
    jawaban_admin: "Tidak. Setiap alamat email hanya dapat digunakan untuk satu akun.",
    created_at: "2026-04-10T08:15:00Z", updated_at: "2026-04-10T08:15:00Z",
  },
  {
    id: 5, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 5,
    pertanyaan: "Bagaimana cara mengubah data profil?",
    jawaban_admin: "Masuk ke menu Pengaturan lalu Profil. Anda dapat mengubah nama, foto, nomor telepon.",
    created_at: "2026-04-10T08:20:00Z", updated_at: "2026-04-10T08:20:00Z",
  },
  {
    id: 6, topik_id: 1, topik_nama: "Akun & Registrasi",   topik_urutan: 1,
    user_id: 1, urutan: 6,
    pertanyaan: "Apakah akun bisa dihapus permanen?",
    jawaban_admin: "Ya. Masuk ke Pengaturan → Akun → Hapus Akun. Proses ini tidak dapat dibatalkan.",
    created_at: "2026-04-10T08:25:00Z", updated_at: "2026-04-10T08:25:00Z",
  },
  {
    id: 7, topik_id: 2, topik_nama: "Password & Keamanan", topik_urutan: 2,
    user_id: 1, urutan: 1,
    pertanyaan: "Bagaimana cara mereset password yang lupa?",
    jawaban_admin: "Klik Lupa Password di halaman login, masukkan email terdaftar, lalu cek email untuk tautan reset.",
    created_at: "2026-04-11T09:00:00Z", updated_at: "2026-04-11T09:00:00Z",
  },
  {
    id: 8, topik_id: 2, topik_nama: "Password & Keamanan", topik_urutan: 2,
    user_id: 1, urutan: 2,
    pertanyaan: "Apakah ada autentikasi dua faktor (2FA)?",
    jawaban_admin: "Ya, kami mendukung 2FA via Google Authenticator atau SMS OTP.",
    created_at: "2026-04-11T09:05:00Z", updated_at: "2026-04-11T09:05:00Z",
  },
  {
    id: 9, topik_id: 2, topik_nama: "Password & Keamanan", topik_urutan: 2,
    user_id: 1, urutan: 3,
    pertanyaan: "Berapa kali percobaan login sebelum akun dikunci?",
    jawaban_admin: "Setelah 5 kali percobaan gagal berturut-turut, akun akan dikunci sementara selama 15 menit.",
    created_at: "2026-04-11T09:10:00Z", updated_at: "2026-04-11T09:10:00Z",
  },
  {
    id: 10, topik_id: 2, topik_nama: "Password & Keamanan", topik_urutan: 2,
    user_id: 1, urutan: 4,
    pertanyaan: "Apakah data saya dienkripsi?",
    jawaban_admin: "Ya, semua data dienkripsi menggunakan AES-256 saat disimpan dan TLS 1.3 saat ditransmisikan.",
    created_at: "2026-04-11T09:15:00Z", updated_at: "2026-04-11T09:15:00Z",
  },
  {
    id: 11, topik_id: 3, topik_nama: "Pembayaran & Tagihan", topik_urutan: 3,
    user_id: 1, urutan: 1,
    pertanyaan: "Metode pembayaran apa saja yang tersedia?",
    jawaban_admin: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), kartu kredit/debit Visa & Mastercard, GoPay, OVO, DANA.",
    created_at: "2026-04-12T10:00:00Z", updated_at: "2026-04-12T10:00:00Z",
  },
  {
    id: 12, topik_id: 3, topik_nama: "Pembayaran & Tagihan", topik_urutan: 3,
    user_id: 1, urutan: 2,
    pertanyaan: "Apakah bisa minta refund?",
    jawaban_admin: "Refund dapat diajukan dalam 7 hari setelah pembayaran jika layanan belum digunakan.",
    created_at: "2026-04-12T10:05:00Z", updated_at: "2026-04-12T10:05:00Z",
  },
  {
    id: 13, topik_id: 3, topik_nama: "Pembayaran & Tagihan", topik_urutan: 3,
    user_id: 1, urutan: 3,
    pertanyaan: "Apakah ada biaya tersembunyi?",
    jawaban_admin: "Tidak ada. Harga yang tertera sudah final termasuk PPN 11%.",
    created_at: "2026-04-12T10:10:00Z", updated_at: "2026-04-12T10:10:00Z",
  },
  {
    id: 14, topik_id: 4, topik_nama: "Layanan & Fitur",    topik_urutan: 4,
    user_id: 1, urutan: 1,
    pertanyaan: "Apa perbedaan paket Basic dan Premium?",
    jawaban_admin: "Paket Basic memberikan akses ke fitur inti dengan batas penggunaan. Paket Premium membuka semua fitur.",
    created_at: "2026-04-13T11:00:00Z", updated_at: "2026-04-13T11:00:00Z",
  },
  {
    id: 15, topik_id: 4, topik_nama: "Layanan & Fitur",    topik_urutan: 4,
    user_id: 1, urutan: 2,
    pertanyaan: "Apakah ada aplikasi mobile?",
    jawaban_admin: "Ya, tersedia untuk iOS (App Store) dan Android (Google Play Store).",
    created_at: "2026-04-13T11:05:00Z", updated_at: "2026-04-13T11:05:00Z",
  },
];

// ─── User Inquiries ───────────────────────────────────────────────────────────

export const MOCK_INQUIRIES: UserInquiry[] = [
  {
    id: 1, nama_user: "Budi Santoso",  email: "budi.santoso@example.com",
    jabatan: "Staff IT",    bagian: "Divisi Teknologi",
    pertanyaan: "Bagaimana cara mengakses sistem dari luar kantor (remote)?",
    jawaban_melalui: "email", status: false,
    created_at: "2026-04-22T10:30:00Z",
  },
  {
    id: 2, nama_user: "Siti Rahayu",   email: "siti.rahayu@example.com",
    jabatan: "HRD Manager", bagian: "Divisi SDM",
    pertanyaan: "Apakah ada fitur untuk multiple user dalam satu akun perusahaan?",
    jawaban_melalui: "whatsapp", status: false,
    catatan_admin: "Perlu dikonfirmasi ke tim product",
    created_at: "2026-04-22T09:00:00Z",
  },
  {
    id: 3, nama_user: "Ahmad Fauzi",   email: "ahmad.fauzi@example.com",
    jabatan: "Finance",     bagian: "Keuangan",
    pertanyaan: "Bagaimana cara mendapatkan invoice bulanan untuk kebutuhan pelaporan?",
    jawaban_melalui: "email", status: true,
    created_at: "2026-04-21T14:00:00Z",
  },
  {
    id: 4, nama_user: "Dewi Kusuma",   email: "dewi.kusuma@example.com",
    jabatan: "Procurement", bagian: "Pengadaan",
    pertanyaan: "Apakah sistem mendukung purchase order dan approval multi-level?",
    jawaban_melalui: "telepon", status: false,
    created_at: "2026-04-21T11:15:00Z",
  },
  {
    id: 5, nama_user: "Reza Putra",    email: "reza.putra@example.com",
    jabatan: "IT Support",  bagian: "Divisi Teknologi",
    pertanyaan: "Bagaimana prosedur reset password untuk pengguna yang lupa?",
    jawaban_melalui: "email", status: true,
    created_at: "2026-04-20T16:00:00Z",
  },
  {
    id: 6, nama_user: "Indah Permata", email: "indah.permata@example.com",
    jabatan: "Marketing",   bagian: "Pemasaran",
    pertanyaan: "Apakah laporan analytics bisa diexport ke format Excel atau PDF?",
    jawaban_melalui: "email", status: false,
    created_at: "2026-04-20T13:30:00Z",
  },
  {
    id: 7, nama_user: "Dimas Wahyu",   email: "dimas.wahyu@example.com",
    jabatan: "Operations",  bagian: "Operasional",
    pertanyaan: "Berapa kapasitas maksimum data yang bisa disimpan dalam satu akun?",
    jawaban_melalui: "whatsapp", status: true,
    created_at: "2026-04-19T10:00:00Z",
  },
  {
    id: 8, nama_user: "Rina Marlina",  email: "rina.marlina@example.com",
    jabatan: "Legal",       bagian: "Hukum & Kepatuhan",
    pertanyaan: "Apakah sistem sudah tersertifikasi ISO 27001 dan memenuhi regulasi PDPA?",
    jawaban_melalui: "email", status: true,
    catatan_admin: "Sudah dijawab, sertifikasi ISO 27001 aktif",
    created_at: "2026-04-18T08:45:00Z",
  },
  {
    id: 9, nama_user: "Hendra Gunawan",email: "hendra.gunawan@example.com",
    jabatan: "COO",         bagian: "Direksi",
    pertanyaan: "Apakah tersedia demo khusus untuk level enterprise dengan kebutuhan kustomisasi?",
    jawaban_melalui: "telepon", status: false,
    created_at: "2026-04-17T15:00:00Z",
  },
  {
    id: 10,nama_user: "Fitri Anggraini",email: "fitri.anggraini@example.com",
    jabatan: "Data Analyst", bagian: "Analitik",
    pertanyaan: "Apakah API tersedia untuk integrasi dengan BI tools seperti Tableau atau Power BI?",
    jawaban_melalui: "email", status: false,
    created_at: "2026-04-16T09:30:00Z",
  },
];
