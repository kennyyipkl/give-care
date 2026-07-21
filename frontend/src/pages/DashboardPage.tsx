import { useState, useEffect } from "react";
import { dashboardApi } from "../api";
import type { DashboardData } from "../types";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="dashboard-title">📊 Give Care Dashboard</h1>
        <p className="dashboard-subtitle">
          Track the impact and engagement of your charity events
        </p>
        <LoadingSkeleton type="stats" count={4} />
        <div className="top-photos-section" style={{ marginTop: "2rem" }}>
          <LoadingSkeleton type="text" count={3} />
          <LoadingSkeleton type="text" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">📊 Give Care Dashboard</h1>
      <p className="dashboard-subtitle">
        Track the impact and engagement of your charity events
      </p>

      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{data?.total_events ?? 0}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{data?.total_photos ?? 0}</div>
          <div className="stat-label">Photos Uploaded</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{data?.total_donations ?? 0}</div>
          <div className="stat-label">Donations Clicked</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${(data?.total_donation_amount ?? 0).toFixed(0)}</div>
          <div className="stat-label">Total Donation Amount</div>
        </div>
      </div>

      <div className="top-photos-section">
        {data?.most_viewed_photo ? (
          <div className="top-photo-card fade-in">
            <h3>👁️ Most Viewed Photo</h3>
            <p className="top-photo-title">{data.most_viewed_photo.title}</p>
            <p className="top-photo-meta">
              {data.most_viewed_photo.view_count} views
            </p>
          </div>
        ) : (
          <div className="top-photo-card">
            <h3>👁️ Most Viewed Photo</h3>
            <p className="top-photo-meta">No photos yet</p>
          </div>
        )}

        {data?.most_shared_photo ? (
          <div className="top-photo-card fade-in">
            <h3>🔗 Most Shared Photo</h3>
            <p className="top-photo-title">{data.most_shared_photo.title}</p>
            <p className="top-photo-meta">
              {data.most_shared_photo.share_count} shares
            </p>
          </div>
        ) : (
          <div className="top-photo-card">
            <h3>🔗 Most Shared Photo</h3>
            <p className="top-photo-meta">No photos yet</p>
          </div>
        )}
      </div>
    </div>
  );
}