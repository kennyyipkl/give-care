import { useState, useEffect, useRef } from "react";
import { photoApi } from "../api";
import { useToast } from "../context/ToastContext";
import type { PhotoType } from "../types";
import { getImageSrc } from "../utils/imageSrc";
import DonationModal from "../components/DonationModal";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSkeleton from "../components/LoadingSkeleton";

interface PhotoGalleryPageProps {
  isAdmin?: boolean;
  onAdminRemove?: (photoId: number) => void;
}

export default function PhotoGalleryPage({
  isAdmin = false,
  onAdminRemove,
}: PhotoGalleryPageProps) {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);
  const [donatePhoto, setDonatePhoto] = useState<PhotoType | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  const fetchGallery = (searchTerm?: string) => {
    setLoading(true);
    photoApi
      .gallery(searchTerm || undefined)
      .then((res) => setPhotos(res.data.photos))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    fetchGallery(debouncedSearch);
  }, [debouncedSearch]);

  const handleShare = async (photoId: number) => {
    try {
      await photoApi.share(photoId);
      const shareUrl = `${window.location.origin}?event=${selectedPhoto?.event_id ?? ""}&photo=${photoId}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast("Link copied to clipboard! Share it with your friends. 🔗", "success");
      fetchGallery(debouncedSearch);
    } catch {
      addToast("Failed to share. Please try again.", "error");
    }
  };

  const handleSocialShare = (platform: string, photo: PhotoType) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Support this photo: ${photo.title} ❤️`);
    
    let shareUrl = "";
    if (platform === "whatsapp") {
      shareUrl = `https://wa.me/?text=${text}%20${url}`;
    } else if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleDonateConfirm = async (amount: number) => {
    if (!donatePhoto) return;
    try {
      const res = await photoApi.donate(donatePhoto.id, { amount });
      addToast(`❤️ ${res.data.message}`, "success");
      setDonatePhoto(null);
      fetchGallery(debouncedSearch);
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    }
  };

  const handleRemove = async (photoId: number) => {
    try {
      await photoApi.remove(photoId);
      if (onAdminRemove) onAdminRemove(photoId);
      addToast("Photo has been removed. 🗑️", "info");
      setConfirmRemoveId(null);
      fetchGallery(debouncedSearch);
    } catch {
      addToast("Failed to remove photo.", "error");
    }
  };

  const handlePhotoClick = async (photo: PhotoType) => {
    setSelectedPhoto(photo);
    try {
      const res = await photoApi.get(photo.id);
      setSelectedPhoto(res.data);
      fetchGallery(debouncedSearch);
    } catch {
      // Photo detail fetch failed silently
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">📸 Photo Gallery</h1>
          <p className="dashboard-subtitle">
            Browse all photos across every event — search by title, photographer, or event name
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="form-group">
          <input
            type="text"
            placeholder="🔍 Search by photo title, photographer, or event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.85rem 1rem",
              fontSize: "1rem",
              borderRadius: "var(--radius)",
            }}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
          color: "var(--color-text-light)",
          fontSize: "0.9rem",
        }}
      >
        <span>
          {loading ? "Searching..." : `${photos.length} photo${photos.length !== 1 ? "s" : ""} found`}
        </span>
        {debouncedSearch && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
            }}
          >
            ✕ Clear search
          </button>
        )}
      </div>

      {/* Photo Gallery */}
      {loading ? (
        <LoadingSkeleton type="gallery" count={6} />
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h3>{debouncedSearch ? "No photos match your search" : "No photos uploaded yet"}</h3>
          <p>
            {debouncedSearch
              ? "Try a different search term or clear the search."
              : "Photos will appear here once users start uploading them to events."}
          </p>
        </div>
      ) : (
        <div className="photo-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card fade-in">
              <img
                className="photo-card-image"
                src={getImageSrc(photo.filename, photo.image_data)}
                alt={photo.title}
                onClick={() => handlePhotoClick(photo)}
                style={{ cursor: "pointer" }}
              />
              <div className="photo-card-body">
                <div className="photo-card-title">{photo.title}</div>
                <div className="photo-card-uploader">
                  {photo.event_title && (
                    <span style={{ display: "block", fontSize: "0.8rem", color: "var(--color-primary)" }}>
                      📅 {photo.event_title}
                    </span>
                  )}
                  Uploaded by {photo.uploaded_by} ·{" "}
                  {new Date(photo.upload_date).toLocaleDateString()}
                </div>
                <div className="photo-card-story">{photo.story}</div>
                <div className="photo-card-stats">
                  <span>👁️ {photo.view_count}</span>
                  <span>🔗 {photo.share_count}</span>
                  <span>❤️ {photo.donate_count}</span>
                </div>
                <div className="photo-card-actions">
                  <div className="social-share" style={{ marginBottom: "0.5rem" }}>
                    <button
                      className="social-share-btn whatsapp"
                      onClick={(e) => { e.stopPropagation(); handleSocialShare("whatsapp", photo); }}
                      title="Share on WhatsApp"
                    >
                      💬 WA
                    </button>
                    <button
                      className="social-share-btn facebook"
                      onClick={(e) => { e.stopPropagation(); handleSocialShare("facebook", photo); }}
                      title="Share on Facebook"
                    >
                      f
                    </button>
                    <button
                      className="social-share-btn copy"
                      onClick={() => handleShare(photo.id)}
                      title="Copy link"
                    >
                      🔗 Link
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%", flexWrap: "wrap" }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setDonatePhoto(photo)}
                    >
                      ❤️ Donate
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmRemoveId(photo.id)}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donation Modal */}
      {donatePhoto && (
        <DonationModal
          photoTitle={donatePhoto.title}
          onConfirm={handleDonateConfirm}
          onCancel={() => setDonatePhoto(null)}
        />
      )}

      {/* Confirm Remove Dialog */}
      {confirmRemoveId !== null && (
        <ConfirmDialog
          title="Remove Photo"
          message="Are you sure you want to remove this photo from the gallery? This action can be undone by an admin."
          confirmLabel="🗑️ Remove"
          variant="danger"
          onConfirm={() => handleRemove(confirmRemoveId)}
          onCancel={() => setConfirmRemoveId(null)}
        />
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>
              ✕
            </button>
            <img
              className="modal-image"
              src={getImageSrc(selectedPhoto.filename, selectedPhoto.image_data)}
              alt={selectedPhoto.title}
            />
            <div className="modal-body">
              <h2 style={{ marginBottom: "0.25rem" }}>{selectedPhoto.title}</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                {selectedPhoto.event_title && (
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                    📅 {selectedPhoto.event_title} ·{" "}
                  </span>
                )}
                Uploaded by {selectedPhoto.uploaded_by} ·{" "}
                {new Date(selectedPhoto.upload_date).toLocaleDateString()}
              </p>
              <p style={{ lineHeight: 1.7, color: "var(--color-text-light)", marginBottom: "1rem" }}>
                {selectedPhoto.story}
              </p>
              <div className="modal-stats">
                <div className="modal-stat">
                  <div className="modal-stat-value">{selectedPhoto.view_count}</div>
                  <div className="modal-stat-label">Views</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-value">{selectedPhoto.share_count}</div>
                  <div className="modal-stat-label">Shares</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-value">{selectedPhoto.donate_count}</div>
                  <div className="modal-stat-label">Donations</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <div className="social-share">
                  <button className="social-share-btn whatsapp" onClick={() => { handleSocialShare("whatsapp", selectedPhoto); setSelectedPhoto(null); }}>
                    💬 WhatsApp
                  </button>
                  <button className="social-share-btn facebook" onClick={() => { handleSocialShare("facebook", selectedPhoto); setSelectedPhoto(null); }}>
                    f Facebook
                  </button>
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setSelectedPhoto(null);
                    setDonatePhoto(selectedPhoto);
                  }}
                >
                  ❤️ Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}