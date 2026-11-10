
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<Record<number, string>>({});
  const [skillsMessage, setSkillsMessage] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);


  useEffect(() => {
    async function loadDashboard() {
      const token = sessionStorage.getItem("campusconnect_token");
      const storedUser = sessionStorage.getItem("campusconnect_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "STUDENT") {
        router.replace("/login");
        return;
      }

      setUser(parsedUser);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [oppRes, appRes, skillsRes, recommendationsRes] = await Promise.all([
          fetch("http://localhost:5001/api/opportunities", { headers }),
          fetch("http://localhost:5001/api/applications/my", { headers }),
          fetch("http://localhost:5001/api/student/skills", { headers }),
          fetch("http://localhost:5001/api/student/recommendations", { headers }),
        ]);

        const oppData = await oppRes.json();
        const appData = await appRes.json();
        const skillsData = await skillsRes.json();
        const recommendationsData = await recommendationsRes.json();

        if (!oppRes.ok) throw new Error(oppData.message || "Could not load opportunities.");
        if (!appRes.ok) throw new Error(appData.message || "Could not load applications.");
        if (!skillsRes.ok) throw new Error(skillsData.message || "Could not load skills.");
        if (!recommendationsRes.ok) {
          throw new Error(recommendationsData.message || "Could not load recommendations.");
        }

        setAvailableSkills(skillsData.availableSkills || []);
        setMySkills(skillsData.mySkills || []);
        setRecommendations(recommendationsData.recommendations || []);
        setLoadingRecommendations(false);

        const selected: Record<number, string> = {};

        (skillsData.mySkills || []).forEach((skill: any) => {
          selected[skill.skill_id] = skill.proficiency;
        });

        setSelectedSkills(selected);

        setOpportunities(
          Array.isArray(oppData) ? oppData : oppData.opportunities || oppData.data || []
        );

        setApplications(
          Array.isArray(appData) ? appData : appData.applications || appData.data || []
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dashboard loading failed.");
      } finally {
        setLoading(false);
        setLoadingRecommendations(false);
      }
    }

    loadDashboard();
  }, [router]);
  async function saveSkills() {
  const token = sessionStorage.getItem("campusconnect_token");

  if (!token) {
    router.replace("/login");
    return;
  }

  setSavingSkills(true);
  setSkillsMessage("");

  try {
    const skills = Object.entries(selectedSkills).map(([skillId, proficiency]) => ({
      skill_id: Number(skillId),
      proficiency,
    }));

    const response = await fetch("http://localhost:5001/api/student/skills", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skills }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save skills.");
    }

    setSkillsMessage("Your skills have been saved successfully!");

    setMySkills(
      availableSkills
        .filter((skill) => selectedSkills[skill.skill_id])
        .map((skill) => ({
          ...skill,
          proficiency: selectedSkills[skill.skill_id],
        }))
    );
  } catch (err) {
    setSkillsMessage(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setSavingSkills(false);
  }
}

  function logout() {
    sessionStorage.removeItem("campusconnect_token");
    sessionStorage.removeItem("campusconnect_user");
    router.replace("/login");
  }

  if (loading) return <main style={{ padding: 60 }}>Loading dashboard...</main>;

  return (
    <main style={{ minHeight: "100vh", padding: "40px 8%", background: "#fafaff" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Campus<span style={{ color: "#6254e8" }}>Connect</span></h2>
        <button onClick={logout}>Log out</button>
      </header>

      <section style={{ marginTop: 55 }}>
        <p style={{ color: "#6254e8", fontWeight: 700 }}>STUDENT DASHBOARD</p>
        <h1>Welcome back, {user?.full_name || "Student"} 👋</h1>
        <p>Discover opportunities and track your applications.</p>

        <div style={{ display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap" }}>
          <Stat title="Available opportunities" value={opportunities.length} />
          <Stat title="My applications" value={applications.length} />
        </div>

        {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
      </section>

      <section style={{ marginTop: 45 }}>
  <h2>My Profile & Skills</h2>
  <p>Select the skills you possess and specify your proficiency.</p>

  <div style={{
    background: "white",
    padding: 25,
    borderRadius: 12,
    border: "1px solid #e8e7f0",
    marginTop: 20
  }}>
    <h3>Technical Skills</h3>

    {availableSkills.map((skill) => (
      <div
        key={skill.skill_id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          padding: "12px 0",
          borderBottom: "1px solid #eee",
          flexWrap: "wrap"
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={Boolean(selectedSkills[skill.skill_id])}
            onChange={(e) => {
              setSelectedSkills((previous) => {
                const updated = { ...previous };

                if (e.target.checked) {
                  updated[skill.skill_id] = "BEGINNER";
                } else {
                  delete updated[skill.skill_id];
                }

                return updated;
              });
            }}
          />
          {skill.skill_name}
        </label>

        {selectedSkills[skill.skill_id] && (
          <select
            value={selectedSkills[skill.skill_id]}
            onChange={(e) =>
              setSelectedSkills((previous) => ({
                ...previous,
                [skill.skill_id]: e.target.value
              }))
            }
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        )}
      </div>
    ))}

    <button
      onClick={saveSkills}
      disabled={savingSkills}
      style={{
        marginTop: 20,
        padding: "12px 24px",
        background: "#6254e8",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      {savingSkills ? "Saving..." : "Save My Skills"}
    </button>

    {skillsMessage && (
      <p style={{ marginTop: 15, color: "#2563eb" }}>
        {skillsMessage}
      </p>
    )}
  </div>
</section>

<section style={{ marginTop: 45 }}>
  <h2>Recommended for You ✨</h2>
  <p>Opportunities ranked according to how well your skills match.</p>

  {loadingRecommendations ? (
    <p>Finding the best opportunities for you...</p>
  ) : recommendations.length === 0 ? (
    <p>No recommendations available right now. Try updating your skills.</p>
  ) : (
    recommendations.map((item) => (
      <article key={item.opportunity_id} style={cardStyle}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10
        }}>
          <h3>{item.title}</h3>

          <span style={{
            background: item.match_percentage >= 70 ? "#dcfce7" :
              item.match_percentage >= 40 ? "#fef3c7" : "#f3f4f6",
            color: "#222",
            padding: "7px 12px",
            borderRadius: 20,
            fontWeight: 700
          }}>
            {Number(item.match_percentage).toFixed(1)}% Match
          </span>
        </div>

        <p>{item.description}</p>

        <p>
          <strong>Skills matched:</strong>{" "}
          {item.matching_skills}/{item.total_required_skills}
        </p>

        <p>
          {item.category_name} · {item.opportunity_type}
        </p>

        <p>Location: {item.location || "Not specified"}</p>

        <Link href="/opportunities">
          View opportunity →
        </Link>
      </article>
    ))
  )}
</section>

      <section style={{ marginTop: 45 }}>
        <h2>Explore opportunities</h2>
        <Link href="/opportunities">View all opportunities →</Link>

        {opportunities.map((item) => (
          <article key={item.opportunity_id} style={cardStyle}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.opportunity_type} · {item.category_name}</small>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 45 }}>
        <h2>My applications</h2>

        {applications.length === 0 ? (
          <p>You haven't applied to any opportunities yet.</p>
        ) : (
          applications.map((item) => (
  <article key={item.application_id} style={cardStyle}>
    <h3>{item.title}</h3>

    <p>
      <strong>Status:</strong>{" "}
      <span
        style={{
          fontWeight: "bold",
          color:
            item.status === "ACCEPTED"
              ? "green"
              : item.status === "REJECTED"
              ? "red"
              : item.status === "SHORTLISTED"
              ? "#2563eb"
              : "#92400e",
        }}
      >
        {item.status}
      </span>
    </p>

    <p>Type: {item.opportunity_type}</p>

    <p>Location: {item.location || "Not specified"}</p>

    <p>
      Applied on:{" "}
      {new Date(item.applied_at).toLocaleDateString()}
    </p>

    <p>
      Application deadline:{" "}
      {item.application_deadline
        ? new Date(item.application_deadline).toLocaleDateString()
        : "Not specified"}
    </p>
  </article>
))
        )}
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ background: "white", padding: 25, borderRadius: 12, minWidth: 210 }}>
      <p>{title}</p>
      <h2 style={{ fontSize: 30 }}>{value}</h2>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: 22,
  marginTop: 15,
  borderRadius: 12,
  border: "1px solid #e8e7f0",
};
