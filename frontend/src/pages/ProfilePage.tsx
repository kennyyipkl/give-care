import { useState, useEffect } from "react";
import type { UserType, PhotoType } from "../types";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { getImageSrc } from "../utils/imageSrc";

interface ProfilePageProps {
  user: UserType;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch photos uploaded by this user
    fetch(`/api/photos?uploaded_by=${encodeURIComponent(user.display_name)}`)
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.display_name]);

  const totalDonations = photos.reduce((sum, p) => sum + p.donation_amount, 0);
  const totalViews = photos.reduce((sum, p) => sum + p.view_count, 0);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.display_name.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ marginBottom: "0.25rem" }}>{user.display_name}</h1>
        <p style={{ color: "var(--color-text-light)" }}>
          @{user.username} · {user.email}
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          Joined {new Date(user.created_at).toLocaleDateString()}
          {user.is_admin && " · ⚙️ Admin"}
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{photos.length}</div>
          <div className="stat-label">Photos Uploaded</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{totalViews}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{photos.reduce((s, p) => s + p.donate_count, 0)}</div>
          <div className="stat-label">Donations Received</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${totalDonations.toFixed(0)}</div>
          <div className="stat-label">Donation Amount</div>
        </div>
      </div>

      <h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
        📸 My Uploaded Photos
      </h2>

      {loading ? (
        <LoadingSkeleton type="gallery" count={3} />
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h3>No photos uploaded yet</h3>
          <p>Visit an event and upload your first photo!</p>
        </div>
      ) : (
        <div className="photo-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card fade-in">
              <img
                className="photo-card-image"
                src={getImageSrc(photo.filename, photo.image_data)}
                alt={photo.title}
              />
              <div className="photo-card-body">
                <div className="photo-card-title">{photo.title}</div>
                <div className="photo-card-uploader">
                  📅 {new Date(photo.upload_date).toLocaleDateString()}
                  {photo.event_title && (
                    <span style={{ display: "block", color: "var(--color-primary)", fontSize: "0.8rem" }}>
                      🎯 {photo.event_title}
                    </span>
                  )}
                </div>
                <div className="photo-card-stats">
                  <span>👁️ {photo.view_count}</span>
                  <span>❤️ {photo.donate_count}</span>
                  <span>💰 ${photo.donation_amount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}