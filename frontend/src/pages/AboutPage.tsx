export default function AboutPage() {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1rem",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          ❤️ Lifewire Event — Give Care
        </h1>
        <p
          style={{
            color: "var(--color-text-light)",
            fontSize: "1.1rem",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          An AI-powered charity event photo platform. We use event photos and short stories to
          help viewers understand the charity cause and encourage donations.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ fontSize: "1.5rem" }}>📖</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Our Mission</h3>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            To connect compassionate people with meaningful causes through the power of visual
            storytelling.
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ fontSize: "1.5rem" }}>🤝</div>
          <h3 style={{ marginBottom: "0.5rem" }}>How It Works</h3>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Volunteers and participants upload photos with short stories. Each photo helps others
            see the real impact of their donations.
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ fontSize: "1.5rem" }}>✨</div>
          <h3 style={{ marginBottom: "0.5rem" }}>AI Storytelling</h3>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Our AI generates warm, meaningful stories for each photo to help communicate the
            event's impact and encourage support.
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ fontSize: "1.5rem" }}>💝</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Make a Difference</h3>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Every donation, no matter the size, helps us extend care to more beneficiaries and
            communities in need.
          </p>
        </div>
      </div>

      <div
        className="donation-purpose"
        style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}
      >
        <h3>💬 Why Every Photo Matters</h3>
        <p>
          A single photo can tell a story of hope, resilience, and community. By sharing your
          experience and supporting others, you become part of a movement that brings real
          change to people's lives.
        </p>
      </div>
    </div>
  );
}