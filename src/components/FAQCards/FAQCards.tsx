"use client";

import { useState, useEffect } from "react";
import type { FAQTopic } from "@/lib/api";
import { getFAQs } from "@/lib/api";
import styles from "./FAQCards.module.css";

// ─── Chevron SVG ──────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.25s ease",
        display: "block",
        flexShrink: 0,
      }}
    >
      <path
        d="M3 5.5L7 9.5L11 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── FAQ Row ──────────────────────────────────────────────────────────────────

function FAQRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: { q: string; a: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.row}>
      <button
        onClick={onToggle}
        className={`${styles.rowBtn} ${isOpen ? styles.rowBtnOpen : ""}`}
      >
        <span className={styles.rowIndex}>{index + 1}</span>
        <span className={`${styles.rowQuestion} ${isOpen ? styles.rowQuestionOpen : ""}`}>
          {item.q}
        </span>
        <span className={`${styles.rowChevron} ${isOpen ? styles.rowChevronOpen : ""}`}>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div className={styles.rowAnswer}>
          <p className={styles.rowAnswerText}>{item.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── FAQ Card ─────────────────────────────────────────────────────────────────

function FAQCard({ card }: { card: FAQTopic }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={styles.cardTopic}>{card.topic}</span>
          <span className={styles.cardCount}>{card.items.length} pertanyaan</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        {card.items.map((item, i) => (
          <FAQRow
            key={i}
            item={item}
            index={i}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, padding: "0 24px 48px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
          padding: 24, animation: "pulse 1.5s ease-in-out infinite",
        }}>
          <div style={{ height: 20, background: "#f0ede8", borderRadius: 6, marginBottom: 16, width: "60%" }} />
          {[1, 2, 3].map(j => (
            <div key={j} style={{ height: 14, background: "#f0ede8", borderRadius: 4, marginBottom: 12, width: `${70 + j * 8}%` }} />
          ))}
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function FAQCards({ searchQuery = "" }: { searchQuery?: string }) {
  const [topics, setTopics]   = useState<FAQTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    setLoading(true);
    getFAQs(searchQuery || undefined)
      .then(setTopics)
      .catch(() => setError("Gagal memuat data FAQ. Coba muat ulang halaman."))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "#888" }}>
        <p style={{ fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  const filtered = searchQuery
    ? topics.map(card => ({
        ...card,
        items: card.items.filter(
          item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(c => c.items.length > 0)
    : topics;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map(card => <FAQCard key={card.id} card={card} />)
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} style={{ fontSize: 13 }}>Tidak ada hasil</span>
            Tidak ada pertanyaan yang cocok dengan{" "}
            <strong className={styles.emptyQuery}>&ldquo;{searchQuery}&rdquo;</strong>
          </div>
        )}
      </div>
    </section>
  );
}
