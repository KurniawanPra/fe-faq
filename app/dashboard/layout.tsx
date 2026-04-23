"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [sidebarOpen, isMobile]);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header Bar (Glassmorphism) */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 64,
          background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)", zIndex: 190,
          display: "flex", alignItems: "center", padding: "0 16px",
          justifyContent: "space-between",
          opacity: sidebarOpen ? 0 : 1, // Sembunyikan header bar saat sidebar buka agar tidak bertumpuk
          pointerEvents: sidebarOpen ? "none" : "auto",
          transition: "opacity 0.2s ease"
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f0f0f" }}>Dashboard</div>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#0f0f0f", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ width: 16, height: 1.5, background: "#fff", borderRadius: 2 }} />
            <div style={{ width: 16, height: 1.5, background: "#fff", borderRadius: 2 }} />
            <div style={{ width: 16, height: 1.5, background: "#fff", borderRadius: 2 }} />
          </button>
        </div>
      )}

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 195, backdropFilter: "blur(4px)",
            animation: "fadeIn 0.3s ease"
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100dvh", zIndex: 200,
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
        boxShadow: isMobile && sidebarOpen ? "10px 0 30px rgba(0,0,0,0.1)" : "none"
      }}>
        <DashboardSidebar onClose={isMobile ? () => setSidebarOpen(false) : undefined} />
      </div>

      {/* Main */}
      <main className="dashboard-main">
        {children}
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
