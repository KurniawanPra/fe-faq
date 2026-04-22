import type { FAQTopic } from "@/types/faq";

/**
 * Data FAQ statis yang ditampilkan di halaman utama.
 * Nantinya data ini akan digantikan dengan fetch dari API /api/faqs.
 */
export const FAQ_DATA: FAQTopic[] = [
  {
    id: 1,
    topic: "Akun & Registrasi",
    items: [
      {
        q: "Bagaimana cara mendaftarkan akun baru?",
        a: 'Klik tombol "Daftar" di pojok kanan atas, isi formulir dengan nama lengkap, email aktif, dan buat password minimal 8 karakter. Setelah itu verifikasi email yang kami kirimkan ke inbox Anda.',
      },
      {
        q: "Apakah pendaftaran akun gratis?",
        a: "Ya, pendaftaran akun dasar sepenuhnya gratis. Untuk fitur premium, tersedia paket berlangganan yang dapat dilihat di halaman Pricing.",
      },
      {
        q: "Bagaimana jika email verifikasi tidak masuk?",
        a: "Cek folder Spam atau Promotions. Jika tidak ada, tunggu 5 menit lalu klik Kirim Ulang di halaman verifikasi. Pastikan alamat email yang didaftarkan sudah benar.",
      },
      {
        q: "Bisakah satu email untuk beberapa akun?",
        a: "Tidak. Setiap alamat email hanya dapat digunakan untuk satu akun. Jika ingin membuat akun baru, gunakan email yang berbeda.",
      },
      {
        q: "Bagaimana cara mengubah data profil?",
        a: "Masuk ke menu Pengaturan lalu Profil. Di sana Anda dapat mengubah nama, foto, nomor telepon, dan informasi lainnya. Jangan lupa klik Simpan setelah selesai.",
      },
      {
        q: "Apakah akun bisa dihapus permanen?",
        a: "Ya. Masuk ke Pengaturan → Akun → Hapus Akun. Proses ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus dalam 30 hari setelah permintaan dikirim.",
      },
    ],
  },
  {
    id: 2,
    topic: "Password & Keamanan",
    items: [
      {
        q: "Bagaimana cara mereset password yang lupa?",
        a: "Klik Lupa Password di halaman login, masukkan email terdaftar, lalu cek email untuk tautan reset. Tautan berlaku selama 30 menit.",
      },
      {
        q: "Apakah ada autentikasi dua faktor (2FA)?",
        a: "Ya, kami mendukung 2FA via Google Authenticator atau SMS OTP. Aktifkan di menu Pengaturan → Keamanan → Autentikasi Dua Faktor.",
      },
      {
        q: "Berapa kali percobaan login sebelum akun dikunci?",
        a: "Setelah 5 kali percobaan gagal berturut-turut, akun akan dikunci sementara selama 15 menit.",
      },
      {
        q: "Bagaimana cara tahu akun diretas?",
        a: "Cek riwayat aktivitas login di Pengaturan → Keamanan → Riwayat Sesi. Jika ada sesi mencurigakan, segera logout semua perangkat dan ubah password.",
      },
      {
        q: "Apakah data saya dienkripsi?",
        a: "Ya, semua data dienkripsi menggunakan AES-256 saat disimpan dan TLS 1.3 saat ditransmisikan. Kami mematuhi standar keamanan ISO 27001.",
      },
    ],
  },
  {
    id: 3,
    topic: "Pembayaran & Tagihan",
    items: [
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), kartu kredit/debit Visa & Mastercard, GoPay, OVO, DANA, dan virtual account.",
      },
      {
        q: "Apakah transaksi saya aman?",
        a: "Ya. Semua transaksi diproses melalui payment gateway bersertifikasi PCI-DSS. Kami tidak menyimpan data kartu kredit Anda secara langsung.",
      },
      {
        q: "Bagaimana cara mendapatkan invoice?",
        a: "Invoice otomatis dikirim ke email terdaftar setelah pembayaran berhasil. Anda juga bisa mengunduhnya di Akun → Riwayat Transaksi.",
      },
      {
        q: "Apakah bisa minta refund?",
        a: "Refund dapat diajukan dalam 7 hari setelah pembayaran jika layanan belum digunakan. Proses membutuhkan 3–7 hari kerja tergantung metode pembayaran.",
      },
      {
        q: "Apakah ada biaya tersembunyi?",
        a: "Tidak ada. Harga yang tertera sudah final termasuk PPN 11%. Tidak ada biaya aktivasi atau biaya tersembunyi lainnya.",
      },
    ],
  },
  {
    id: 4,
    topic: "Layanan & Fitur",
    items: [
      {
        q: "Apa perbedaan paket Basic dan Premium?",
        a: "Paket Basic memberikan akses ke fitur inti dengan batas penggunaan. Paket Premium membuka semua fitur tanpa batas, prioritas dukungan, dan akses API.",
      },
      {
        q: "Apakah bisa digunakan tanpa internet?",
        a: "Beberapa fitur tersedia dalam mode offline, namun sinkronisasi data tetap membutuhkan koneksi internet.",
      },
      {
        q: "Bagaimana cara integrasi dengan aplikasi lain?",
        a: "Gunakan fitur Integrasi di menu Pengaturan. Kami mendukung Slack, Google Workspace, Microsoft 365, Zapier, dan lebih dari 50 aplikasi lainnya.",
      },
      {
        q: "Apakah ada aplikasi mobile?",
        a: "Ya, tersedia untuk iOS (App Store) dan Android (Google Play Store). Semua fitur sama dengan versi web, dioptimalkan untuk layar kecil.",
      },
    ],
  },
];

/** Daftar chip pencarian populer di header */
export const SEARCH_SUGGESTIONS = [
  "Cara daftar akun",
  "Reset password",
  "Kebijakan privasi",
  "Kontak support",
];
