
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Unexpected response from the server.");
      }

      sessionStorage.setItem("campusconnect_token", data.token);
      sessionStorage.setItem(
        "campusconnect_user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "ORGANIZER") {
        router.push("/organizer/dashboard");
      } else if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f7f8fc",
      padding: "24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>
        <Link href="/" style={{
          textDecoration: "none",
          color: "#171a32",
          fontSize: "24px",
          fontWeight: 800
        }}>
          ✦ Campus<span style={{ color: "#635bff" }}>Connect</span>
        </Link>

        <h1 style={{ marginTop: "35px", color: "#171a32" }}>
          Welcome back
        </h1>

        <p style={{ color: "#777", marginBottom: "25px" }}>
          Log in to discover campus opportunities.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={inputStyle}
          />

          {error && (
            <p style={{
              color: "#dc2626",
              background: "#fef2f2",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "20px",
              border: "none",
              borderRadius: "8px",
              background: "#635bff",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Logging in..." : "Log in →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#777" }}>
          New to CampusConnect?{" "}
          <Link href="/register" style={{ color: "#635bff" }}>
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #dedfea",
  borderRadius: "8px",
  fontSize: "14px"
};
