"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login, saveToken, saveUser } from "@/lib/api";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      saveToken(res.data.token);
      saveUser(res.data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login gagal";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-color: #f7f6f3;
          background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0);
          background-size: 28px 28px;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          padding: 44px 48px;
          border-radius: 16px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-brand {
          text-align: center;
          border-bottom: 1px solid #f0ede8;
          padding-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .login-brand h1 {
          margin: 0 0 5px;
          font-size: 17px;
          font-weight: 700;
          color: #0f0f0f;
          letter-spacing: -0.2px;
        }

        .login-brand p {
          margin: 0;
          font-size: 13px;
          color: #888;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .input-label {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .input-field {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          background: #fafaf9;
          border: 1.5px solid #e8e5e0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
          color: #0f0f0f;
        }

        .input-field:focus {
          outline: none;
          border-color: #0f0f0f;
          background: #fff;
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrapper .input-field {
          padding-right: 40px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          height: 100%;
        }

        .toggle-password:hover {
          color: #333;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc2626;
          flex-shrink: 0;
        }

        .login-btn {
          width: 100%;
          height: 44px;
          background: #0f0f0f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.88;
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          display: block;
          text-align: center;
          font-size: 13px;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover { color: #0f0f0f; }
      `}</style>

      <div className="login-card">
        <div className="login-brand">
          <Image
            src="/img/logo.png"
            alt="Logo PT INL"
            width={90}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <div>
            <h1>PT. Industri Nabati Lestari FAQ</h1>
            <p>Masuk ke dashboard manajemen FAQ</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && (
            <div className="error-box">
              <div className="error-dot" />
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="admin@inl.co.id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Masukkan password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : "Masuk"}
          </button>
        </form>

        <Link href="/" className="back-link">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
