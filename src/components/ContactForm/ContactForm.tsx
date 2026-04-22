"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api";

type Via = "email" | "whatsapp" | "telepon";

const FIELD: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  border: "1.5px solid #e0ddd8",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  color: "#0f0f0f",
};

const VIA_OPTIONS: { value: Via; label: string; icon: string }[] = [
  { value: "email",    label: "Email",     icon: "✉" },
  { value: "whatsapp", label: "WhatsApp",  icon: "💬" },
  { value: "telepon",  label: "Telepon",   icon: "📞" },
];

// Konfigurasi field kontak tiap channel
const VIA_CONTACT: Record<Via, { label: string; placeholder: string; type: string; hint: string }> = {
  email: {
    label:       "Email untuk balasan",
    placeholder: "Contoh: nama@email.com",
    type:        "email",
    hint:        "Balasan akan dikirim ke alamat email ini",
  },
  whatsapp: {
    label:       "Nomor WhatsApp",
    placeholder: "Contoh: 0812-3456-7890",
    type:        "tel",
    hint:        "Pastikan nomor aktif dan terdaftar di WhatsApp",
  },
  telepon: {
    label:       "Nomor Telepon",
    placeholder: "Contoh: 0812-3456-7890",
    type:        "tel",
    hint:        "Tim HRD akan menghubungi Anda di jam kerja (08.00–17.00 WIB)",
  },
};

export default function ContactForm() {
  const [form, setForm] = useState({
    nama_user:       "",
    email:           "",
    jabatan:         "",
    bagian:          "",
    pertanyaan:      "",
    jawaban_melalui: "email" as Via,
    nomor_kontak:    "",
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const set = (key: keyof typeof form, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  // Saat ganti channel, reset nomor_kontak dan isi default email jika via=email
  const handleViaChange = (via: Via) => {
    setForm(f => ({
      ...f,
      jawaban_melalui: via,
      nomor_kontak: via === "email" ? f.email : "",
    }));
  };

  const contactCfg = VIA_CONTACT[form.jawaban_melalui];

  const valid =
    form.nama_user.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.jabatan.trim().length > 0 &&
    form.pertanyaan.trim().length > 9 &&
    form.nomor_kontak.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    try {
      await submitInquiry({
        nama_user:       form.nama_user,
        email:           form.email,
        jabatan:         form.jabatan,
        bagian:          form.bagian,
        pertanyaan:      form.pertanyaan,
        jawaban_melalui: form.jawaban_melalui,
        nomor_kontak:    form.nomor_kontak,
      });
      setSuccess(true);
      setForm({
        nama_user: "", email: "", jabatan: "", bagian: "",
        pertanyaan: "", jawaban_melalui: "email", nomor_kontak: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
      {text}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </label>
  );

  return (
    <section style={{
      background: "#fff",
      borderTop: "1px solid #f0ede8",
      padding: "72px 24px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700,
            letterSpacing: "-0.4px", color: "#0f0f0f" }}>
            Tidak menemukan jawaban?
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            Kirim pertanyaan Anda langsung ke tim HRD. Kami akan menjawab secepatnya.
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14,
            padding: "28px 24px", textAlign: "center",
          }}>
            <div style={{
              width: 44, height: 44, background: "#dcfce7", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4L16 6" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#15803d" }}>
              Pertanyaan terkirim!
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#166534" }}>
              Tim HRD akan menghubungi Anda melalui{" "}
              <strong>{VIA_OPTIONS.find(v => v.value === form.jawaban_melalui)?.label}</strong>.
            </p>
            <button
              onClick={() => setSuccess(false)}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, background: "#0f0f0f", color: "#fff",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Kirim pertanyaan lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
                padding: "10px 14px", fontSize: 13, color: "#dc2626",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Nama + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label text="Nama Lengkap" required />
                <input type="text" value={form.nama_user}
                  onChange={e => set("nama_user", e.target.value)}
                  placeholder="Nama Anda" style={FIELD} required />
              </div>
              <div>
                <Label text="Email" required />
                <input type="email" value={form.email}
                  onChange={e => {
                    set("email", e.target.value);
                    // sync ke nomor_kontak jika via email
                    if (form.jawaban_melalui === "email") {
                      setForm(f => ({ ...f, email: e.target.value, nomor_kontak: e.target.value }));
                    }
                  }}
                  placeholder="nama@email.com" style={FIELD} required />
              </div>
            </div>

            {/* Jabatan + Bagian */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label text="Jabatan" required />
                <input type="text" value={form.jabatan}
                  onChange={e => set("jabatan", e.target.value)}
                  placeholder="Contoh: Staff HRD" style={FIELD} required />
              </div>
              <div>
                <Label text="Bagian / Divisi" />
                <input type="text" value={form.bagian}
                  onChange={e => set("bagian", e.target.value)}
                  placeholder="Contoh: Administrasi" style={FIELD} />
              </div>
            </div>

            {/* Pertanyaan */}
            <div>
              <Label text="Pertanyaan" required />
              <textarea
                value={form.pertanyaan}
                onChange={e => set("pertanyaan", e.target.value)}
                placeholder="Tuliskan pertanyaan Anda secara jelas dan lengkap..."
                rows={4} required
                style={{ ...FIELD, height: "auto", padding: "12px 14px", minHeight: 100, resize: "vertical" }}
              />
            </div>

            {/* Ingin dihubungi via */}
            <div>
              <Label text="Ingin dihubungi via" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                {VIA_OPTIONS.map(opt => {
                  const active = form.jawaban_melalui === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleViaChange(opt.value)}
                      style={{
                        height: 42, borderRadius: 9, cursor: "pointer",
                        fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                        fontFamily: "'Inter', sans-serif",
                        border: active ? "2px solid #0f0f0f" : "1.5px solid #e0ddd8",
                        background: active ? "#0f0f0f" : "#fff",
                        color: active ? "#fff" : "#555",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Kontak field — muncul setelah pilih channel */}
              <div style={{
                background: "#fafaf9",
                border: "1.5px solid #e8e5e0",
                borderRadius: 10,
                padding: "14px 16px",
                transition: "all 0.2s",
              }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
                  {contactCfg.label}
                  <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
                </label>
                <input
                  type={contactCfg.type}
                  value={form.nomor_kontak}
                  onChange={e => set("nomor_kontak", e.target.value)}
                  placeholder={contactCfg.placeholder}
                  required
                  style={{
                    ...FIELD,
                    background: "#fff",
                    borderColor: form.nomor_kontak.trim() ? "#0f0f0f" : "#e0ddd8",
                  }}
                />
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#aaa" }}>
                  {contactCfg.hint}
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!valid || loading}
              style={{
                height: 46, borderRadius: 10, border: "none",
                cursor: valid && !loading ? "pointer" : "not-allowed",
                fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                background: "#0f0f0f", color: "#fff",
                opacity: valid && !loading ? 1 : 0.4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s", marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Mengirim...
                </>
              ) : "Kirim Pertanyaan"}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        )}
      </div>
    </section>
  );
}
