"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getPopularTopicNames } from "@/lib/api";
import { SEARCH_SUGGESTIONS } from "@/data/faq-data";
import styles from "./SearchHeader.module.css";

export default function SearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query,       setQuery]       = useState(searchParams.get("q") || "");
  const [focused,     setFocused]     = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSugg, setLoadingSugg] = useState(true);

  // Sync query with URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch popular topics from API; fallback to static list
  useEffect(() => {
    let cancelled = false;
    setLoadingSugg(true);
    getPopularTopicNames(5)
      .then((topics) => {
        if (!cancelled) {
          setSuggestions(topics.length > 0 ? topics : SEARCH_SUGGESTIONS);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions(SEARCH_SUGGESTIONS);
      })
      .finally(() => {
        if (!cancelled) setLoadingSugg(false);
      });
    return () => { cancelled = true; };
  }, []);

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
              placeholder="Cari pertanyaan atau topik..."
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            {query && (
              <button
                className={styles.clearBtn}
                onClick={() => { setQuery(""); handleSearch(""); }}
                aria-label="Hapus pencarian"
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1 1L6 6M6 1L1 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div className={styles.chips}>
            <span className={styles.chipLabel}>Topik terpopuler:</span>
            {loadingSugg ? (
              // Skeleton chips while loading
              [1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={styles.chip}
                  style={{
                    opacity: 0,
                    animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                    minWidth: 70,
                    display: "inline-block",
                  }}
                >
                  &nbsp;
                </span>
              ))
            ) : (
              suggestions.map((s) => (
                <button
                  key={s}
                  className={`${styles.chip} ${query === s ? styles.chipActive : ""}`}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  title={`Cari topik: ${s}`}
                >
                  {s}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
