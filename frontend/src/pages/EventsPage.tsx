import { useState, useEffect } from "react";
import { eventApi } from "../api";
import type { EventType } from "../types";
import LoadingSkeleton from "../components/LoadingSkeleton";

interface EventsPageProps {
  onSelectEvent: (event: EventType) => void;
}

export default function EventsPage({ onSelectEvent }: EventsPageProps) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi
      .list()
      .then((res) => setEvents(res.data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    const cls =
      status === "Upcoming"
        ? "badge-upcoming"
        : status === "Active"
        ? "badge-active"
        : "badge-closed";
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="page-header">
          <div>
            <h1>🎉 Our Events</h1>
            <p style={{ color: "var(--color-text-light)" }}>
              Browse our charity events and see how you can make a difference
            </p>
          </div>
        </div>
        <LoadingSkeleton type="card" count={6} />
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h1>🎉 Our Events</h1>
          <p style={{ color: "var(--color-text-light)" }}>
            Browse our charity events and see how you can make a difference
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No events yet</h3>
          <p>Check back soon for upcoming charity events!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card fade-in"
              onClick={() => onSelectEvent(event)}
            >
              <div className="event-card-header">
                <div className="event-card-title">{event.title}</div>
                {statusBadge(event.status)}
              </div>
              <div className="event-card-date">📅 {event.date}</div>
              <div className="event-card-desc">{event.description}</div>
              <div className="event-card-footer">
                <div className="event-card-meta">
                  <span>📸 {event.photo_count} photos</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(event);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}