interface SkeletonProps {
  type?: "card" | "text" | "stats" | "gallery" | "detail";
  count?: number;
}

export default function LoadingSkeleton({ type = "card", count = 1 }: SkeletonProps) {
  if (type === "text") {
    return (
      <div className="skeleton-wrapper">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ marginBottom: "0.75rem" }}>
            <div className="skeleton-line skeleton-shimmer" style={{ width: "80%", height: 14 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 14, marginTop: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="stats-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton-icon skeleton-shimmer" />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 32, margin: "0.5rem auto" }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "80%", height: 14, margin: "0 auto" }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "gallery") {
    return (
      <div className="photo-gallery">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="photo-card">
            <div className="skeleton-image skeleton-shimmer" />
            <div className="photo-card-body">
              <div className="skeleton-line skeleton-shimmer" style={{ width: "70%", height: 16 }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: 12, marginTop: 6 }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: "90%", height: 40, marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div>
        <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 32, marginBottom: 12 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 16 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 16, marginTop: 8 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 16, marginTop: 8 }} />
        <div style={{ marginTop: "2rem" }}>
          <div className="skeleton-image skeleton-shimmer" style={{ height: 250 }} />
        </div>
      </div>
    );
  }

  // Default: card skeleton
  return (
    <div className="events-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="event-card">
          <div className="event-card-header">
            <div className="skeleton-line skeleton-shimmer" style={{ width: "70%", height: 20 }} />
            <div className="skeleton-badge skeleton-shimmer" style={{ width: 80, height: 24 }} />
          </div>
          <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 14, marginTop: 12 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 14, marginTop: 8 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: "80%", height: 14, marginTop: 8 }} />
          <div className="event-card-footer" style={{ marginTop: "1rem" }}>
            <div className="skeleton-line skeleton-shimmer" style={{ width: 100, height: 14 }} />
            <div className="skeleton-btn skeleton-shimmer" style={{ width: 110, height: 32 }} />
          </div>
        </div>
      ))}
    </div>
  );
}