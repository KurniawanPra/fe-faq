"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} hari lalu`;
  if (h > 0) return `${h} jam lalu`;
  return "Baru saja";
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({ resolved, pending }: { resolved: number; pending: number }) {
  const total         = resolved + pending;
  const resolvedPct   = total === 0 ? 0 : (resolved / total) * 100;
  const r             = 40;
  const circ          = 2 * Math.PI * r;
  const strokeResolved = (resolvedPct / 100) * circ;
  const strokePending  = circ - strokeResolved;

  return (
    <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0ede8" strokeWidth="14" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f59e0b" strokeWidth="14"
          strokeDasharray={`${strokePending} ${circ}`} strokeDashoffset={0} strokeLinecap="round" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#10b981" strokeWidth="14"
          strokeDasharray={`${strokeResolved} ${circ}`} strokeDashoffset={-strokePending} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#0f0f0f" }}>{total}</span>
        <span style={{ fontSize: 10, color: "#888", marginTop: 1 }}>Total</span>
      </div>
    </div>
  );
}

// ─── Bar Chart (inquiry per hari) ─────────────────────────────────────────────

function BarChart({ data, labelKey }: { data: any[]; labelKey: string }) {
  const max = Math.max(...data.map(d => d.count), 5);
  const H   = 100;
  const barW = 20;
  const gap = 56; 

  const formatLabel = (val: string) => {
    if (labelKey === "hari") {
      const d = new Date(val);
      return d.toLocaleDateString("id-ID", { weekday: "short" });
    }
    return val;
  };

  return (
    <div style={{ padding: "10px 0", overflowX: "auto" }}>
      <svg width="100%" height={H + 40} viewBox={`0 0 ${Math.max(data.length * gap, 400)} ${H + 40}`} style={{ overflow: "visible", maxWidth: "100%" }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        
        {/* Horizontal Grid Line (optional, subtle) */}
        <line x1="0" y1={H} x2={data.length * gap - gap/2} y2={H} stroke="#f0ede8" strokeWidth="1" />

        {data.map((d, i) => {
          const x  = i * gap + (gap - barW) / 2;
          const bH = (d.count / max) * H;
          
          return (
            <g key={d[labelKey]} className="bar-group" style={{ cursor: 'pointer' }}>
              <rect 
                x={x} y={0} width={barW} height={H} 
                rx={barW/2} fill="#f8f7f4" 
              />
              
              <rect 
                x={x} y={H - bH} width={barW} height={bH} 
                rx={barW/2} fill="url(#barGradient)"
                style={{ transition: 'all 0.5s ease-out' }}
              >
                <title>{`${d.count} Inquiry`}</title>
              </rect>

              <text 
                x={x + barW/2} y={H + 22} 
                textAnchor="middle" fontSize={11} fontWeight={600}
                fill="#888" fontFamily="Inter, sans-serif"
              >
                {formatLabel(d[labelKey])}
              </text>

              {/* Value on top */}
              {d.count > 0 && (
                <text 
                  x={x + barW/2} y={H - bH - 8} 
                  textAnchor="middle" fontSize={10} fontWeight={700}
                  fill="#6366f1" fontFamily="Inter, sans-serif"
                >
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const TOPIC_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.06)",
  padding: 24,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div style={{ height: 90, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
      animation: "pulse 1.5s ease-in-out infinite" }} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const [now,   setNow]   = useState<Date | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>(""); // Default empty (triggers 7-day filter)

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    getDashboardStats(monthFilter)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [monthFilter]);

  const STATS = stats ? [
    { label: "Total Pertanyaan FAQ",  value: stats.total_pertanyaan,          color: "#6366f1" },
    { label: "Topik Aktif",           value: stats.topik_aktif,               color: "#10b981" },
    { label: "Inquiry Menunggu",      value: stats.inquiry_pending,           color: "#ef4444" },
  ] : [];

  const perTopik  = stats?.pertanyaan_per_topik ?? [];
  const maxTopik  = Math.max(...perTopik.map(t => t.count), 1);
  const perHari   = stats?.inquiry_per_hari      ?? [];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1100 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .bar-group:hover rect { filter: brightness(1.1); }
        .bar-group:hover text { fill: #0f0f0f; }
      `}</style>

      {/* Header */}
      <div className="dash-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>Overview</h1>
            {now && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{formatDate(now)}</p>
            )}
          </div>
          <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid #f0ede8" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4, fontWeight: 600 }}>FILTER PERIODE</div>
            <input
              type="month"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              style={{
                height: 36, padding: "0 12px", border: "1.5px solid #e8e5e0",
                borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                background: "#fff", outline: "none", cursor: "pointer", color: "#0f0f0f"
              }}
            />
          </div>
        </div>

        {/* Clock */}
        <div className="dash-clock" style={{ ...card, padding: "12px 24px", textAlign: "center", background: "#0f0f0f", border: "none", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" }}>
            {now ? formatTime(now) : "--:--:--"}
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            WIB
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {loading
          ? [1,2,3].map(i => <StatSkeleton key={i} />)
          : STATS.map(s => (
            <div key={s.label} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 12 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 38, fontWeight: 700, color: "#0f0f0f", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))
        }
      </div>

      {/* Charts Row */}
      <div className="dash-charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 24 }}>

        {/* Bar: Inquiry per hari */}
        <div style={card}>
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Inquiry per Hari</h2>
          {perHari.length > 0
            ? <BarChart data={perHari} labelKey="hari" />
            : <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#ccc", fontSize: 13 }}>Belum ada data</div>
          }
        </div>

        {/* Horizontal: per topik */}
        <div style={card}>
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Pertanyaan per Topik</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {perTopik.map((t, i) => (
              <div key={t.topik}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#444", fontWeight: 500 }}>{t.topik}</span>
                  <span style={{ fontWeight: 700, color: TOPIC_COLORS[i % TOPIC_COLORS.length] }}>{t.count}</span>
                </div>
                <div style={{ height: 6, background: "#f0ede8", borderRadius: 999 }}>
                  <div style={{
                    height: "100%", width: `${(t.count / maxTopik) * 100}%`,
                    background: TOPIC_COLORS[i % TOPIC_COLORS.length],
                    borderRadius: 999, transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut: status inquiry */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>Status Inquiry</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
            <DonutChart
              resolved={stats?.inquiry_resolved ?? 0}
              pending={stats?.inquiry_pending ?? 0}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 50, background: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#666" }}>Selesai</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#10b981", paddingLeft: 16 }}>
                  {stats?.inquiry_resolved ?? 0}
                </span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 50, background: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#666" }}>Pending</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b", paddingLeft: 16 }}>
                  {stats?.inquiry_pending ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ height: 7, background: "#f0ede8", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${((stats?.inquiry_resolved ?? 0) / ((stats?.inquiry_resolved ?? 0) + (stats?.inquiry_pending ?? 0) || 1)) * 100}%`,
                background: "#10b981", borderRadius: 999,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
              {Math.round(((stats?.inquiry_resolved ?? 0) / ((stats?.inquiry_resolved ?? 0) + (stats?.inquiry_pending ?? 0) || 1)) * 100)}% selesai
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Akses Cepat</h2>
        </div>
        <div className="dash-quicklinks" style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/questions" style={{
            flex: 1, padding: "16px 20px", borderRadius: 12,
            background: "#fafaf9", border: "1px solid #f0ede8",
            textDecoration: "none", display: "block",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f0f", marginBottom: 4 }}>
              Kelola Pertanyaan FAQ
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Tambah, edit, atau hapus pertanyaan dan jawaban
            </div>
          </Link>
          <Link href="/dashboard/user-inquiries" style={{
            flex: 1, padding: "16px 20px", borderRadius: 12,
            background: "#fafaf9", border: "1px solid #f0ede8",
            textDecoration: "none", display: "block",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f0f", marginBottom: 4 }}>
              Pertanyaan Masuk
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Lihat dan tangani pertanyaan dari karyawan
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
