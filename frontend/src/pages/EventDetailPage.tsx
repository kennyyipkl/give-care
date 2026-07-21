import { useState, useEffect, useRef } from "react";
import { photoApi } from "../api";
import { useToast } from "../context/ToastContext";
import type { EventType, PhotoType } from "../types";
import { getImageSrc } from "../utils/imageSrc";
import DonationModal from "../components/DonationModal";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSkeleton from "../components/LoadingSkeleton";

interface EventDetailPageProps {
  event: EventType;
  onBack: () => void;
  onNavigateToGallery?: () => void;
  isAdmin?: boolean;
  onAdminRemove?: (photoId: number) => void;
}

/** Convert a File to a base64 data URL string. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EventDetailPage({
  event,
  onBack,
  onNavigateToGallery,
  isAdmin = false,
  onAdminRemove,
}: EventDetailPageProps) {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);
  const [donatePhoto, setDonatePhoto] = useState<PhotoType | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const { addToast } = useToast();

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadByName, setUploadByName] = useState("");
  const [uploadStory, setUploadStory] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = () => {
    setLoading(true);
    photoApi
      .list(event.id, isAdmin)
      .then((res) => setPhotos(res.data.photos))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, [event.id]);

  const handleGenerateStory = async () => {
    if (!uploadTitle.trim()) {
      addToast("Please enter a photo title first before generating a story.", "warning");
      return;
    }
    setGenerating(true);
    try {
      const res = await photoApi.generateStory({
        event_title: event.title,
        event_description: event.description,
        photo_title: uploadTitle,
        donation_purpose: event.donation_purpose,
      });
      setUploadStory(res.data.story);
    } catch {
      setUploadStory(
        `This photo captures a meaningful moment during the ${event.title} event. ${event.description} Your support through donations helps us continue this important work and bring positive change to our community.`
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim() || !uploadByName.trim() || !uploadStory.trim()) {
      addToast("Please fill in all fields and select a photo.", "warning");
      return;
    }

    // File size validation (max 10MB)
    if (uploadFile.size > 10 * 1024 * 1024) {
      addToast("File too large! Maximum size is 10MB.", "error");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 so it works everywhere (Render has no filesystem)
      const base64 = await fileToBase64(uploadFile);
      await photoApi.createBase64({
        event_id: event.id,
        title: uploadTitle,
        uploaded_by: uploadByName,
        story: uploadStory,
        image_data: base64,
      });
      addToast("Photo uploaded successfully! 📸", "success");
      setUploadTitle("");
      setUploadByName("");
      setUploadStory("");
      setUploadFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowUpload(false);
      fetchPhotos();
    } catch {
      addToast("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (photoId: number) => {
    try {
      await photoApi.share(photoId);
      const shareUrl = `${window.location.origin}?event=${event.id}&photo=${photoId}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast("Link copied to clipboard! Share it with your friends. 🔗", "success");
      fetchPhotos();
    } catch {
      addToast("Failed to share. Please try again.", "error");
    }
  };

  const handleSocialShare = (platform: string, photoTitle: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Support ${event.title} - ${photoTitle} ❤️`);
    
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
      fetchPhotos();
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
      fetchPhotos();
    } catch {
      addToast("Failed to remove photo.", "error");
    }
  };

  const handlePhotoClick = async (photo: PhotoType) => {
    setSelectedPhoto(photo);
    try {
      const res = await photoApi.get(photo.id);
      setSelectedPhoto(res.data);
      fetchPhotos();
    } catch {
      // Silently handle
    }
  };

  const statusBadge = (status: string) => {
    const cls = status === "Upcoming" ? "badge-upcoming" : status === "Active" ? "badge-active" : "badge-closed";
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div className="event-detail">
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: "1.5rem" }}>
        ← Back to Events
      </button>

      <div className="event-detail-header">
        <h1>{event.title}</h1>
        <div className="event-detail-meta">
          <span>📅 {event.date}</span>
          <span>{statusBadge(event.status)}</span>
          <span>📸 {photos.length} photos</span>
        </div>
        <p className="event-detail-desc">{event.description}</p>
        <div className="donation-purpose">
          <h3>🎯 Donation Purpose</h3>
          <p>{event.donation_purpose}</p>
        </div>
      </div>

      {/* Upload Section */}
      {event.status !== "Closed" && (
        <div style={{ marginBottom: "2rem" }}>
          {!showUpload ? (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              📷 Upload a Photo
            </button>
          ) : (
            <div className="upload-section fade-in">
              <h2>📷 Share Your Photo</h2>
              <form onSubmit={handleUpload}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Photo Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Volunteers distributing care packages"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Sarah Chen"
                      value={uploadByName}
                      onChange={(e) => setUploadByName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Photo *</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      ref={fileRef}
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      required
                    />
                    {uploadFile && (
                      <small style={{ color: "var(--color-text-muted)", display: "block", marginTop: "0.35rem" }}>
                        {(uploadFile.size / 1024 / 1024).toFixed(1)}MB selected
                        {uploadFile.size > 10 * 1024 * 1024 && (
                          <span style={{ color: "var(--color-danger)" }}> — exceeds 10MB limit</span>
                        )}
                      </small>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Short Story / Introduction *</label>
                  <div className="story-input-wrapper">
                    <textarea
                      placeholder="Tell us the story behind this photo... What is happening? Why is it meaningful?"
                      value={uploadStory}
                      onChange={(e) => setUploadStory(e.target.value)}
                      required
                      rows={4}
                    />
                    <button
                      type="button"
                      className="generate-story-btn"
                      onClick={handleGenerateStory}
                      disabled={generating}
                    >
                      {generating ? "✨ Generating..." : "✨ AI Generate Story"}
                    </button>
                  </div>
                  <small style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    {uploadStory.length} characters — aim for 50-100 words describing the photo's impact
                  </small>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowUpload(false);
                      setUploadTitle("");
                      setUploadByName("");
                      setUploadStory("");
                      setUploadFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? "Uploading..." : "📤 Upload Photo"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* View All Photos Link */}
      {onNavigateToGallery && (
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToGallery}>
            📸 View All Photos in Gallery
          </button>
        </div>
      )}

      {/* Photo Gallery */}
      {loading ? (
        <LoadingSkeleton type="gallery" count={3} />
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h3>No photos yet</h3>
          <p>Be the first to share a photo from this event!</p>
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
                      onClick={(e) => { e.stopPropagation(); handleSocialShare("whatsapp", photo.title); }}
                      title="Share on WhatsApp"
                    >
                      💬 WA
                    </button>
                    <button
                      className="social-share-btn facebook"
                      onClick={(e) => { e.stopPropagation(); handleSocialShare("facebook", photo.title); }}
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
                  <button className="social-share-btn whatsapp" onClick={() => { handleSocialShare("whatsapp", selectedPhoto.title); setSelectedPhoto(null); }}>
                    💬 WhatsApp
                  </button>
                  <button className="social-share-btn facebook" onClick={() => { handleSocialShare("facebook", selectedPhoto.title); setSelectedPhoto(null); }}>
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