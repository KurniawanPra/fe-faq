"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logout, getUser, type AdminUser } from "@/lib/api";
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
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f0f" }}>
              {user?.name ?? "Admin"}
            </div>
            <div style={{ fontSize: 11, color: "#aaa" }}>
              {user?.email ?? "admin@inl.co.id"}
            </div>
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
    </aside>
  );
}
