"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, clearToken } from "@/lib/api";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [scrolled, setScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isLoggedIn());
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsAuth(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <Image
            src="/img/logo.png"
            alt="Logo PT INL"
            width={90}
            height={40}
          />
          <div className={styles.logoText}>
            <span className={styles.logoName}>PT INL FAQ</span>
            <span className={styles.logoTagline}>Frequently Asked Questions</span>
          </div>
        </a>

        {/* CTA Section */}
        <div className={styles.authGroup}>
          {!isAuth ? (
            <Link
              href={isLoginPage ? "/" : "/login"}
              className={styles.btnLogin}
            >
              <span>{isLoginPage ? "Back to Home" : "Login"}</span>
              <svg viewBox="0 0 14 14" fill="none" style={{ transform: isLoginPage ? "rotate(180deg)" : "none" }}>
                <path d="M1 7H13M8 2L13 7L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className={styles.btnDashboard}>
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className={styles.btnLogout}>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
