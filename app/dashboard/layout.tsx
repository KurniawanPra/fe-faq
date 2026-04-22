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
      {/* Mobile hamburger */}
      {isMobile && (
        <>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            style={{
              position: "fixed", top: 16, left: 16, zIndex: 200,
              width: 40, height: 40, borderRadius: 8,
              background: "#0f0f0f", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <div style={{
              width: 16, height: 1.5, background: "#fff", borderRadius: 2,
              transform: sidebarOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none",
              transition: "transform 0.22s ease",
            }} />
            <div style={{
              width: sidebarOpen ? 0 : 16, height: 1.5, background: "#fff", borderRadius: 2,
              opacity: sidebarOpen ? 0 : 1,
              transition: "width 0.18s ease, opacity 0.18s ease",
            }} />
            <div style={{
              width: 16, height: 1.5, background: "#fff", borderRadius: 2,
              transform: sidebarOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none",
              transition: "transform 0.22s ease",
            }} />
          </button>

          {/* Overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                zIndex: 90, backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            />
          )}
        </>
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100dvh", zIndex: 100,
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.25s ease",
        willChange: "transform",
      }}>
        <DashboardSidebar />
      </div>

      {/* Main */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
