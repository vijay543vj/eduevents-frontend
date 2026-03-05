import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserBookings, cancelBooking, BASE_URL } from "../services/api";
import Loader from "../components/Loader";
import Notification from "../components/Notification";

const CATEGORY_ICONS = {
  Technical: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Workshops: "🔧",
  Seminars: "🎓",
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancelId] = useState(null);
  const [notif, setNotif] = useState({ msg: "", type: "success" });

  const fetchBookings = async () => {
    try {
      const res = await getUserBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelId(bookingId);
    try {
      await cancelBooking(bookingId);
      setNotif({ msg: "Booking cancelled. Seat restored.", type: "success" });
      fetchBookings();
    } catch (err) {
      setNotif({
        msg: err.response?.data?.message || "Failed to cancel",
        type: "error",
      });
    } finally {
      setCancelId(null);
    }
  };

  if (loading) return <Loader fullPage />;

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <>
      <Notification
        message={notif.msg}
        type={notif.type}
        onClose={() => setNotif({ msg: "" })}
      />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track all your event registrations</p>
        </div>

        {/* Summary */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-sm)",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
          >
            ✅ {confirmed} Confirmed
          </div>
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-sm)",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
          >
            ❌ {cancelled} Cancelled
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟️</div>
            <h3>No bookings yet</h3>
            <p>You haven't booked any events. Start exploring!</p>
            <Link
              to="/events"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => {
              const event = booking.eventId;
              if (!event) return null;
              const imageUrl = event.image ? `${BASE_URL}${event.image}` : null;
              const isCancellable =
                booking.status === "confirmed" &&
                event.status !== "Completed" &&
                event.status !== "Cancelled";
              return (
                <div className="booking-item" key={booking._id}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="booking-item-img"
                    />
                  ) : (
                    <div className="booking-item-icon">
                      {CATEGORY_ICONS[event.category] || "🎪"}
                    </div>
                  )}

                  <div className="booking-item-info">
                    <div className="booking-item-title">{event.title}</div>
                    <div className="booking-item-meta">
                      📅{" "}
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {" • "} ⏰ {event.time}
                      {" • "} 📍 {event.venue}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--gray)",
                        marginTop: "0.25rem",
                      }}
                    >
                      Booked on:{" "}
                      {new Date(booking.bookingDate).toLocaleDateString()}
                      {" • "} Event status:
                      <span
                        style={{ fontWeight: "600", marginLeft: "0.25rem" }}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-item-actions">
                    <span className={`badge badge-${booking.status}`}>
                      {booking.status}
                    </span>
                    {isCancellable && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                    <Link
                      to={`/events/${event._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default BookingHistory;
