"use client";

/**
 * Halaman Admin — Pertanyaan dari Pengguna (User Inquiries)
 *
 * "Dikirim via" = cara HRD menghubungi balik pengguna (email/WhatsApp/telepon).
 * Admin bisa melihat detail pertanyaan, menandai selesai, dan menambah catatan internal.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getInquiries, updateInquiryStatus, deleteInquiry,
  type UserInquiry,
} from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const btn = (color: string, bg: string, extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 500, color, background: bg,
  fontFamily: "'DM Sans', sans-serif", ...extra,
});

const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 12px",
  border: "1.5px solid #e8e5e0", borderRadius: 10,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  background: "#fafaf9", outline: "none", boxSizing: "border-box",
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// label yang jelas untuk channel balasan
const VIA_LABEL: Record<string, string> = {
  email:    "Email",
  whatsapp: "WhatsApp",
  telepon:  "Telepon",
};

const VIA_COLOR: Record<string, { bg: string; color: string }> = {
  email:    { bg: "#eef2ff", color: "#4f46e5" },
  whatsapp: { bg: "#f0fdf4", color: "#16a34a" },
  telepon:  { bg: "#fff7ed", color: "#c2410c" },
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  inquiry, onClose, onStatusChange, saving,
}: {
  inquiry: UserInquiry;
  onClose: () => void;
  onStatusChange: (id: number, status: boolean, catatan?: string) => void;
  saving: boolean;
}) {
  const [catatan, setCatatan] = useState(inquiry.catatan_admin ?? "");
  const via = VIA_COLOR[inquiry.jawaban_melalui] ?? VIA_COLOR.email;

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
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #f0ede8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Detail Pertanyaan</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#aaa" }}>
              #{String(inquiry.id).padStart(4, "0")} &middot; {formatDate(inquiry.created_at)}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888",
          }}>✕</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Status + toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: inquiry.status ? "#f0fdf4" : "#fef3c7",
              color: inquiry.status ? "#16a34a" : "#b45309",
            }}>
              {inquiry.status ? "Sudah Ditangani" : "Menunggu Penanganan"}
            </span>
            <button
              onClick={() => onStatusChange(inquiry.id, !inquiry.status, catatan)}
              disabled={saving}
              style={btn(
                inquiry.status ? "#b45309" : "#16a34a",
                inquiry.status ? "#fef3c7" : "#f0fdf4",
                { fontSize: 12 }
              )}
            >
              {saving ? "Menyimpan..." : inquiry.status ? "Tandai Pending" : "Tandai Selesai"}
            </button>
          </div>

          {/* Info pengirim */}
          <div style={{
            background: "#fafaf9", borderRadius: 12, padding: "16px 18px",
            border: "1px solid #f0ede8",
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#888",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Informasi Pengirim
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
              {[
                { label: "Nama",    val: inquiry.nama_user },
                { label: "Jabatan", val: inquiry.jabatan },
                { label: "Email",   val: inquiry.email },
                { label: "Bagian",  val: inquiry.bagian },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#222" }}>{row.val}</div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed #e8e5e0" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Hubungi Kembali Melalui:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999,
                  fontSize: 12, fontWeight: 600,
                  background: via.bg, color: via.color,
                }}>
                  {VIA_LABEL[inquiry.jawaban_melalui] ?? inquiry.jawaban_melalui}
                </span>
                {inquiry.nomor_kontak && (
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f0f0f" }}>
                    {inquiry.nomor_kontak}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pertanyaan */}
          <div>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase",
              letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>
              Pertanyaan
            </div>
            <div style={{
              background: "#f0fdf4", borderRadius: 12, padding: "14px 16px",
              fontSize: 14, color: "#0f0f0f", lineHeight: 1.65,
              border: "1px solid #bbf7d0",
            }}>
              {inquiry.pertanyaan}
            </div>
          </div>

          {/* Catatan admin */}
          <div>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase",
              letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>
              Catatan Internal
            </div>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan internal (tidak dilihat pengirim)..."
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "10px 12px", minHeight: 80, resize: "vertical" }}
            />
            <button
              onClick={() => onStatusChange(inquiry.id, inquiry.status, catatan)}
              disabled={saving}
              style={{ ...btn("#fff", "#0f0f0f", { marginTop: 8, width: "100%", padding: "10px", fontSize: 13 }) }}
            >
              {saving ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteDialog({
  name, onConfirm, onClose, deleting,
}: {
  name: string; onConfirm: () => void; onClose: () => void; deleting: boolean;
}) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)", zIndex: 110,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380,
          padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", textAlign: "center",
        }}
      >
        <div style={{ width: 48, height: 48, background: "#fef2f2", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Hapus Pertanyaan?</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
          Pertanyaan dari <strong>{name}</strong> akan dihapus permanen.
        </p>
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

export default function UserInquiriesAdmin() {
  const [inquiries,    setInquiries]    = useState<UserInquiry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [detail,       setDetail]       = useState<UserInquiry | null>(null);
  const [toDelete,     setToDelete]     = useState<UserInquiry | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState("");

  // Filters
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatus]       = useState<"all" | "pending" | "resolved">("all");
  const [viaFilter,    setVia]          = useState<"all" | "email" | "whatsapp" | "telepon">("all");
  const [sortDir,      setSortDir]      = useState<"desc" | "asc">("desc");

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
      const params: Parameters<typeof getInquiries>[0] = {
        jawaban_melalui: viaFilter !== "all" ? viaFilter : undefined,
        direction: sortDir,
        per_page: 500,
      };
      if (statusFilter === "pending")  params.status = false;
      if (statusFilter === "resolved") params.status = true;

      const res = await getInquiries(params);
      setInquiries(res.data);
      setPage(1); // Reset page on filter change
    } catch {
      showToast("Gagal memuat data. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, viaFilter, sortDir]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Instant Live Search ────────────────────────────────────────────────────
  const filteredInquiries = inquiries.filter(i => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (i.nama_user?.toLowerCase() ?? "").includes(s) ||
           (i.email?.toLowerCase() ?? "").includes(s) ||
           (i.pertanyaan?.toLowerCase() ?? "").includes(s) ||
           (i.jabatan?.toLowerCase() ?? "").includes(s) ||
           (i.bagian?.toLowerCase() ?? "").includes(s);
  });

  // ── Pagination Logic ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const pagedInquiries = filteredInquiries.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ── Status / catatan ───────────────────────────────────────────────────────
  const handleStatusChange = async (id: number, status: boolean, catatan?: string) => {
    setSaving(true);
    try {
      await updateInquiryStatus(id, status, catatan);
      showToast(status ? "Ditandai selesai." : "Ditandai pending.");
      // Update local state
      setInquiries(list => list.map(i =>
        i.id === id ? { ...i, status, catatan_admin: catatan ?? i.catatan_admin } : i
      ));
      if (detail?.id === id) setDetail(d => d ? { ...d, status, catatan_admin: catatan ?? d.catatan_admin } : d);
    } catch {
      showToast("Gagal mengubah status.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteInquiry(toDelete.id);
      showToast("Pertanyaan berhasil dihapus.");
      setToDelete(null);
      loadData();
    } catch {
      showToast("Gagal menghapus.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalPending  = inquiries.filter(i => !i.status).length;
  const totalResolved = inquiries.filter(i =>  i.status).length;

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>
          Pertanyaan dari Pengguna
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888" }}>
          Masuk dari form &ldquo;Hubungi Kami&rdquo; di halaman utama
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Masuk",  value: loading ? "-" : inquiries.length,  color: "#6366f1" },
          { label: "Menunggu",     value: loading ? "-" : totalPending,       color: "#b45309" },
          { label: "Selesai",      value: loading ? "-" : totalResolved,      color: "#16a34a" },
          { label: "Hari Ini",     value: loading ? "-" : inquiries.filter(i => {
              const d = new Date(i.created_at);
              return d.toDateString() === new Date().toDateString();
            }).length, color: "#0ea5e9" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            padding: "16px 20px", borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
        padding: "14px 18px", marginBottom: 18,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text"
          placeholder="Cari nama, email, jabatan, pertanyaan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 300, height: 38 }}
        />

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "pending", "resolved"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={btn(
                statusFilter === s ? "#fff" : "#666",
                statusFilter === s ? "#0f0f0f" : "#f0ede8",
                { height: 38, padding: "0 14px", borderRadius: 10, fontSize: 12 }
              )}
            >
              {s === "all" ? "Semua" : s === "pending" ? "Menunggu" : "Selesai"}
            </button>
          ))}
        </div>

        {/* Via filter */}
        <select
          value={viaFilter}
          onChange={e => setVia(e.target.value as typeof viaFilter)}
          style={{ ...inputStyle, width: 160, height: 38, cursor: "pointer" }}
        >
          <option value="all">Semua Channel</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telepon">Telepon</option>
        </select>

        <select
          value={sortDir}
          onChange={e => setSortDir(e.target.value as "asc" | "desc")}
          style={{ ...inputStyle, width: 170, height: 38, cursor: "pointer" }}
        >
          <option value="desc">Terbaru Pertama</option>
          <option value="asc">Terlama Pertama</option>
        </select>

        {(search || statusFilter !== "all" || viaFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatus("all"); setVia("all"); }}
            style={{ ...btn("#666", "#f0ede8", { height: 38, padding: "0 14px" }) }}
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
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#fafaf9", borderBottom: "1px solid #f0ede8" }}>
                {["No.", "Pengirim", "Jabatan / Bagian", "Pertanyaan", "Hubungi via", "Status", "Tanggal", "Aksi"].map(h => (
                  <th key={h} style={{
                    padding: "16px", textAlign: "left", fontSize: 11,
                    fontWeight: 600, color: "#888", textTransform: "uppercase",
                    letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9f8f6" }}>
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <td key={j} style={{ padding: "20px 16px" }}>
                        <div style={{ height: 13, background: "#f0ede8", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "60px 24px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
                    Tidak ada pertanyaan masuk
                  </td>
                </tr>
              ) : pagedInquiries.map((inq, idx) => {
                const via = VIA_COLOR[inq.jawaban_melalui] ?? VIA_COLOR.email;
                return (
                  <tr key={inq.id}
                    style={{ borderBottom: "1px solid #f9f8f6", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafaf9")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "16px", fontSize: 13, color: "#aaa", textAlign: "center" }}>
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td style={{ padding: "16px", minWidth: 160 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f0f0f" }}>{inq.nama_user}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{inq.email}</div>
                    </td>
                    <td style={{ padding: "16px", fontSize: 12, color: "#666" }}>
                      {inq.jabatan} &middot; <span style={{ color: "#aaa" }}>{inq.bagian}</span>
                    </td>
                    <td style={{ padding: "16px", maxWidth: 280 }}>
                      <div style={{
                        fontSize: 12, color: "#444", lineHeight: 1.5,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}>
                        {inq.pertanyaan}
                      </div>
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 600,
                        background: via.bg, color: via.color,
                      }}>
                        {VIA_LABEL[inq.jawaban_melalui] ?? inq.jawaban_melalui}
                      </span>
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleStatusChange(inq.id, !inq.status)}
                        style={{
                          fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 700,
                          background: inq.status ? "#f0fdf4" : "#fef3c7",
                          color: inq.status ? "#16a34a" : "#b45309",
                          border: "none", cursor: "pointer",
                        }}
                      >
                        {inq.status ? "Selesai" : "Menunggu"}
                      </button>
                    </td>
                    <td style={{ padding: "16px", fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>
                      {formatDate(inq.created_at)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setDetail(inq)}
                          style={btn("#4f46e5", "#eef2ff", { padding: "8px 14px", fontSize: 12 })}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setToDelete(inq)}
                          style={btn("#ef4444", "#fef2f2", { padding: "8px 12px", fontSize: 12 })}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            Showing <b>{(page - 1) * 10 + 1}</b> to <b>{Math.min(page * 10, filteredInquiries.length)}</b> of <b>{filteredInquiries.length}</b> entries
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
      {detail && (
        <DetailModal
          inquiry={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          saving={saving}
        />
      )}
      {toDelete && (
        <DeleteDialog
          name={toDelete.nama_user}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
