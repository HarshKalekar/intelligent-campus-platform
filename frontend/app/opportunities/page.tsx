
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:5001/api";

type Opportunity = {
  opportunity_id: number;
  title: string;
  description: string;
  opportunity_type: string;
  status: string;
  application_deadline: string | null;
  location: string | null;
  category_name: string | null;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const response = await fetch(`${API_URL}/opportunities`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load opportunities.");
        }

        setOpportunities(
          Array.isArray(data) ? data : data.opportunities || []
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesSearch =
        opportunity.title.toLowerCase().includes(search.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(search.toLowerCase()) ||
        (opportunity.category_name || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        type === "ALL" ||
        opportunity.opportunity_type.toUpperCase() === type;

      return matchesSearch && matchesType;
    });
  }, [opportunities, search, type]);

  async function applyForOpportunity(opportunityId: number) {
    setMessage("");
    setError("");

    const token = sessionStorage.getItem("campusconnect_token");

    if (!token) {
      setError("Please log in before applying.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed.");
      }

      setMessage("Application submitted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit application."
      );
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f7f8fc",
      padding: "35px 8%",
      fontFamily: "Arial, sans-serif",
      color: "#171a32"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "45px"
      }}>
        <Link href="/" style={{
          textDecoration: "none",
          fontSize: "22px",
          fontWeight: 800,
          color: "#171a32"
        }}>
          ✦ Campus<span style={{ color: "#635bff" }}>Connect</span>
        </Link>

        <Link href="/student/dashboard" style={{
          color: "#635bff",
          textDecoration: "none",
          fontWeight: 600
        }}>
          My Dashboard →
        </Link>
      </header>

      <section style={{ marginBottom: "30px" }}>
        <p style={{
          color: "#635bff",
          fontWeight: 700,
          letterSpacing: "2px",
          fontSize: "12px"
        }}>
          EXPLORE YOUR NEXT STEP
        </p>

        <h1 style={{ fontSize: "34px", margin: "10px 0" }}>
          Campus Opportunities
        </h1>

        <p style={{ color: "#777" }}>
          Discover internships, hackathons, workshops and more.
        </p>
      </section>

      <section style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "30px"
      }}>
        <input
          type="search"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 260px",
            padding: "14px",
            border: "1px solid #dedfea",
            borderRadius: "9px",
            fontSize: "14px"
          }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "14px",
            border: "1px solid #dedfea",
            borderRadius: "9px",
            background: "white"
          }}
        >
          <option value="ALL">All types</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="HACKATHON">Hackathon</option>
          <option value="WORKSHOP">Workshop</option>
          <option value="COMPETITION">Competition</option>
          <option value="RESEARCH">Research</option>
        </select>
      </section>

      {message && (
        <p style={{ color: "#15803d", marginBottom: "18px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "#dc2626", marginBottom: "18px" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading opportunities...</p>
      ) : filteredOpportunities.length === 0 ? (
        <p>No opportunities match your search.</p>
      ) : (
        <>
          <p style={{ color: "#777", marginBottom: "18px" }}>
            Showing {filteredOpportunities.length} opportunities
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {filteredOpportunities.map((opportunity) => (
              <article key={opportunity.opportunity_id} style={{
                background: "white",
                padding: "24px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <span style={{
                  color: "#635bff",
                  fontWeight: 700,
                  fontSize: "12px"
                }}>
                  {opportunity.opportunity_type}
                </span>

                <h2 style={{ fontSize: "19px", margin: 0 }}>
                  {opportunity.title}
                </h2>

                <p style={{
                  color: "#777",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  flex: 1
                }}>
                  {opportunity.description}
                </p>

                {opportunity.category_name && (
                  <p style={{ fontSize: "13px", color: "#777" }}>
                    Category: {opportunity.category_name}
                  </p>
                )}

                {opportunity.location && (
                  <p style={{ fontSize: "13px", color: "#777" }}>
                    Location: {opportunity.location}
                  </p>
                )}

                {opportunity.application_deadline && (
                  <p style={{ fontSize: "13px", color: "#777" }}>
                    Deadline:{" "}
                    {new Date(
                      opportunity.application_deadline
                    ).toLocaleDateString()}
                  </p>
                )}

                <button
                  onClick={() =>
                    applyForOpportunity(opportunity.opportunity_id)
                  }
                  style={{
                    padding: "13px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#635bff",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Apply now →
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
