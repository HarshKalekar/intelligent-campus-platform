
const categories = [
  { icon: "💼", name: "Internships", count: "24 opportunities" },
  { icon: "🏆", name: "Hackathons", count: "12 opportunities" },
  { icon: "📚", name: "Workshops", count: "18 opportunities" },
  { icon: "🔬", name: "Research", count: "9 opportunities" },
  { icon: "🚀", name: "Competitions", count: "15 opportunities" },
  { icon: "🎯", name: "Placements", count: "8 opportunities" },
];

const opportunities = [
  {
    category: "INTERNSHIP",
    title: "AI & Machine Learning Research Intern",
    company: "Campus Research Lab",
    location: "Bengaluru",
    deadline: "14 Dec 2026",
    icon: "🤖",
    color: "purple",
  },
  {
    category: "HACKATHON",
    title: "National Coding Hackathon",
    company: "Technology Innovation Club",
    location: "PES University",
    deadline: "30 Nov 2026",
    icon: "💻",
    color: "blue",
  },
  {
    category: "WORKSHOP",
    title: "Full Stack Development Workshop",
    company: "Developer Community",
    location: "Bengaluru",
    deadline: "24 Nov 2026",
    icon: "🌐",
    color: "green",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <a href="/" className="brand">
          <span className="brand-icon">✦</span>
          <span>Campus<span className="brand-highlight">Connect</span></span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#opportunities">Opportunities</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <a href="/login" className="login-link">Log in</a>
          <a href="/register" className="button button-small">Get started →</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot"></span>
            YOUR CAMPUS. YOUR OPPORTUNITIES.
          </div>

          <h1>
            Discover opportunities.
            <br />
            <span>Build your future.</span>
          </h1>

          <p className="hero-description">
            Find internships, hackathons, workshops and research opportunities
            tailored to your skills and interests. Your next big opportunity
            starts here.
          </p>

          <div className="hero-actions">
            <a href="/opportunities" className="button">
              Explore opportunities <span>→</span>
            </a>
            <a href="/register" className="secondary-button">
              Join the community
            </a>
          </div>

          <div className="hero-trust">
            <div className="avatar-stack">
              <span>H</span><span>A</span><span>R</span><span>+</span>
            </div>
            <p><strong>Student-first discovery</strong><br />One platform. Endless possibilities.</p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow"></div>
          <div className="dashboard-preview">
            <div className="preview-top">
              <div>
                <span className="preview-label">YOUR DISCOVERY SPACE</span>
                <h3>Find your next opportunity</h3>
              </div>
              <span className="preview-sparkle">✦</span>
            </div>

            <div className="preview-search">
              <span>⌕</span>
              <span>Search skills, roles, opportunities...</span>
              <span className="search-shortcut">⌘ K</span>
            </div>

            <div className="preview-heading">
              <strong>Recommended for you</strong>
              <span>Based on your interests</span>
            </div>

            <div className="preview-card">
              <div className="preview-card-icon purple-bg">🤖</div>
              <div className="preview-card-info">
                <strong>AI Research Internship</strong>
                <span>Internship · Bengaluru</span>
              </div>
              <span className="match-pill">92% match</span>
            </div>

            <div className="preview-card">
              <div className="preview-card-icon blue-bg">💻</div>
              <div className="preview-card-info">
                <strong>National Coding Hackathon</strong>
                <span>Hackathon · Campus</span>
              </div>
              <span className="match-pill">88% match</span>
            </div>

            <div className="preview-card">
              <div className="preview-card-icon green-bg">🌐</div>
              <div className="preview-card-info">
                <strong>Full Stack Workshop</strong>
                <span>Workshop · Bengaluru</span>
              </div>
              <span className="match-pill">85% match</span>
            </div>

            <div className="preview-footer">
              <span>✦ Intelligent opportunity discovery</span>
              <span className="preview-status">● LIVE</span>
            </div>
          </div>

          <div className="floating-card floating-top">
            <span>✦</span>
            <div><strong>Smart matching</strong><small>Discover relevant opportunities</small></div>
          </div>

          <div className="floating-card floating-bottom">
            <span>🎯</span>
            <div><strong>Your next step</strong><small>Start exploring today</small></div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div><strong>01</strong><span>One unified platform</span></div>
        <div><strong>AI</strong><span>Intelligent discovery</span></div>
        <div><strong>24/7</strong><span>Explore opportunities</span></div>
        <div><strong>∞</strong><span>Possibilities to grow</span></div>
      </section>

      <section className="section categories-section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">EXPLORE BY INTEREST</span>
            <h2>What are you looking for?</h2>
            <p>Discover opportunities across different areas of interest.</p>
          </div>
          <a href="/opportunities" className="text-link">View all opportunities →</a>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <a
              href={`/opportunities?category=${encodeURIComponent(category.name)}`}
              className="category-card"
              key={category.name}
            >
              <span className="category-icon">{category.icon}</span>
              <strong>{category.name}</strong>
              <span className="category-count">{category.count}</span>
              <span className="category-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section opportunities-section" id="opportunities">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">HANDPICKED FOR YOU</span>
            <h2>Explore opportunities</h2>
            <p>Take a look at some exciting opportunities on campus.</p>
          </div>
          <a href="/opportunities" className="text-link">Explore all →</a>
        </div>

        <div className="opportunity-grid">
          {opportunities.map((item) => (
            <article className="opportunity-card" key={item.title}>
              <div className="opportunity-top">
                <div className={`opportunity-icon ${item.color}-bg`}>
                  {item.icon}
                </div>
                <span className="opportunity-type">{item.category}</span>
                <button className="bookmark" aria-label="Bookmark opportunity">♡</button>
              </div>

              <h3>{item.title}</h3>
              <p className="company-name">{item.company}</p>

              <div className="opportunity-meta">
                <span>⌖ {item.location}</span>
                <span>◷ Deadline: {item.deadline}</span>
              </div>

              <a href="/login" className="card-link">
                View opportunity <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section" id="about">
        <div>
          <span className="section-eyebrow">YOUR FUTURE STARTS HERE</span>
          <h2>Don't miss your next big opportunity.</h2>
          <p>Create your account and start discovering opportunities that match your ambitions.</p>
        </div>
        <a href="/register" className="button cta-button">
          Get started for free →
        </a>
      </section>

      <footer className="footer">
        <a href="/" className="brand">
          <span className="brand-icon">✦</span>
          <span>Campus<span className="brand-highlight">Connect</span></span>
        </a>
        <p>Connecting students with opportunities that matter.</p>
        <span>© 2026 CampusConnect. Built for campus communities.</span>
      </footer>
    </main>
  );
}
