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
  const r             = 44; // Slightly larger
  const circ          = 2 * Math.PI * r;
  const strokeResolved = (resolvedPct / 100) * circ;
  const strokePending  = circ - strokeResolved;

  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f59e0b" strokeWidth="12"
          strokeDasharray={`${strokePending} ${circ}`} strokeDashoffset={0} strokeLinecap="round" 
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#10b981" strokeWidth="12"
          strokeDasharray={`${strokeResolved} ${circ}`} strokeDashoffset={-strokePending} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#1f2937" }}>{total}</span>
        <span style={{ fontSize: 11, color: "#6b7280", marginTop: 1, fontWeight: 600 }}>Total</span>
      </div>
    </div>
  );
}

// ─── Bar Chart (inquiry per hari) ─────────────────────────────────────────────

function BarChart({ data, labelKey }: { data: any[]; labelKey: string }) {
  const max = Math.max(...data.map(d => d.count), 5);
  const H   = 160; 
  const barW = 32; 
  const gap = 64;  

  const formatLabel = (val: string) => {
    if (labelKey === "hari") {
      const d = new Date(val);
      return d.toLocaleDateString("id-ID", { weekday: "short" });
    }
    return val;
  };

  const formatFullDate = (val: string) => {
    if (labelKey === "hari") {
      const d = new Date(val);
      return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    }
    return val;
  };

  return (
    <div style={{ padding: "20px 0", overflowX: "auto", scrollbarWidth: 'none', msOverflowStyle: 'none', display: 'flex', justifyContent: 'center' }}>
      <svg 
        width={Math.max(data.length * gap, 300)} 
        height={H + 60} 
        viewBox={`0 0 ${Math.max(data.length * gap, 300)} ${H + 60}`} 
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        
        {/* Horizontal Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line 
            key={p}
            x1="0" y1={H * (1 - p)} 
            x2={data.length * gap} y2={H * (1 - p)} 
            stroke="#f1f1f1" 
            strokeWidth="1" 
            strokeDasharray="4 4"
          />
        ))}

        {data.map((d, i) => {
          const x  = i * gap + (gap - barW) / 2;
          const bH = (d.count / max) * H;
          const isToday = labelKey === 'hari' && new Date(d[labelKey]).toDateString() === new Date().toDateString();
          
          return (
            <g key={d[labelKey]} className="bar-group" style={{ cursor: 'pointer' }}>
              <rect 
                x={x} y={0} width={barW} height={H} 
                rx={barW/4} fill="#f8f9fa" 
              />
              
              <rect 
                x={x} y={H - bH} width={barW} height={bH} 
                rx={barW/4} 
                fill={isToday ? "#4f46e5" : "url(#barGradient)"}
                style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <title>{`${d.count} Inquiry`}</title>
              </rect>

              <text 
                x={x + barW/2} y={H + 25} 
                textAnchor="middle" fontSize={12} fontWeight={700}
                fill={isToday ? "#4f46e5" : "#1f2937"} 
                fontFamily="Inter, sans-serif"
              >
                {formatLabel(d[labelKey])}
              </text>

              <text 
                x={x + barW/2} y={H + 42} 
                textAnchor="middle" fontSize={10} fontWeight={500}
                fill="#9ca3af" fontFamily="Inter, sans-serif"
              >
                {formatFullDate(d[labelKey])}
              </text>

              {d.count > 0 && (
                <text 
                  x={x + barW/2} y={H - bH - 12} 
                  textAnchor="middle" fontSize={12} fontWeight={800}
                  fill="#4f46e5" fontFamily="Inter, sans-serif"
                >
                  {d.count}
                </text>
              )}

              {isToday && (
                <circle cx={x + barW/2} cy={H + 54} r={3} fill="#4f46e5" />
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
        .quicklink-card:hover { 
          transform: translateY(-4px); 
          border-color: #4f46e5 !important; 
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.08); 
        }
      `}</style>

      {/* Header */}
      <div className="dash-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px", color: '#1f2937' }}>Dashboard Overview</h1>
            {now && (
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6b7280", fontWeight: 500 }}>{formatDate(now)}</p>
            )}
          </div>
          <div style={{ marginLeft: 8, paddingLeft: 24, borderLeft: "2px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Periode</div>
            <input
              type="month"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              style={{
                height: 42, padding: "0 16px", border: "2px solid #f3f4f6",
                borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                background: "#fff", outline: "none", cursor: "pointer", color: "#1f2937",
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#f3f4f6'}
            />
          </div>
        </div>

        {/* Clock */}
        <div className="dash-clock" style={{ 
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", 
          padding: "16px 32px", borderRadius: 20, textAlign: "center", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)", flexShrink: 0 
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
            {now ? formatTime(now) : "--:--:--"}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
            WIB
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {loading
          ? [1,2,3].map(i => <StatSkeleton key={i} />)
          : STATS.map(s => (
            <div key={s.label} style={{ ...card, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: s.color }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                letterSpacing: "0.05em", marginBottom: 12 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#1f2937", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))
        }
      </div>

      {/* Main Chart: Statistik Inquiry (Full Width Row) */}
      <div style={{ ...card, minHeight: 320, display: 'flex', flexDirection: 'column', marginBottom: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1f2937' }}>Statistik Inquiry Harian</h2>
          <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, background: '#e0e7ff', padding: '6px 14px', borderRadius: 20, letterSpacing: '0.02em' }}>
            7 HARI TERAKHIR
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 220 }}>
          {perHari.length > 0
            ? <BarChart data={perHari} labelKey="hari" />
            : <div style={{ height: 200, width: '100%', display: "flex", alignItems: "center", justifyContent: "center",
                color: "#9ca3af", fontSize: 14, border: '2px dashed #f3f4f6', borderRadius: 12 }}>
                Belum ada data statistik tersedia
              </div>
          }
        </div>
      </div>

      {/* Secondary Charts: Topik & Resolusi (Two Columns Row) */}
      <div className="dash-charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Horizontal: per topik */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Topik Paling Sering Ditanyakan</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: 'center' }}>
            {perTopik.map((t, i) => (
              <div key={t.topik}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "#374151", fontWeight: 600 }}>{t.topik}</span>
                  <span style={{ fontWeight: 800, color: TOPIC_COLORS[i % TOPIC_COLORS.length] }}>{t.count}</span>
                </div>
                <div style={{ height: 10, background: "#f3f4f6", borderRadius: 999 }}>
                  <div style={{
                    height: "100%", width: `${(t.count / maxTopik) * 100}%`,
                    background: TOPIC_COLORS[i % TOPIC_COLORS.length],
                    borderRadius: 999, transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: `0 0 12px ${TOPIC_COLORS[i % TOPIC_COLORS.length]}33`
                  }} />
                </div>
              </div>
            ))}
            {perTopik.length === 0 && (
               <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Belum ada data topik</div>
            )}
          </div>
        </div>

        {/* Donut: status inquiry */}
        <div style={{ ...card, display: "flex", flexDirection: "column", border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Rasio Penyelesaian Inquiry</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 32, flex: 1, justifyContent: 'center' }}>
            <DonutChart
              resolved={stats?.inquiry_resolved ?? 0}
              pending={stats?.inquiry_pending ?? 0}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 50, background: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Selesai</span>
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#10b981", paddingLeft: 20 }}>
                  {stats?.inquiry_resolved ?? 0}
                </span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 50, background: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Pending</span>
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", paddingLeft: 20 }}>
                  {stats?.inquiry_pending ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ height: 12, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${((stats?.inquiry_resolved ?? 0) / ((stats?.inquiry_resolved ?? 0) + (stats?.inquiry_pending ?? 0) || 1)) * 100}%`,
                background: "#10b981", borderRadius: 999,
                transition: 'width 1s ease'
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 13, color: "#10b981", marginTop: 8, fontWeight: 800 }}>
              {Math.round(((stats?.inquiry_resolved ?? 0) / ((stats?.inquiry_resolved ?? 0) + (stats?.inquiry_pending ?? 0) || 1)) * 100)}% KASUS SELESAI
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ ...card, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Akses Cepat</h2>
        </div>
        <div className="dash-quicklinks" style={{ display: "flex", gap: 16 }}>
          <Link href="/dashboard/questions" className="quicklink-card" style={{
            flex: 1, padding: "20px", borderRadius: 16,
            background: "#fff", border: "1.5px solid #f3f4f6",
            textDecoration: "none", display: "block",
            transition: 'all 0.2s ease',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>
              Kelola Pertanyaan FAQ
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              Tambah, edit, atau hapus pertanyaan dan jawaban untuk basis pengetahuan.
            </div>
          </Link>
          <Link href="/dashboard/user-inquiries" className="quicklink-card" style={{
            flex: 1, padding: "20px", borderRadius: 16,
            background: "#fff", border: "1.5px solid #f3f4f6",
            textDecoration: "none", display: "block",
            transition: 'all 0.2s ease',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>
              Inquiry Karyawan
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              Lihat dan tangani pertanyaan langsung dari karyawan yang belum terjawab.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
