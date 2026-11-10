"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5001/api";

type Category = {
  category_id: number;
  category_name: string;
};

type Opportunity = {
  opportunity_id: number;
  title: string;
  description: string;
  opportunity_type: string;
  status: string;
  category_id: number;
  category_name?: string;
  location?: string;
  application_deadline?: string;
};

type Applicant = {
  application_id: number;
  status: string;
  applied_at: string;
  student_id: number;
  full_name: string;
  email: string;
  opportunity_id: number;
  opportunity_title: string;
};

const emptyForm = {
  title: "",
  description: "",
  category_id: "",
  opportunity_type: "INTERNSHIP",
  location: "",
  application_deadline: "",
};

export default function OrganizerDashboard() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [organizerName, setOrganizerName] = useState("Organizer");

  const token = () =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("campusconnect_token") || ""
      : "";

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
  });

  const loadData = useCallback(async () => {
    if (!token()) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [catRes, oppRes, appRes] = await Promise.all([
        fetch(`${API}/categories`),
        fetch(`${API}/organizer/opportunities/my`, {
          headers: headers(),
        }),
        fetch(`${API}/organizer/applicants`, {
          headers: headers(),
  }),
]);

      if (oppRes.status === 401 || oppRes.status === 403) {
        sessionStorage.removeItem("campusconnect_token");
        sessionStorage.removeItem("campusconnect_user");
        router.push("/login");
        return;
      }

      const catData = await catRes.json();
      const oppData = await oppRes.json();
      const appData = await appRes.json();

      if (!catRes.ok) throw new Error(catData.message);
      if (!oppRes.ok) throw new Error(oppData.message);
      if (!appRes.ok) throw new Error(appData.message);

      setCategories(catData.categories || []);
      setOpportunities(oppData.opportunities || []);
      setApplicants(appData.applicants || []);

      const user = JSON.parse(
        sessionStorage.getItem("campusconnect_user") || "{}"
      );
      setOrganizerName(user.full_name || "Organizer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeField = (field: keyof typeof emptyForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSaving(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        location: form.location.trim() || null,
        application_deadline: form.application_deadline || null,
      };

      const response = await fetch(
        editingId
          ? `${API}/organizer/opportunities/${editingId}`
          : `${API}/organizer/opportunities`,
        {
          method: editingId ? "PUT" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed");

      setMessage(editingId ? "Opportunity updated!" : "Draft created!");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editOpportunity = (item: Opportunity) => {
    if (item.status !== "DRAFT") return;

    setEditingId(item.opportunity_id);
    setForm({
      title: item.title,
      description: item.description,
      category_id: String(item.category_id || ""),
      opportunity_type: item.opportunity_type,
      location: item.location || "",
      application_deadline: item.application_deadline
        ? new Date(item.application_deadline).toISOString().slice(0, 10)
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publishOpportunity = async (id: number) => {
    if (!window.confirm("Publish this opportunity?")) return;

    try {
      const response = await fetch(
        `${API}/organizer/opportunities/${id}/publish`,
        { method: "PATCH", headers: headers() }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Publish failed");

      setMessage("Opportunity published successfully!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    }
  };

  const deleteOpportunity = async (id: number) => {
    if (!window.confirm("Delete this draft opportunity?")) return;

    try {
      const response = await fetch(
        `${API}/organizer/opportunities/${id}`,
        { method: "DELETE", headers: headers() }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");

      setMessage("Draft deleted successfully!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const updateApplicantStatus = async (
  applicationId: number,
  status: string
) => {
  try {
    setError("");
    setMessage("");

    const response = await fetch(
      `${API}/organizer/applications/${applicationId}/status`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    setMessage(`Application ${status.toLowerCase()} successfully!`);

    await loadData();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to update application"
    );
  }
};

  const published = opportunities.filter(
    (item) => item.status === "PUBLISHED"
  ).length;

  const drafts = opportunities.filter(
    (item) => item.status === "DRAFT"
  ).length;

  if (loading) {
    return <main style={styles.loading}>Loading Organizer Dashboard...</main>;
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>CampusConnect</div>
          <h1 style={styles.heading}>Organizer Dashboard</h1>
          <p style={styles.muted}>
            Welcome back, {organizerName}. Manage your campus opportunities.
          </p>
        </div>

        <button
          style={styles.secondary}
          onClick={() => {
            sessionStorage.removeItem("campusconnect_token");
            sessionStorage.removeItem("campusconnect_user");
            router.push("/login");
          }}
        >
          Logout
        </button>
      </header>

      <section style={styles.stats}>
        <Stat label="Total Opportunities" value={opportunities.length} />
        <Stat label="Published" value={published} />
        <Stat label="Drafts" value={drafts} />
      </section>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.panel}>
        <h2>{editingId ? "Edit Opportunity" : "Create Opportunity"}</h2>

        <form onSubmit={submitForm} style={styles.form}>
          <label style={styles.label}>Title *</label>
          <input
            style={styles.input}
            value={form.title}
            onChange={(e) => changeField("title", e.target.value)}
            placeholder="Opportunity title"
            required
          />

          <label style={styles.label}>Description *</label>
          <textarea
            style={styles.input}
            rows={4}
            value={form.description}
            onChange={(e) => changeField("description", e.target.value)}
            placeholder="Describe the opportunity"
            required
          />

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Category *</label>
              <select
                style={styles.input}
                value={form.category_id}
                onChange={(e) => changeField("category_id", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Opportunity Type *</label>
              <select
                style={styles.input}
                value={form.opportunity_type}
                onChange={(e) =>
                  changeField("opportunity_type", e.target.value)
                }
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="COMPETITION">Competition</option>
                <option value="RESEARCH">Research</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Location</label>
              <input
                style={styles.input}
                value={form.location}
                onChange={(e) => changeField("location", e.target.value)}
                placeholder="Location"
              />
            </div>

            <div>
              <label style={styles.label}>Application Deadline</label>
              <input
                style={styles.input}
                type="date"
                value={form.application_deadline}
                onChange={(e) =>
                  changeField("application_deadline", e.target.value)
                }
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.primary} type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Opportunity"
                  : "Create Draft"}
            </button>

            {editingId && (
              <button
                style={styles.secondary}
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.panel}>
        <div style={styles.listHeader}>
          <h2>My Opportunities</h2>
          <button style={styles.secondary} onClick={loadData}>
            Refresh
          </button>
        </div>

        {opportunities.length === 0 ? (
          <p style={styles.muted}>You have not created any opportunities yet.</p>
        ) : (
          <div style={styles.list}>
            {opportunities.map((item) => (
              <article key={item.opportunity_id} style={styles.card}>
                <div style={styles.listHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <p style={styles.muted}>
                      {item.category_name || "Opportunity"} · {item.opportunity_type}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      background:
                        item.status === "PUBLISHED" ? "#dcfce7" : "#fef3c7",
                      color:
                        item.status === "PUBLISHED" ? "#166534" : "#92400e",
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <p>{item.description}</p>

                {item.location && (
                  <p style={styles.muted}>Location: {item.location}</p>
                )}

                {item.application_deadline && (
                  <p style={styles.muted}>
                    Deadline: {new Date(item.application_deadline).toLocaleDateString()}
                  </p>
                )}

                {item.status === "DRAFT" && (
                  <div style={styles.actions}>
                    <button
                      style={styles.publish}
                      onClick={() => publishOpportunity(item.opportunity_id)}
                    >
                      Publish
                    </button>
                    <button
                      style={styles.edit}
                      onClick={() => editOpportunity(item)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.delete}
                      onClick={() => deleteOpportunity(item.opportunity_id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.panel}>
  <div style={styles.listHeader}>
    <h2>Student Applications</h2>
    <span style={styles.muted}>
      {applicants.length} application(s)
    </span>
  </div>

  {applicants.length === 0 ? (
    <p style={styles.muted}>
      No students have applied to your opportunities yet.
    </p>
  ) : (
    <div style={styles.list}>
      {applicants.map((applicant) => (
        <article key={applicant.application_id} style={styles.card}>
          <div style={styles.listHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                {applicant.full_name}
              </h3>
              <p style={styles.muted}>{applicant.email}</p>
            </div>

            <span style={styles.status}>
              {applicant.status}
            </span>
          </div>

          <p>
            <strong>Opportunity:</strong>{" "}
            {applicant.opportunity_title}
          </p>

          <p style={styles.muted}>
            Applied on:{" "}
            {new Date(applicant.applied_at).toLocaleDateString()}
          </p>
          <div style={styles.actions}>
  <button
    style={styles.edit}
    onClick={() => updateApplicantStatus(applicant.application_id, "SHORTLISTED")}
  >
    Shortlist
  </button>

  <button
    style={styles.publish}
    onClick={() => updateApplicantStatus(applicant.application_id, "ACCEPTED")}
  >
    Accept
  </button>

  <button
    style={styles.delete}
    onClick={() => updateApplicantStatus(applicant.application_id, "REJECTED")}
  >
    Reject
  </button>
</div>
        </article>
      ))}
    </div>
  )}
</section>

      <footer style={styles.footer}>
        CampusConnect · Intelligent Campus Opportunity Discovery Platform
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.stat}>
      <p style={styles.muted}>{label}</p>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    color: "#172033",
    padding: "36px 7%",
    fontFamily: "Arial, sans-serif",
  },
  loading: {
    padding: 50,
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 30,
  },
  brand: { color: "#4f46e5", fontWeight: 800, marginBottom: 8 },
  heading: { fontSize: 32, margin: "0 0 8px" },
  muted: { color: "#64748b", fontSize: 14, lineHeight: 1.5 },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    marginBottom: 24,
  },
  stat: {
    background: "white",
    padding: 22,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  statValue: { fontSize: 30 },
  panel: {
    background: "white",
    padding: 25,
    borderRadius: 13,
    border: "1px solid #e2e8f0",
    marginBottom: 24,
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 14,
    background: "white",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  primary: {
    background: "#4f46e5",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "12px 19px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondary: {
    background: "white",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "11px 16px",
    cursor: "pointer",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: 13,
    borderRadius: 8,
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 13,
    borderRadius: 8,
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
  },
  list: { display: "flex", flexDirection: "column", gap: 15 },
  card: {
    padding: 20,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },
  cardTitle: { margin: "0 0 8px", fontSize: 18 },
  status: {
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 800,
  },
  publish: {
    background: "#16a34a",
    color: "white",
    border: 0,
    borderRadius: 7,
    padding: "9px 15px",
    cursor: "pointer",
  },
  edit: {
    background: "#e0e7ff",
    color: "#3730a3",
    border: 0,
    borderRadius: 7,
    padding: "9px 15px",
    cursor: "pointer",
  },
  delete: {
    background: "#fee2e2",
    color: "#991b1b",
    border: 0,
    borderRadius: 7,
    padding: "9px 15px",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 20,
    fontSize: 12,
  },
};
