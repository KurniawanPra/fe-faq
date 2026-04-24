// ─── FAQ Domain Types ─────────────────────────────────────────────────────────

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQTopic {
  id: number;
  topic: string;
  items: FAQItem[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// ─── Topic ────────────────────────────────────────────────────────────────────

export interface Topic {
  id: number;
  nama: string;
  urutan: number;
}

// ─── Question (Pertanyaan FAQ) ────────────────────────────────────────────────

export interface Question {
  id: number;
  topik_id: number;
  topik_nama?: string;   // join dari tabel topik
  topik_urutan?: number; // join dari tabel topik
  user_id: number;
  pertanyaan: string;
  jawaban_admin: string;
  urutan: number;        // urutan pertanyaan dalam topik
  created_at: string;
  updated_at?: string;
}

export type QuestionFormData = Omit<Question, "id" | "created_at" | "updated_at" | "topik_nama" | "topik_urutan">;

// ─── User Inquiry (Pertanyaan dari Pengguna Publik) ───────────────────────────

export type JawabanMelalui = "email" | "whatsapp" | "telepon";
export type InquiryStatus  = "pending" | "resolved";

export interface UserInquiry {
  id: number;
  nama_user: string;
  email: string;
  jabatan: string;
  bagian: string;
  pertanyaan: string;
  jawaban_melalui: JawabanMelalui;
  status: boolean;       // false = pending, true = resolved
  catatan_admin?: string; // catatan internal admin
  created_at: string;
  updated_at?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_pertanyaan: number;
  pertanyaan_belum_dijawab: number;
  topik_aktif: number;
  inquiry_pending: number;
  inquiry_resolved: number;
  pertanyaan_per_topik: { topik: string; count: number }[];
  inquiry_per_minggu: { minggu: string; count: number }[];
}
