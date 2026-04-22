"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getTopics, getUser,
  type Question, type Topic,
} from "@/lib/api";

// ─── Styles ───────────────────────────────────────────────────────────────────

const btn = (color: string, bg: string, overrides: React.CSSProperties = {}): React.CSSProperties => ({
  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 500, color, background: bg,
  fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s",
  ...overrides,
});

const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 12px",
  border: "1.5px solid #e8e5e0", borderRadius: 10,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  background: "#fafaf9", outline: "none", boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, height: "auto", padding: "10px 12px",
  minHeight: 80, resize: "vertical",
};

// ─── Modal Form ───────────────────────────────────────────────────────────────

interface FormState {
  topik_id: number;
  pertanyaan: string;
  jawaban_admin: string;
}

function QuestionModal({
  mode, initial, topics, onSave, onClose, saving,
}: {
  mode: "add" | "edit";
  initial: Partial<FormState>;
  topics: Topic[];
  onSave: (data: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    topik_id:     initial.topik_id     ?? topics[0]?.id ?? 0,
    pertanyaan:   initial.pertanyaan   ?? "",
    jawaban_admin:initial.jawaban_admin ?? "",
  });

  const set = (key: keyof FormState, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const valid = form.pertanyaan.trim().length > 4;

  const Label = ({ text, hint }: { text: string; hint?: string }) => (
    <div style={{ marginBottom: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block" }}>{text}</label>
      {hint && <span style={{ fontSize: 11, color: "#aaa" }}>{hint}</span>}
    </div>
  );

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #f0ede8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            {mode === "add" ? "Tambah Pertanyaan" : "Edit Pertanyaan"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: "#888", lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Topik */}
          <div>
            <Label text="Topik" />
            <select
              value={form.topik_id}
              onChange={e => set("topik_id", Number(e.target.value))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.nama}</option>
              ))}
            </select>
          </div>

          {/* Pertanyaan */}
          <div>
            <Label text="Pertanyaan" />
            <textarea
              value={form.pertanyaan}
              onChange={e => set("pertanyaan", e.target.value)}
              style={textareaStyle}
              placeholder="Tulis pertanyaan yang sering ditanyakan karyawan..."
              rows={3}
            />
          </div>

          {/* Jawaban */}
          <div>
            <Label text="Jawaban" hint="Bisa dikosongkan dulu, diisi nanti." />
            <textarea
              value={form.jawaban_admin}
              onChange={e => set("jawaban_admin", e.target.value)}
              style={textareaStyle}
              placeholder="Tulis jawaban yang jelas dan informatif..."
              rows={4}
            />
          </div>
        </div>

        <div style={{
          padding: "16px 28px 24px", borderTop: "1px solid #f0ede8",
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={btn("#666", "#f0ede8")} disabled={saving}>Batal</button>
          <button
            onClick={() => { if (valid && !saving) onSave(form); }}
            disabled={!valid || saving}
            style={{ ...btn("#fff", "#0f0f0f"), opacity: valid && !saving ? 1 : 0.4 }}
          >
            {saving ? "Menyimpan..." : mode === "add" ? "Simpan" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteDialog({
  question, onConfirm, onClose, deleting,
}: {
  question: Question; onConfirm: () => void; onClose: () => void; deleting: boolean;
}) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)", zIndex: 1100,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400,
          padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", textAlign: "center",
        }}
      >
        <div style={{ width: 48, height: 48, background: "#fef2f2", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10"
              stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Hapus Pertanyaan?</h3>
        <div style={{
          background: "#fef2f2", borderRadius: 10, padding: "10px 16px",
          fontSize: 13, color: "#dc2626", margin: "12px 0 24px", textAlign: "left",
          border: "1px solid #fecaca",
        }}>
          {question.pertanyaan}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={btn("#666", "#f0ede8")} disabled={deleting}>Batal</button>
          <button onClick={onConfirm} style={btn("#fff", "#ef4444")} disabled={deleting}>
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuestionsAdmin() {
  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics,    setTopics]    = useState<Topic[]>([]);
  const [loading,   setLoading]   = useState(true);
  
  // Modal states
  const [modal,     setModal]     = useState<{ mode: "add" | "edit"; data?: Question } | null>(null);
  const [toDelete,  setToDelete]  = useState<Question | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     setToast]     = useState("");

  // Filters
  const [search,      setSearch]  = useState("");
  const [topikFilter, setTopik]   = useState<string>("all");
  const [sortDir,     setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        getQuestions({
          topik_id: topikFilter !== "all" ? Number(topikFilter) : undefined,
          sort: "created_at",
          direction: sortDir,
          per_page: 500, // Ambil banyak untuk client-side filtering
        }),
        getTopics(),
      ]);
      setQuestions(qRes.data);
      setTopics(tRes);
      setPage(1); // Reset page on filter change
    } catch {
      showToast("Gagal memuat data. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [topikFilter, sortDir]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Client Side Live Search ────────────────────────────────────────────────
  const filteredQuestions = questions.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.pertanyaan.toLowerCase().includes(s) || 
           (q.jawaban_admin?.toLowerCase() ?? "").includes(s) ||
           (q.topik_nama?.toLowerCase() ?? "").includes(s);
  });

  // ── Pagination Logic ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const pagedQuestions = filteredQuestions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      const user = getUser();
      if (modal?.mode === "add") {
        await createQuestion({
          topik_id:     form.topik_id,
          user_id:      user?.id ?? 1,
          pertanyaan:   form.pertanyaan,
          jawaban_admin: form.jawaban_admin || undefined,
        });
        showToast("Pertanyaan berhasil ditambahkan.");
      } else if (modal?.data) {
        await updateQuestion(modal.data.id, {
          topik_id:     form.topik_id,
          pertanyaan:   form.pertanyaan,
          jawaban_admin: form.jawaban_admin,
        });
        showToast("Pertanyaan berhasil diperbarui.");
      }
      setModal(null);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteQuestion(toDelete.id);
      showToast("Pertanyaan berhasil dihapus.");
      setToDelete(null);
      loadData();
    } catch {
      showToast("Gagal menghapus pertanyaan.");
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1200 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 200,
          background: "#0f0f0f", color: "#fff", padding: "12px 20px",
          borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeIn 0.2s ease",
        }}>
          {toast}
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>Kelola Pertanyaan FAQ</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888" }}>
            {loading ? "Memuat..." : `${questions.length} pertanyaan terdaftar`}
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          style={{ ...btn("#fff", "#0f0f0f"), padding: "10px 20px", fontSize: 14, borderRadius: 10 }}
        >
          + Tambah Pertanyaan
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
        padding: "14px 18px", marginBottom: 18,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text"
          placeholder="Cari pertanyaan atau jawaban..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 280, height: 38 }}
        />

        <select
          value={topikFilter}
          onChange={e => setTopik(e.target.value)}
          style={{ ...inputStyle, width: 200, height: 38, cursor: "pointer" }}
        >
          <option value="all">Semua Topik</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.nama}</option>
          ))}
        </select>

        <select
          value={sortDir}
          onChange={e => setSortDir(e.target.value as "asc" | "desc")}
          style={{ ...inputStyle, width: 170, height: 38, cursor: "pointer" }}
        >
          <option value="desc">Terbaru Dibuat</option>
          <option value="asc">Terlama Dibuat</option>
        </select>

        {(search || topikFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setTopik("all"); }}
            style={{ ...btn("#666", "#f0ede8"), height: 38, padding: "0 14px" }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Table Section */}
      <div style={{ 
        background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", 
        overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", flex: 1, minHeight: 0
      }}>
        <div style={{ overflow: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#fafaf9", borderBottom: "1px solid #f0ede8" }}>
                {[
                  { label: "No.",       w: 60 },
                  { label: "Topik",     w: 150 },
                  { label: "Pertanyaan" },
                  { label: "Jawaban" },
                  { label: "Aksi",      w: 130 },
                ].map(col => (
                  <th key={col.label} style={{
                    padding: "16px", textAlign: "left", fontSize: 11,
                    fontWeight: 600, color: "#888", textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    width: col.w ? `${col.w}px` : undefined,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9f8f6" }}>
                    {[1,2,3,4,5].map(j => (
                      <td key={j} style={{ padding: "20px 16px" }}>
                        <div style={{ height: 14, background: "#f0ede8", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px 24px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
                    Tidak ada pertanyaan ditemukan
                  </td>
                </tr>
              ) : pagedQuestions.map((q, idx) => (
                <tr key={q.id}
                  style={{ borderBottom: "1px solid #f9f8f6", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafaf9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "16px", fontSize: 13, color: "#aaa", textAlign: "center" }}>
                    {(page - 1) * 10 + idx + 1}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 12px", borderRadius: 8,
                      fontSize: 11, fontWeight: 700, background: "#eef2ff", color: "#4f46e5",
                      textTransform: "uppercase"
                    }}>
                      {q.topik_nama || "Umum"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#0f0f0f", fontWeight: 600, maxWidth: 300 }}>
                    <div style={{ lineHeight: 1.5 }}>{q.pertanyaan}</div>
                  </td>
                  <td style={{ padding: "16px", fontSize: 13, color: "#666", maxWidth: 350 }}>
                    <div style={{
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 3, WebkitBoxOrient: "vertical", lineHeight: 1.6,
                    } as React.CSSProperties}>
                      {q.jawaban_admin || <span style={{ color: "#f59e0b", fontStyle: "italic" }}>Menunggu jawaban...</span>}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setModal({ mode: "edit", data: q })}
                        style={btn("#4f46e5", "#eef2ff", { padding: "8px 14px", fontSize: 12 })}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(q)}
                        style={btn("#ef4444", "#fef2f2", { padding: "8px 14px", fontSize: 12 })}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          padding: "14px 20px", borderTop: "1px solid #f0ede8",
          fontSize: 13, color: "#555", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "#fafaf9"
        }}>
          <div>
            Showing <b>{(page - 1) * 10 + 1}</b> to <b>{Math.min(page * 10, filteredQuestions.length)}</b> of <b>{filteredQuestions.length}</b> entries
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={btn("#666", "#fff", { 
                padding: "6px 12px", border: "1px solid #e0ddd7",
                opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer"
              })}
            >Previous</button>
            <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "0 10px" }}>
              <span style={{ fontWeight: 700 }}>{page}</span> / {totalPages || 1}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={btn("#666", "#fff", { 
                padding: "6px 12px", border: "1px solid #e0ddd7",
                opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "default" : "pointer"
              })}
            >Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <QuestionModal
          mode={modal.mode}
          initial={modal.data ?? {}}
          topics={topics}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {toDelete && (
        <DeleteDialog
          question={toDelete}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
