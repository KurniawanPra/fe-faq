
const API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "/api";


function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function saveToken(token: string) {
  localStorage.setItem("admin_token", token);
  document.cookie = `admin_token=${token}; path=/; max-age=${8 * 3600}; SameSite=Lax`;
}

export function clearToken() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  document.cookie = "admin_token=; path=/; max-age=0";
}

export function saveUser(user: AdminUser) {
  localStorage.setItem("admin_user", JSON.stringify(user));
}

export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin_user");
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

async function request<T>(path: string, options: RequestInit = {}, requireAuth = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(json?.error ?? json?.message ?? "Terjadi kesalahan", res.status, json?.errors);
  }

  return json as T;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    token_type: string;
    expires_at: string;
    user: AdminUser;
  };
}

export interface Topic {
  id: number;
  nama: string;
  jumlah_pertanyaan?: number;
}

export interface Question {
  id: number;
  topik_id: number;
  topik_nama?: string;
  user_id: number;
  pertanyaan: string;
  jawaban_admin: string;
  created_at: string;
  updated_at?: string;
}

export interface UserInquiry {
  id: number;
  nama_user: string;
  email: string;
  jabatan: string;
  bagian: string;
  pertanyaan: string;
  jawaban_melalui: "email" | "whatsapp" | "telepon";
  nomor_kontak?: string;
  status: boolean;
  catatan_admin?: string;
  created_at: string;
  updated_at?: string;
}

export interface FAQTopic {
  id: number;
  topic: string;
  items: { q: string; a: string }[];
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface DashboardStats {
  total_pertanyaan: number;
  pertanyaan_belum_dijawab: number;
  topik_aktif: number;
  inquiry_pending: number;
  inquiry_resolved: number;
  pertanyaan_per_topik: { topik: string; count: number }[];
  inquiry_per_hari: { hari: string; count: number }[];
}

export interface GetQuestionsParams {
  topik_id?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface GetInquiriesParams {
  status?: boolean;
  jawaban_melalui?: string;
  search?: string;
  direction?: "asc" | "desc";
  per_page?: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await request("/logout", { method: "POST" }, true);
  clearToken();
}

export async function getFAQs(q?: string): Promise<FAQTopic[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await request<{ success: boolean; data: FAQTopic[] }>(`/faqs${qs}`);
  return res.data ?? [];
}

export async function getTopics(): Promise<Topic[]> {
  const res = await request<{ success: boolean; data: Topic[] }>("/topics", {}, true);
  return res.data ?? [];
}

/**
 * Ambil topik populer berdasarkan jumlah pertanyaan terbanyak (publik).
 * Digunakan untuk chip pencarian di SearchHeader landing page.
 */
export async function getPopularTopicNames(limit = 5): Promise<string[]> {
  try {
    // Gunakan endpoint /faqs yang tersedia publik — ambil topic names
    const res = await request<{ success: boolean; data: { id: number; topic: string; items: unknown[] }[] }>("/faqs");
    const sorted = (res.data ?? [])
      .sort((a, b) => (b.items?.length ?? 0) - (a.items?.length ?? 0))
      .slice(0, limit)
      .map((t) => t.topic);
    return sorted;
  } catch {
    return [];
  }
}

export async function createTopic(nama: string): Promise<Topic> {
  const res = await request<{ success: boolean; data: Topic }>(
    "/topics",
    { method: "POST", body: JSON.stringify({ nama }) },
    true
  );
  return res.data;
}

export async function updateTopic(id: number, nama: string): Promise<Topic> {
  const res = await request<{ success: boolean; data: Topic }>(
    `/topics/${id}`,
    { method: "PUT", body: JSON.stringify({ nama }) },
    true
  );
  return res.data;
}

export async function deleteTopic(id: number): Promise<void> {
  await request(`/topics/${id}`, { method: "DELETE" }, true);
}

export async function getQuestions(params: GetQuestionsParams = {}): Promise<{
  data: Question[];
  meta: PaginationMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const res = await request<{ success: boolean; data: Question[]; meta: PaginationMeta }>(`/questions?${qs}`, {}, true);
  return { ...res, data: res.data ?? [] };
}

export async function createQuestion(data: {
  topik_id: number;
  user_id: number;
  pertanyaan: string;
  jawaban_admin?: string;
}): Promise<Question> {
  const res = await request<{ success: boolean; data: Question }>(
    "/questions",
    { method: "POST", body: JSON.stringify(data) },
    true
  );
  return res.data;
}

export async function updateQuestion(
  id: number,
  data: Partial<{ topik_id: number; pertanyaan: string; jawaban_admin: string }>
): Promise<Question> {
  const res = await request<{ success: boolean; data: Question }>(
    `/questions/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    true
  );
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await request(`/questions/${id}`, { method: "DELETE" }, true);
}

export async function getInquiries(params: GetInquiriesParams = {}): Promise<{
  data: UserInquiry[];
  meta: PaginationMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const res = await request<{ success: boolean; data: UserInquiry[]; meta: PaginationMeta }>(`/user-inquiries?${qs}`, {}, true);
  return { ...res, data: res.data ?? [] };
}

export async function submitInquiry(data: {
  nama_user: string;
  email: string;
  jabatan: string;
  bagian?: string;
  pertanyaan: string;
  jawaban_melalui: "email" | "whatsapp" | "telepon";
  nomor_kontak?: string;
}): Promise<UserInquiry> {
  const res = await request<{ success: boolean; data: UserInquiry }>(
    "/user-inquiries",
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.data;
}

export async function updateInquiryStatus(id: number, status: boolean, catatan_admin?: string): Promise<void> {
  await request(
    `/user-inquiries/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status, catatan_admin }) },
    true
  );
}

export async function deleteInquiry(id: number): Promise<void> {
  await request(`/user-inquiries/${id}`, { method: "DELETE" }, true);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await request<{ success: boolean; data: DashboardStats }>("/dashboard/stats", {}, true);
  return res.data;
}
