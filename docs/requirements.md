# Lifewire Event – Give Care — Requirements Traceability

> Generated: 2026-07-21

---

## 📖 User Stories

| ID | Story |
|----|-------|
| US-001 | As a **Lifewire Admin**, I want **to create events** so that **I can organize charity campaigns**. |
| US-002 | As a **Lifewire Admin**, I want **to remove inappropriate photos** so that **the gallery stays clean and respectful**. |
| US-003 | As a **Registered User**, I want **to upload photos during an event** so that **I can share my experience**. |
| US-004 | As a **Registered User**, I want **to share photos with others** so that **more people can see the event highlights**. |
| US-005 | As a **Registered User**, I want **to invite others to donate via photo purchases** so that **we can raise funds together**. |
| US-006 | As a **Visitor**, I want **to browse the photo gallery** so that **I can see event highlights and donate**. |
| US-007 | As a **Lifewire Team**, I want **a centralized photo repository** so that **all event media is organized in one place**. |
| US-008 | As a **Lifewire Team**, I want **to drive more donations** so that **our charity mission can be sustained**. |

---

## 📝 Requirements & Traceability Matrix (RTM)

| Req ID | Requirement Description | User Story | Feature / Module | Status |
|--------|------------------------|------------|------------------|--------|
| FR-001 | Admin can create events with title, date, description, donation purpose | US-001 | AdminPage → Event Form | ✅ Complete |
| FR-002 | Admin can edit existing events | US-001 | AdminPage → Edit Event | ✅ Complete |
| FR-003 | Admin can delete events (cascade delete photos) | US-001 | AdminPage → Delete Event | ✅ Complete |
| FR-004 | Admin can remove (hide) inappropriate photos | US-002 | AdminPage → Remove Photo | ✅ Complete |
| FR-005 | Admin can restore previously removed photos | US-002 | AdminPage → Restore Photo | ✅ Complete |
| FR-006 | Registered Users can upload photos during active/upcoming events | US-003 | EventDetailPage → Upload Form | ✅ Complete |
| FR-007 | Photo upload includes title, uploader name, story description | US-003 | EventDetailPage → Upload Form | ✅ Complete |
| FR-008 | AI-generated story for uploaded photos | US-003 | EventDetailPage → Generate Story | ✅ Complete |
| FR-009 | Users can share photos via WhatsApp | US-004 | PhotoGalleryPage / EventDetailPage → Social Share | ✅ Complete |
| FR-010 | Users can share photos via Facebook | US-004 | PhotoGalleryPage / EventDetailPage → Social Share | ✅ Complete |
| FR-011 | Users can copy photo share link to clipboard | US-004 | PhotoGalleryPage / EventDetailPage → Copy Link | ✅ Complete |
| FR-012 | Users can make donations to photos (dummy payment) | US-005 | DonationModal | ✅ Complete |
| FR-013 | Donation counts and amounts tracked per photo | US-005 | backend/models.py → Photo.donate_count / donation_amount | ✅ Complete |
| FR-014 | Public photo gallery with search | US-006 | PhotoGalleryPage | ✅ Complete |
| FR-015 | Photo detail modal with view/share/donate actions | US-006 | PhotoGalleryPage / EventDetailPage → Modal | ✅ Complete |
| FR-016 | Centralized photo repository across all events | US-007 | backend/routers/photos.py → GET /photos/all/gallery | ✅ Complete |
| FR-017 | View counts tracked per photo | US-008 | backend/routers/photos.py → view_count increment | ✅ Complete |
| FR-018 | Dashboard with stats (total events, photos, donations, top photos) | US-008 | DashboardPage | ✅ Complete |
| NFR-001 | Backend API built with FastAPI (async) | All | backend/main.py | ✅ Complete |
| NFR-002 | SQLite database (local) / PostgreSQL (production) | All | backend/database.py | ✅ Complete |
| NFR-003 | JWT authentication | All | backend/routers/auth.py | ✅ Complete |
| NFR-004 | Admin approval flow for new user registrations | US-003 | backend/models.py → User.is_approved | ✅ Complete |
| NFR-005 | Responsive frontend built with React + TypeScript | All | frontend/ | ✅ Complete |
| C-001 | Python 3.11+ required | All | backend/pyproject.toml | ✅ Complete |
| C-002 | Node.js 20+ required | All | frontend/package.json | ✅ Complete |

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| User Stories | 8 |
| Functional Requirements (FR) | 18 |
| Non-Functional Requirements (NFR) | 5 |
| Constraints (C) | 2 |
| **Total Requirements** | **25** |
| **Implemented** | **25 / 25 (100%)** |

---

## ✅ Acceptance Criteria Verification

| Requirement | Acceptance Criteria | Result |
|-------------|-------------------|--------|
| Admin creates event | Admin can fill form with title, date, desc, purpose → event appears in list | ✅ |
| Admin removes photo | Click Remove → photo hidden from public gallery | ✅ |
| User uploads photo | Select file, fill fields → photo appears in event gallery | ✅ |
| User shares photo | Click share → link copied / social media opened | ✅ |
| User donates | Click Donate → enter amount → count + amount updated | ✅ |
| Public gallery | Anyone can see gallery without login | ✅ |