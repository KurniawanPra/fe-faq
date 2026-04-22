"use client";

/**
 * Halaman Admin — Kelola Topik FAQ
 *
 * Topik = kategori pengelompokan pertanyaan. Contoh: "Akun & Registrasi", "Cuti & Absensi".
 * Saat topik dihapus, semua pertanyaan di dalam topik tersebut ikut terhapus.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTopics, createTopic, updateTopic, deleteTopic,
  type Topic,
} from "@/lib/api";

// ─── Styles ───────────────────────────────────────────────────────────────────

const btn = (color: string, bg: string, extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 500, color, background: bg,
  fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s", ...extra,
});

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px",
  border: "1.5px solid #e8e5e0", borderRadius: 10,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  background: "#fafaf9", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};

// ─── Modal Form ───────────────────────────────────────────────────────────────

function TopicModal({
  mode, initial, onSave, onClose, saving,
}: {
  mode: "add" | "edit";
  initial?: Topic;
  onSave: (nama: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const valid = nama.trim().length >= 2;

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
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #f0ede8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            {mode === "add" ? "Tambah Topik" : "Edit Topik"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: "#888", lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 8 }}>
            Nama Topik
          </label>
          <input
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Contoh: Cuti & Absensi"
            style={inputStyle}
            maxLength={100}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter" && valid && !saving) onSave(nama.trim()); }}
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#aaa" }}>
            Topik digunakan untuk mengelompokkan pertanyaan FAQ yang sejenis.
          </p>
        </div>

        <div style={{
          padding: "16px 28px 24px", borderTop: "1px solid #f0ede8",
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={btn("#666", "#f0ede8")} disabled={saving}>Batal</button>
          <button
            onClick={() => { if (valid && !saving) onSave(nama.trim()); }}
            disabled={!valid || saving}
            style={{ ...btn("#fff", "#0f0f0f"), opacity: valid && !saving ? 1 : 0.4 }}
          >
            {saving ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({
  topic, onConfirm, onClose, deleting,
}: {
  topic: Topic; onConfirm: () => void; onClose: () => void; deleting: boolean;
}) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
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
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Hapus Topik?</h3>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#0f0f0f" }}>
          &ldquo;{topic.nama}&rdquo;
        </p>
        {(topic.jumlah_pertanyaan ?? 0) > 0 && (
          <p style={{ margin: "8px 0 20px", fontSize: 13, color: "#dc2626",
            background: "#fef2f2", borderRadius: 8, padding: "8px 14px",
            border: "1px solid #fecaca",
          }}>
            Topik ini memiliki <strong>{topic.jumlah_pertanyaan} pertanyaan</strong> yang juga akan ikut terhapus.
          </p>
        )}
        {(topic.jumlah_pertanyaan ?? 0) === 0 && (
          <p style={{ margin: "8px 0 20px", fontSize: 13, color: "#666" }}>
            Topik ini belum memiliki pertanyaan dan akan dihapus permanen.
          </p>
        )}
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

export default function TopicsAdmin() {
  const [topics,   setTopics]   = useState<Topic[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<{ mode: "add" | "edit"; data?: Topic } | null>(null);
  const [toDelete, setToDelete] = useState<Topic | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast,    setToast]    = useState("");
  const [search,   setSearch]   = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTopics();
      setTopics(data);
    } catch {
      showToast("Gagal memuat data topik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (nama: string) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await createTopic(nama);
        showToast(`Topik "${nama}" berhasil ditambahkan.`);
      } else if (modal?.data) {
        await updateTopic(modal.data.id, nama);
        showToast(`Topik berhasil diperbarui menjadi "${nama}".`);
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
      await deleteTopic(toDelete.id);
      showToast(`Topik "${toDelete.nama}" berhasil dihapus.`);
      setToDelete(null);
      loadData();
    } catch {
      showToast("Gagal menghapus topik.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = topics.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 800 }}>

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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>Kelola Topik</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888" }}>
            {loading ? "Memuat..." : `${topics.length} topik terdaftar`}
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          style={{ ...btn("#fff", "#0f0f0f"), padding: "10px 20px", fontSize: 14, borderRadius: 10 }}
        >
          + Tambah Topik
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Cari nama topik..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 300 }}
        />
      </div>

      {/* Topics List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
              padding: "20px 24px", animation: "pulse 1.5s infinite",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ flex: 1, height: 16, background: "#f0ede8", borderRadius: 6 }} />
              <div style={{ width: 60, height: 24, background: "#f0ede8", borderRadius: 6 }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
            padding: "48px 24px", textAlign: "center", color: "#aaa", fontSize: 14,
          }}>
            {search ? `Tidak ada topik dengan nama "${search}"` : "Belum ada topik. Tambahkan topik pertama Anda."}
          </div>
        ) : filtered.map((topic, idx) => (
          <div key={topic.id} style={{
            background: "#fff", borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.06)",
            padding: "18px 24px",
            display: "flex", alignItems: "center", gap: 16,
            transition: "box-shadow 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
          >
            {/* Nomor */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "#f0ede8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#888", flexShrink: 0,
            }}>
              {idx + 1}
            </div>

            {/* Nama */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0f0f0f" }}>{topic.nama}</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                {topic.jumlah_pertanyaan ?? 0} pertanyaan
              </div>
            </div>

            {/* Badge count */}
            {(topic.jumlah_pertanyaan ?? 0) > 0 && (
              <span style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: "#eef2ff", color: "#4f46e5",
              }}>
                {topic.jumlah_pertanyaan} FAQ
              </span>
            )}

            {/* Aksi */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setModal({ mode: "edit", data: topic })}
                style={{ ...btn("#4f46e5", "#eef2ff", { padding: "7px 14px", fontSize: 13 }) }}
              >
                Edit
              </button>
              <button
                onClick={() => setToDelete(topic)}
                style={{ ...btn("#ef4444", "#fef2f2", { padding: "7px 14px", fontSize: 13 }) }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: "#aaa", textAlign: "right" }}>
          Total {topics.reduce((sum, t) => sum + (t.jumlah_pertanyaan ?? 0), 0)} pertanyaan
          di {topics.length} topik
        </div>
      )}

      {/* Modals */}
      {modal && (
        <TopicModal
          mode={modal.mode}
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {toDelete && (
        <DeleteDialog
          topic={toDelete}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
