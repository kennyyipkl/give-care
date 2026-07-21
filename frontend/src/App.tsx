import { useState, useEffect } from "react";
import "./App.css";
import "./styles/global.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import PhotoGalleryPage from "./pages/PhotoGalleryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VolunteerPage from "./pages/VolunteerPage";
import ProfilePage from "./pages/ProfilePage";
import type { EventType } from "./types";

type View = "dashboard" | "events" | "event-detail" | "admin" | "about" | "gallery" | "volunteer" | "profile" | "login";

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  const navigate = (v: View) => {
    setView(v);
    if (v !== "event-detail") setSelectedEvent(null);
  };

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setView("event-detail");
  };

  const handleLogout = () => {
    logout();
    setView("dashboard");
  };

  // Listen for "navigate-to-event" custom event (from AdminPage "Upload Photos" button)
  useEffect(() => {
    const handler = (e: Event) => {
      const { eventId } = (e as CustomEvent).detail;
      import("./api").then(({ eventApi }) => {
        eventApi.get(eventId).then((res: { data: EventType }) => {
          setSelectedEvent(res.data);
          setView("event-detail");
        });
      });
    };
    window.addEventListener("navigate-to-event", handler);
    return () => window.removeEventListener("navigate-to-event", handler);
  }, []);

  // ── Public pages (no login needed) ──
  const publicPages: View[] = ["dashboard", "events", "event-detail", "gallery", "about", "volunteer"];
  const isPublicPage = publicPages.includes(view);

  // ── If not authenticated, show public pages with minimal nav ──
  if (!loading && !user) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="navbar-inner">
            <a
              className="navbar-brand"
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("dashboard"); }}
            >
              <span className="navbar-brand-icon">❤️</span>
              <span>Give Care</span>
            </a>
            <div className="navbar-links">
              <button className={`nav-link ${view === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>
                📊 Dashboard
              </button>
              <button className={`nav-link ${view === "events" ? "active" : ""}`} onClick={() => navigate("events")}>
                🎉 Events
              </button>
              <button className={`nav-link ${view === "gallery" ? "active" : ""}`} onClick={() => navigate("gallery")}>
                📸 Gallery
              </button>
              <button className={`nav-link ${view === "volunteer" ? "active" : ""}`} onClick={() => navigate("volunteer")}>
                🙋 Volunteer
              </button>
              <button className={`nav-link ${view === "about" ? "active" : ""}`} onClick={() => navigate("about")}>
                ℹ️ About
              </button>
            </div>
            <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }} onClick={() => setView("login")}>
              🔑 Sign In
            </button>
          </div>
        </nav>
        <main className="main-content">
          {view === "login" && (
            showLogin ? (
              <LoginPage onSwitchToRegister={() => setShowLogin(false)} onSuccess={() => {}} />
            ) : (
              <RegisterPage onSwitchToLogin={() => setShowLogin(true)} onSuccess={() => setShowLogin(true)} />
            )
          )}
          {view === "dashboard" && <DashboardPage />}
          {view === "events" && <EventsPage onSelectEvent={handleSelectEvent} />}
          {view === "event-detail" && selectedEvent && (
            <EventDetailPage event={selectedEvent} onBack={() => navigate("events")} onNavigateToGallery={() => navigate("gallery")} isAdmin={false} />
          )}
          {view === "gallery" && <PhotoGalleryPage isAdmin={false} />}
          {view === "volunteer" && <VolunteerPage />}
          {view === "about" && <AboutPage />}
        </main>
        <footer style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
          ❤️ Lifewire Event — Give Care · Made with compassion for those in need
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a
            className="navbar-brand"
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("dashboard"); }}
          >
            <span className="navbar-brand-icon">❤️</span>
            <span>Give Care</span>
          </a>
          <div className="navbar-links">
            <button className={`nav-link ${view === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>
              📊 Dashboard
            </button>
            <button className={`nav-link ${view === "events" ? "active" : ""}`} onClick={() => navigate("events")}>
              🎉 Events
            </button>
            <button className={`nav-link ${view === "gallery" ? "active" : ""}`} onClick={() => navigate("gallery")}>
              📸 Gallery
            </button>
            <button className={`nav-link ${view === "volunteer" ? "active" : ""}`} onClick={() => navigate("volunteer")}>
              🙋 Volunteer
            </button>
            <button className={`nav-link ${view === "about" ? "active" : ""}`} onClick={() => navigate("about")}>
              ℹ️ About
            </button>
            {user?.is_admin && (
              <button
                className={`nav-link ${view === "admin" ? "active" : ""}`}
                onClick={() => navigate("admin")}
                style={{ background: view === "admin" ? "rgba(255,255,255,0.2)" : "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-sm)", marginLeft: "0.5rem" }}
              >
                ⚙️ Admin
              </button>
            )}
          </div>
          {/* User badge + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user && (
              <button className="user-badge" onClick={() => navigate("profile")} style={{ cursor: "pointer", border: "none", background: "rgba(255,255,255,0.15)" }} title="View profile">
                <div className="user-badge-avatar">
                  {user.display_name?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.display_name || user.username}</span>
              </button>
            )}
            <button className="nav-link" onClick={handleLogout} style={{ border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-sm)" }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {view === "dashboard" && <DashboardPage />}
        {view === "events" && <EventsPage onSelectEvent={handleSelectEvent} />}
        {view === "event-detail" && selectedEvent && (
          <EventDetailPage event={selectedEvent} onBack={() => navigate("events")} onNavigateToGallery={() => navigate("gallery")} isAdmin={user?.is_admin ?? false} />
        )}
        {view === "gallery" && <PhotoGalleryPage isAdmin={user?.is_admin ?? false} />}
        {view === "volunteer" && <VolunteerPage />}
        {view === "profile" && user && <ProfilePage user={user} />}
        {view === "admin" && <AdminPage />}
        {view === "about" && <AboutPage />}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
        ❤️ Lifewire Event — Give Care · Made with compassion for those in need
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;