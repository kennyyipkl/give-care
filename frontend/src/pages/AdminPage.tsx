import { useState, useEffect } from "react";
import { eventApi, photoApi } from "../api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import type { EventType, PhotoType, UserType } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function AdminPage() {
  const { refreshUser } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<"events" | "photos" | "users">("events");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formStatus, setFormStatus] = useState("Upcoming");
  const [saving, setSaving] = useState(false);

  // Confirmation dialogs
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [removePhotoId, setRemovePhotoId] = useState<number | null>(null);
  const [restorePhotoId, setRestorePhotoId] = useState<number | null>(null);

  const { addToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      eventApi.list(),
      photoApi.list(undefined, true),
      fetch("/api/auth/users/pending").then((r) => r.json()).catch(() => ({ users: [] })),
      fetch("/api/auth/users").then((r) => r.json()).catch(() => ({ users: [] })),
    ])
      .then(([eventsRes, photosRes, pendingRes, allRes]) => {
        setEvents(eventsRes.data.events);
        setPhotos(photosRes.data.photos);
        setPendingUsers(pendingRes.users || []);
        setAllUsers(allRes.users || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormDate("");
    setFormDesc("");
    setFormPurpose("");
    setFormStatus("Upcoming");
    setEditingEvent(null);
    setShowForm(false);
  };

  const openEditForm = (event: EventType) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormDesc(event.description);
    setFormPurpose(event.donation_purpose);
    setFormStatus(event.status);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate.trim() || !formDesc.trim() || !formPurpose.trim()) {
      addToast("Please fill in all fields.", "warning");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: formTitle,
        date: formDate,
        description: formDesc,
        donation_purpose: formPurpose,
        status: formStatus,
      };

      if (editingEvent) {
        await eventApi.update(editingEvent.id, data);
        addToast("Event updated successfully! ✅", "success");
      } else {
        await eventApi.create(data);
        addToast("Event created successfully! 🎉", "success");
      }
      resetForm();
      fetchData();
    } catch {
      addToast("Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      await eventApi.delete(eventId);
      addToast("Event and all photos deleted. 🗑️", "info");
      setDeleteEventId(null);
      fetchData();
    } catch {
      addToast("Failed to delete event.", "error");
    }
  };

  const handleRemovePhoto = async (photoId: number) => {
    try {
      await photoApi.remove(photoId);
      addToast("Photo removed from gallery. 🗑️", "info");
      setRemovePhotoId(null);
      fetchData();
    } catch {
      addToast("Failed to remove photo.", "error");
    }
  };

  const handleRestorePhoto = async (photoId: number) => {
    try {
      await photoApi.restore(photoId);
      addToast("Photo restored successfully! 🔄", "success");
      setRestorePhotoId(null);
      fetchData();
    } catch {
      addToast("Failed to restore photo.", "error");
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await fetch(`/api/auth/users/${userId}/approve`, { method: "POST" });
      addToast("User approved! ✅", "success");
      await refreshUser();
      fetchData();
    } catch {
      addToast("Failed to approve user.", "error");
    }
  };

  const statusBadge = (status: string) => {
    const cls = status === "Upcoming" ? "badge-upcoming" : status === "Active" ? "badge-active" : "badge-closed";
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="admin-events">
        <div className="page-header">
          <div>
            <h1>⚙️ Admin Panel</h1>
            <p style={{ color: "var(--color-text-light)" }}>
              Manage events, users, and moderate uploaded photos
            </p>
          </div>
        </div>
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="page-header">
        <div>
          <h1>⚙️ Admin Panel</h1>
          <p style={{ color: "var(--color-text-light)" }}>
            Manage events, users, and moderate uploaded photos
          </p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 Users ({pendingUsers.length} pending)
        </button>
        <button className={`tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
          📅 Events ({events.length})
        </button>
        <button className={`tab ${activeTab === "photos" ? "active" : ""}`} onClick={() => setActiveTab("photos")}>
          📸 Photos ({photos.length})
        </button>
      </div>

      {activeTab === "users" && (
        <>
          {pendingUsers.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "var(--color-warning)" }}>
                ⏳ Pending Approval ({pendingUsers.length})
              </h2>
              {pendingUsers.map((user) => (
                <div key={user.id} className="admin-event-item fade-in">
                  <div className="admin-event-info">
                    <h4>{user.display_name}</h4>
                    <p>
                      @{user.username} · 📧 {user.email} · 📅 {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleApproveUser(user.id)}>
                    ✅ Approve
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            👥 All Users ({allUsers.length})
          </h2>
          {allUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No users yet</h3>
              <p>Users will appear here once they register.</p>
            </div>
          ) : (
            allUsers.map((user) => (
              <div key={user.id} className="admin-event-item fade-in">
                <div className="admin-event-info">
                  <h4>
                    {user.display_name}
                    {user.is_admin && <span className="badge badge-active" style={{ marginLeft: "0.5rem" }}>Admin</span>}
                    {!user.is_approved && <span className="badge badge-closed" style={{ marginLeft: "0.5rem" }}>Pending</span>}
                    {user.is_approved && !user.is_admin && <span className="badge badge-upcoming" style={{ marginLeft: "0.5rem" }}>Approved</span>}
                  </h4>
                  <p>
                    @{user.username} · 📧 {user.email} · 📅 {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!user.is_approved && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleApproveUser(user.id)}>
                    ✅ Approve
                  </button>
                )}
              </div>
            ))
          )}
        </>
      )}

      {activeTab === "events" && (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            {!showForm ? (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                ➕ Create New Event
              </button>
            ) : (
              <div className="event-form fade-in">
                <h2>{editingEvent ? "✏️ Edit Event" : "✅ Create New Event"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Event Title *</label>
                    <input type="text" placeholder="e.g., Give Care 2026" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date *</label>
                      <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Event Description *</label>
                    <textarea placeholder="Describe the event..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={4} required />
                  </div>
                  <div className="form-group">
                    <label>Donation Purpose *</label>
                    <textarea placeholder="Explain why donations are needed..." value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} rows={3} required />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : editingEvent ? "💾 Update Event" : "✅ Create Event"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No events created yet</h3>
              <p>Create your first charity event to get started!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="admin-event-item fade-in">
                <div className="admin-event-info">
                  <h4>{event.title}</h4>
                  <p>📅 {event.date} · {statusBadge(event.status)} · 📸 {event.photo_count} photos</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(event)}>✏️ Edit</button>
                  <button className="btn btn-primary btn-sm" onClick={() => { const evt = new CustomEvent("navigate-to-event", { detail: { eventId: event.id } }); window.dispatchEvent(evt); }} title="Upload photos">📷 Upload Photos</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteEventId(event.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {activeTab === "photos" && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "var(--color-text-muted)" }}>Moderate uploaded photos — remove inappropriate content</p>
          </div>
          {photos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📸</div>
              <h3>No photos uploaded yet</h3>
              <p>Photos will appear here once users start uploading.</p>
            </div>
          ) : (
            photos.map((photo) => (
              <div key={photo.id} className="admin-event-item fade-in">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                  <img src={`/api/uploads/${photo.filename}`} alt={photo.title} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }} />
                  <div className="admin-event-info">
                    <h4>{photo.title}</h4>
                    <p>By {photo.uploaded_by} · 👁️ {photo.view_count} · ❤️ {photo.donate_count}{photo.is_removed && <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem" }}> [REMOVED]</span>}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {photo.is_removed ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => setRestorePhotoId(photo.id)}>🔄 Restore</button>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setRemovePhotoId(photo.id)}>🗑️ Remove</button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Confirm Delete Event */}
      {deleteEventId !== null && (
        <ConfirmDialog title="Delete Event" message="Are you sure you want to delete this event and all its photos? This action cannot be undone." confirmLabel="🗑️ Delete Forever" variant="danger"
          onConfirm={() => handleDelete(deleteEventId)} onCancel={() => setDeleteEventId(null)} />
      )}
      {/* Confirm Remove Photo */}
      {removePhotoId !== null && (
        <ConfirmDialog title="Remove Photo" message="Are you sure you want to remove this photo from the gallery? This can be undone by restoring it." confirmLabel="🗑️ Remove" variant="danger"
          onConfirm={() => handleRemovePhoto(removePhotoId)} onCancel={() => setRemovePhotoId(null)} />
      )}
      {/* Confirm Restore Photo */}
      {restorePhotoId !== null && (
        <ConfirmDialog title="Restore Photo" message="Are you sure you want to restore this photo to the public gallery?" confirmLabel="🔄 Restore" variant="info"
          onConfirm={() => handleRestorePhoto(restorePhotoId)} onCancel={() => setRestorePhotoId(null)} />
      )}
    </div>
  );
}