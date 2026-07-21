import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import LoadingSkeleton from "../components/LoadingSkeleton";

interface VolunteerEntry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  event_title: string;
  status: string;
  created_at: string;
}

export default function VolunteerPage() {
  const [entries, setEntries] = useState<VolunteerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [message, setMessage] = useState("");

  const { addToast } = useToast();

  const fetchEntries = () => {
    setLoading(true);
    fetch("/api/volunteers")
      .then((r) => r.json())
      .then((data) => setEntries(data.volunteers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !eventTitle.trim()) {
      addToast("Please fill in name, email, and event.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          event_title: eventTitle.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      addToast("Thank you! Your volunteer application has been submitted. 🙌", "success");
      setName("");
      setEmail("");
      setPhone("");
      setEventTitle("");
      setMessage("");
      setShowForm(false);
      fetchEntries();
    } catch {
      addToast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="volunteer-page">
      <div className="page-header">
        <div>
          <h1>🙋 Volunteer With Us</h1>
          <p style={{ color: "var(--color-text-light)" }}>
            Join our community of volunteers and make a real difference
          </p>
        </div>
      </div>

      {!showForm ? (
        <div style={{ marginBottom: "2rem" }}>
          <button className="btn btn-primary btn-lg" onClick={() => setShowForm(true)}>
            ✋ Sign Up as Volunteer
          </button>
        </div>
      ) : (
        <div className="volunteer-form fade-in" style={{ marginBottom: "2rem" }}>
          <h2>✋ Volunteer Sign-Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+852 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Preferred Event *</label>
                <input
                  type="text"
                  placeholder="e.g., Give Care 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Message / Skills</label>
              <textarea
                placeholder="Tell us about yourself, your skills, and why you want to volunteer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "🙌 Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
        🤝 Recent Volunteers ({entries.length})
      </h2>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🙋</div>
          <h3>No volunteers yet</h3>
          <p>Be the first to sign up and make a difference!</p>
        </div>
      ) : (
        <div className="volunteer-list">
          {entries.map((entry) => (
            <div key={entry.id} className="volunteer-card fade-in">
              <div className="volunteer-card-info">
                <h4>{entry.name}</h4>
                <p>
                  📧 {entry.email}
                  {entry.phone && ` · 📞 ${entry.phone}`}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  🎯 {entry.event_title}
                  {entry.message && ` · "${entry.message}"`}
                </p>
              </div>
              <span className={`volunteer-badge ${entry.status === "confirmed" ? "confirmed" : "pending"}`}>
                {entry.status === "confirmed" ? "✅ Confirmed" : "⏳ Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}