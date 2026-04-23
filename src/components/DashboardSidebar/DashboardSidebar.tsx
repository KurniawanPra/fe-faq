"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logout, getUser, updatePassword, type AdminUser } from "@/lib/api";
import styles from "./DashboardSidebar.module.css";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8.5 1.5h4a1 1 0 0 1 1 1v4L8 13a1.5 1.5 0 0 1-2.12 0l-2.88-2.88A1.5 1.5 0 0 1 3 8L8.5 1.5z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="11" cy="5" r="0.75" fill="currentColor"/>
  </svg>
);

const IconQuestion = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 6a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
  </svg>
);

const IconInbox = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1.5 10L4 6h8l2.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="1.5" y="10" width="13" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 9.5L13 7l-3.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",       path: "/dashboard",                Icon: IconGrid     },
  { label: "Topik FAQ",       path: "/dashboard/topics",         Icon: IconTag      },
  { label: "Pertanyaan FAQ",  path: "/dashboard/questions",      Icon: IconQuestion },
  { label: "Pertanyaan User", path: "/dashboard/user-inquiries", Icon: IconInbox    },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [user, setUser]             = useState<AdminUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // token expired — clear saja
    } finally {
      setLoggingOut(false);
      router.push("/login");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordLoading(true);

    try {
      await updatePassword(passwordData);
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setPasswordSuccess(false);
        setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "Gagal mengubah password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/img/logo.png"
              alt="Logo PT INL"
              width={72}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </Link>
          
          {onClose && (
            <button 
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="Tutup menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navList}>
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <Link
            key={path}
            href={path}
            className={`${styles.navLink} ${pathname === path ? styles.active : ""}`}
          >
            <span className={styles.navIcon}><Icon /></span>
            <span className={styles.navLabel}>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.adminInfo}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f0f", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.name ?? "Admin"}
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.email ?? "admin@inl.co.id"}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ fontSize: 11, color: "#0070f3", border: "none", background: "none", cursor: "pointer", padding: 0 }}
            >
              Ganti Password
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={styles.logoutLink}
          style={{ border: "none", cursor: "pointer", background: "none" }}
        >
          <IconLogout />
          {loggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>

      {/* Modal Ganti Password */}
      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)"
        }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, width: "90%", maxWidth: 400, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Ganti Password</h2>
            {passwordError && <div style={{ color: "red", fontSize: 13, marginBottom: 16 }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ color: "green", fontSize: 13, marginBottom: 16 }}>Password berhasil diubah!</div>}
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Password Saat Ini</label>
                <input
                  type="password" required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Password Baru</label>
                <input
                  type="password" required minLength={6}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Konfirmasi Password Baru</label>
                <input
                  type="password" required minLength={6}
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  style={{ padding: "8px 16px", background: "none", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit" disabled={passwordLoading}
                  style={{ padding: "8px 16px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  {passwordLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
