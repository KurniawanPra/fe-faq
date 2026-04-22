"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SEARCH_SUGGESTIONS } from "@/data/faq-data";
import styles from "./SearchHeader.module.css";

export default function SearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          Pusat Bantuan &mdash; PT INL
        </div>

        <h1 className={styles.heading}>Pusat Informasi &amp; FAQ Karyawan</h1>

        <p className={styles.subtitle}>
          Temukan jawaban seputar layanan, kebijakan, dan prosedur operasional PT INL.
        </p>

        <div className={styles.searchRow}>
          <div className={`${styles.searchBox} ${focused ? styles.focused : ""}`}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari pertanyaan..."
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            {query && (
              <button
                className={styles.clearBtn}
                onClick={() => { setQuery(""); handleSearch(""); }}
                aria-label="Hapus"
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1 1L6 6M6 1L1 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div className={styles.chips}>
            <span className={styles.chipLabel}>Populer:</span>
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                className={styles.chip}
                onClick={() => { setQuery(s); handleSearch(s); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
