import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEventById,
  bookEvent,
  getUserBookings,
  cancelBooking,
  BASE_URL,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";
import Loader from "../components/Loader";

const CATEGORY_ICONS = {
  Technical: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Workshops: "🔧",
  Seminars: "🎓",
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notification, setNotification] = useState({
    msg: "",
    type: "success",
  });

  const showNotif = (msg, type = "success") => setNotification({ msg, type });
  const clearNotif = () => setNotification({ msg: "", type: "success" });

  // Initial data load only
  useEffect(() => {
    const initialLoad = async () => {
      try {
        // Fetch event and user bookings in parallel
        const promises = [getEventById(id)];
        if (isStudent()) promises.push(getUserBookings());

        const results = await Promise.all(promises);

        // Set event
        setEvent(results[0].data.event);

        // Set existing booking if student
        if (isStudent() && results[1]) {
          const found = results[1].data.bookings.find(
            (b) => b.eventId?._id === id && b.status === "confirmed",
          );
          setExistingBooking(found || null);
        }
      } catch {
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [id]); // Only re-run if event ID changes

  // ── Book a seat ──────────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!user) return navigate("/login");
    setBookingLoading(true);
    try {
      await bookEvent({ eventId: id });
      showNotif("🎉 Booking confirmed! Enjoy the event.");

      // Fetch both fresh data in parallel and set state directly
      const [eventRes, bookingRes] = await Promise.all([
        getEventById(id),
        getUserBookings(),
      ]);

      // Direct state updates — no intermediate stale renders
      setEvent(eventRes.data.event);
      const found = bookingRes.data.bookings.find(
        (b) => b.eventId?._id === id && b.status === "confirmed",
      );
      setExistingBooking(found || null);
    } catch (err) {
      showNotif(err.response?.data?.message || "Booking failed", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Cancel booking ───────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!existingBooking) return;
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    setBookingLoading(true);
    try {
      await cancelBooking(existingBooking._id);
      showNotif("Booking cancelled. Your seat has been restored.", "info");

      // Fetch fresh event directly and set state
      const eventRes = await getEventById(id);
      setEvent(eventRes.data.event);
      setExistingBooking(null);
    } catch (err) {
      showNotif(err.response?.data?.message || "Cancellation failed", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!event) return null;

  // ── Safe seat calculations ───────────────────────────────────────────────────
  const availableSeats = event.availableSeats ?? event.totalSeats ?? 0;
  const totalSeats = event.totalSeats ?? 0;
  const filledSeats = totalSeats - availableSeats;
  const fillPercent =
    totalSeats > 0
      ? Math.min(100, Math.max(0, Math.round((filledSeats / totalSeats) * 100)))
      : 0;
  const isFull = availableSeats === 0;
  const isBookable =
    !isFull && event.status !== "Cancelled" && event.status !== "Completed";
  const imageUrl = event.image ? `${BASE_URL}${event.image}` : null;

  return (
    <>
      <Notification
        message={notification.msg}
        type={notification.type}
        onClose={clearNotif}
      />

      <div className="event-detail">
        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="event-detail-image"
          />
        ) : (
          <div className="event-detail-placeholder">
            {CATEGORY_ICONS[event.category] || "🎪"}
          </div>
        )}

        {/* Header */}
        <div className="event-detail-header">
          <div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                }}
              >
                {CATEGORY_ICONS[event.category]} {event.category}
              </span>
              <span
                style={{
                  background:
                    event.status === "Cancelled"
                      ? "#fee2e2"
                      : event.status === "Completed"
                        ? "#f1f5f9"
                        : "#d1fae5",
                  color:
                    event.status === "Cancelled"
                      ? "#991b1b"
                      : event.status === "Completed"
                        ? "#64748b"
                        : "#065f46",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                }}
              >
                {event.status}
              </span>
            </div>
            <h1 className="event-detail-title">{event.title}</h1>
          </div>

          {/* Booking Action Area */}
          <div>
            {/* Not logged in */}
            {!user && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/login")}
              >
                Login to Book
              </button>
            )}

            {/* Admin cannot book */}
            {user && isAdmin() && (
              <div
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "0.875rem 1.25rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                👑 Admins cannot book events
              </div>
            )}

            {/* Student booking controls */}
            {user && isStudent() && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                }}
              >
                {existingBooking ? (
                  <>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancel}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Cancelling..." : "Cancel Booking"}
                    </button>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--secondary)",
                        fontWeight: "600",
                      }}
                    >
                      ✅ You have booked this event
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleBook}
                      disabled={bookingLoading || !isBookable}
                    >
                      {bookingLoading
                        ? "Booking..."
                        : isFull
                          ? "No Seats Available"
                          : "Book Seat"}
                    </button>
                    {!isBookable && !isFull && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--danger)",
                          fontWeight: "600",
                        }}
                      >
                        This event is {event.status.toLowerCase()}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="event-detail-info">
          {[
            {
              label: "Date",
              value: new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
            { label: "Time", value: event.time },
            { label: "Venue", value: event.venue },
            { label: "Total Seats", value: totalSeats },
            { label: "Available", value: availableSeats },
            {
              label: "Organizer",
              value: event.createdBy?.name || "College Admin",
            },
          ].map((info) => (
            <div className="info-box" key={info.label}>
              <div className="info-box-label">{info.label}</div>
              <div
                className="info-box-value"
                style={
                  info.label === "Available" && availableSeats === 0
                    ? { color: "var(--danger)" }
                    : {}
                }
              >
                {info.value}
              </div>
            </div>
          ))}
        </div>

        {/* Seats Progress */}
        <div className="seats-progress">
          <div className="seats-progress-label">
            <span>Seats Filled</span>
            <span>
              {filledSeats} / {totalSeats}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${fillPercent >= 80 ? "danger" : ""}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          About This Event
        </h2>
        <p className="event-description">{event.description}</p>
      </div>
    </>
  );
};

export default EventDetails;
