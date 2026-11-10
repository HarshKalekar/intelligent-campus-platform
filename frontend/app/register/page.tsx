
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5001/api";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"STUDENT" | "ORGANIZER">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    srn: "",
    department: "",
    academic_year: "",
    graduation_year: "",
    bio: "",
    organization_name: "",
    organization_type: "",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const payload: Record<string, string> = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
      role,
    };

    if (role === "STUDENT") {
      Object.assign(payload, {
        srn: form.srn.trim(),
        department: form.department,
        academic_year: form.academic_year,
        graduation_year: form.graduation_year,
        bio: form.bio,
      });
    } else {
      Object.assign(payload, {
        organization_name: form.organization_name.trim(),
        organization_type: form.organization_type,
        description: form.description,
      });
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "register-input";

  return (
    <main className="register-page">
      <nav className="navbar">
        <Link href="/" className="brand">
          <span className="brand-icon">✦</span>
          <span>
            Campus<span className="brand-highlight">Connect</span>
          </span>
        </Link>
        <div className="nav-actions">
          <span>Already have an account?</span>
          <Link href="/login" className="login-link">
            Log in
          </Link>
        </div>
      </nav>

      <section className="register-container">
        <div className="register-heading">
          <span className="section-eyebrow">JOIN CAMPUSCONNECT</span>
          <h1>Create your account</h1>
          <p>
            Discover opportunities, connect with campus communities, and
            take your next step.
          </p>
        </div>

        <form className="register-card" onSubmit={handleSubmit}>
          <label className="form-label">I want to register as</label>

          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${role === "STUDENT" ? "selected" : ""}`}
              onClick={() => {
                setRole("STUDENT");
                setError("");
                setSuccess("");
              }}
            >
              <span>🎓</span>
              <strong>Student</strong>
              <small>Discover opportunities</small>
            </button>

            <button
              type="button"
              className={`role-option ${role === "ORGANIZER" ? "selected" : ""}`}
              onClick={() => {
                setRole("ORGANIZER");
                setError("");
                setSuccess("");
              }}
            >
              <span>🏢</span>
              <strong>Organizer</strong>
              <small>Publish opportunities</small>
            </button>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="full_name">Full name *</label>
              <input
                id="full_name"
                className={inputClass}
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="email">Email address *</label>
              <input
                id="email"
                className={inputClass}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                className={inputClass}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            {role === "STUDENT" ? (
              <>
                <div className="form-field full-width">
                  <label htmlFor="srn">Student SRN *</label>
                  <input
                    id="srn"
                    className={inputClass}
                    name="srn"
                    value={form.srn}
                    onChange={handleChange}
                    placeholder="e.g. PES1UG24CS183"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    className={inputClass}
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="academic_year">Academic year</label>
                  <select
                    id="academic_year"
                    className={inputClass}
                    name="academic_year"
                    value={form.academic_year}
                    onChange={handleChange}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="graduation_year">Graduation year</label>
                  <input
                    id="graduation_year"
                    className={inputClass}
                    name="graduation_year"
                    type="number"
                    min="2026"
                    max="2040"
                    value={form.graduation_year}
                    onChange={handleChange}
                    placeholder="e.g. 2028"
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="bio">Short bio</label>
                  <textarea
                    id="bio"
                    className={inputClass}
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-field full-width">
                  <label htmlFor="organization_name">
                    Organization name *
                  </label>
                  <input
                    id="organization_name"
                    className={inputClass}
                    name="organization_name"
                    value={form.organization_name}
                    onChange={handleChange}
                    placeholder="Enter your organization name"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="organization_type">Organization type</label>
                  <select
                    id="organization_type"
                    className={inputClass}
                    name="organization_type"
                    value={form.organization_type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="CLUB">Student Club</option>
                    <option value="DEPARTMENT">Academic Department</option>
                    <option value="COMPANY">Company</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="description">Organization description</label>
                  <textarea
                    id="description"
                    className={inputClass}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your organization..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}

          <button
            type="submit"
            className="button register-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

          <p className="form-terms">
            By registering, you agree to use CampusConnect responsibly.
          </p>
        </form>

        <p className="register-footer">
          Already part of the community? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
