import React, { useEffect, useState, useCallback } from "react";
import {
  getAdminAnalytics,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventBookings,
  BASE_URL,
} from "../services/api";
import Notification from "../components/Notification";
import Loader from "../components/Loader";

const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshops", "Seminars"];
const STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const emptyForm = {
  title: "",
  description: "",
  category: "Technical",
  date: "",
  time: "",
  venue: "",
  totalSeats: "",
  status: "Upcoming",
};

const AdminDashboard = () => {
  const [activeTab, setTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Bug 9 fix
  const [notif, setNotif] = useState({ msg: "", type: "success" });
  const [bookings, setBookings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const showNotif = (msg, type = "success") => setNotif({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, eRes] = await Promise.all([
        getAdminAnalytics(),
        getEvents(),
      ]);
      setAnalytics(aRes.data.analytics);
      setEvents(eRes.data.events);
    } catch {
      showNotif("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date.split("T")[0],
      time: event.time,
      venue: event.venue,
      totalSeats: event.totalSeats,
      status: event.status,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.description ||
      !form.date ||
      !form.time ||
      !form.venue ||
      !form.totalSeats
    ) {
      return showNotif("Please fill in all required fields", "error");
    }
    setFormLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      if (imageFile) data.append("image", imageFile);

      if (editingEvent) {
        await updateEvent(editingEvent._id, data);
        showNotif("Event updated successfully!");
      } else {
        await createEvent(data);
        showNotif("Event created successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showNotif(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Bug 9 fix: loading state on delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this event and all its bookings? This cannot be undone.",
      )
    )
      return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      showNotif("Event deleted successfully");
      fetchData();
    } catch (err) {
      showNotif(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const viewBookings = async (event) => {
    setSelectedEvent(event);
    setTab("bookings");
    setBookingsLoading(true);
    try {
      const res = await getEventBookings(event._id);
      setBookings(res.data.bookings);
    } catch {
      showNotif("Failed to load bookings", "error");
    } finally {
      setBookingsLoading(false);
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <>
      <Notification
        message={notif.msg}
        type={notif.type}
        onClose={() => setNotif({ msg: "" })}
      />

      <div className="admin-layout">
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>Admin Panel</h2>
            <p>EduEvents Manager</p>
          </div>
          <nav className="admin-nav">
            {[
              { id: "overview", icon: "📊", label: "Overview" },
              { id: "events", icon: "🎪", label: "Events" },
              { id: "bookings", icon: "🎟️", label: "Bookings" },
            ].map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="admin-main">
          {/* ────────── Overview Tab ────────── */}
          {activeTab === "overview" && analytics && (
            <div>
              <h2 className="admin-section-title">Dashboard Overview</h2>

              <div className="analytics-grid">
                {[
                  {
                    icon: "👥",
                    num: analytics.totalUsers,
                    label: "Total Students",
                  },
                  {
                    icon: "🎪",
                    num: analytics.totalEvents,
                    label: "Total Events",
                  },
                  {
                    icon: "🎟️",
                    num: analytics.totalBookings,
                    label: "Total Bookings",
                  },
                ].map((s) => (
                  <div className="analytics-card" key={s.label}>
                    <div className="analytics-icon">{s.icon}</div>
                    <div className="analytics-info">
                      <h3>{s.num}</h3>
                      <p>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: "1rem", fontWeight: "700" }}>
                Events by Category
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  marginBottom: "2rem",
                }}
              >
                {analytics.eventsByCategory.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                    }}
                  >
                    {c._id}: {c.count}
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: "1rem", fontWeight: "700" }}>
                Recent Events
              </h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Seats (Available/Total)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Bug 3 fix: availableSeats now always populated */}
                    {analytics.recentEvents.map((e) => (
                      <tr key={e._id}>
                        <td style={{ fontWeight: "600" }}>{e.title}</td>
                        <td>{e.category}</td>
                        <td>{new Date(e.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: "var(--primary-light)",
                              color: "var(--primary)",
                            }}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td
                          style={{
                            color:
                              e.availableSeats === 0
                                ? "var(--danger)"
                                : "inherit",
                            fontWeight: "600",
                          }}
                        >
                          {e.availableSeats} / {e.totalSeats}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────── Events Tab ────────── */}
          {activeTab === "events" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 className="admin-section-title" style={{ margin: 0 }}>
                  Manage Events
                </h2>
                <button className="btn btn-primary" onClick={openCreate}>
                  + Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🎪</div>
                  <h3>No events yet</h3>
                  <p>Create your first event using the button above</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Seats</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id}>
                          <td style={{ fontWeight: "600", maxWidth: "180px" }}>
                            {event.title}
                          </td>
                          <td>{event.category}</td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                              }}
                            >
                              {event.status}
                            </span>
                          </td>
                          <td
                            style={{
                              color:
                                event.availableSeats === 0
                                  ? "var(--danger)"
                                  : "inherit",
                              fontWeight: "600",
                            }}
                          >
                            {event.availableSeats}/{event.totalSeats}
                          </td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => viewBookings(event)}
                              >
                                Bookings
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openEdit(event)}
                              >
                                Edit
                              </button>
                              {/* Bug 9 fix: loading state */}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(event._id)}
                                disabled={deletingId === event._id}
                              >
                                {deletingId === event._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ────────── Bookings Tab ────────── */}
          {activeTab === "bookings" && (
            <div>
              <h2 className="admin-section-title">
                {selectedEvent
                  ? `Bookings: ${selectedEvent.title}`
                  : "Select an event to view bookings"}
              </h2>

              {bookingsLoading ? (
                <Loader fullPage />
              ) : bookings.length > 0 ? (
                <>
                  <p
                    style={{
                      color: "var(--gray)",
                      marginBottom: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {bookings.filter((b) => b.status === "confirmed").length}{" "}
                    confirmed •{" "}
                    {bookings.filter((b) => b.status === "cancelled").length}{" "}
                    cancelled
                  </p>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Booking Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b._id}>
                            <td style={{ fontWeight: "600" }}>
                              {b.userId?.name}
                            </td>
                            <td>{b.userId?.email}</td>
                            <td>
                              {new Date(b.bookingDate).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🎟️</div>
                  <h3>
                    {selectedEvent
                      ? "No bookings for this event yet"
                      : "Go to Events tab and click 'Bookings' on any event"}
                  </h3>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    className="form-input"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the event..."
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      className="form-input"
                      type="text"
                      name="time"
                      value={form.time}
                      onChange={handleFormChange}
                      placeholder="e.g. 10:00 AM"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue *</label>
                    <input
                      className="form-input"
                      name="venue"
                      value={form.venue}
                      onChange={handleFormChange}
                      placeholder="Event venue"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Seats *</label>
                    <input
                      className="form-input"
                      type="number"
                      name="totalSeats"
                      value={form.totalSeats}
                      onChange={handleFormChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Banner Image</label>
                  <input
                    className="form-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                  {editingEvent?.image && !imageFile && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <img
                        src={`${BASE_URL}${editingEvent.image}`}
                        alt="Current"
                        style={{
                          width: "60px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <span
                        style={{ fontSize: "0.8rem", color: "var(--gray)" }}
                      >
                        Current image
                      </span>
                    </div>
                  )}
                  <small style={{ color: "var(--gray)", fontSize: "0.8rem" }}>
                    Max 5MB. JPG, PNG, GIF, WEBP
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
