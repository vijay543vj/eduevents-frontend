import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserBookings, getEvents } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, eRes] = await Promise.all([
          getUserBookings(),
          getEvents({ status: "Upcoming" }),
        ]);
        setBookings(bRes.data.bookings);
        setUpcoming(eRes.data.events.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullPage />;

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary), #7c3aed)",
          color: "white",
          borderRadius: "var(--radius)",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800" }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ opacity: 0.85, marginTop: "0.5rem" }}>
          Here's your activity overview
        </p>
      </div>

      {/* Stats */}
      <div className="analytics-grid" style={{ marginBottom: "2.5rem" }}>
        {[
          { icon: "🎟️", num: confirmed, label: "Active Bookings" },
          { icon: "❌", num: cancelled, label: "Cancelled Bookings" },
          { icon: "📅", num: upcoming.length, label: "Upcoming Events" },
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

      {/* Quick Links */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem",
        }}
      >
        <Link to="/events" className="btn btn-primary">
          Browse Events
        </Link>
        <Link to="/bookings" className="btn btn-secondary">
          My Bookings
        </Link>
        <Link to="/profile" className="btn btn-secondary">
          Edit Profile
        </Link>
      </div>

      {/* Upcoming Events List */}
      <h2 className="admin-section-title">Upcoming Events</h2>
      {upcoming.length > 0 ? (
        <div>
          {upcoming.map((event) => {
            // Safe seat calculation — guard against undefined
            const availableSeats =
              event.availableSeats ?? event.totalSeats ?? 0;
            const isFull = availableSeats === 0;

            return (
              <div
                key={event._id}
                style={{
                  background: "white",
                  borderRadius: "var(--radius)",
                  padding: "1rem 1.25rem",
                  marginBottom: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "var(--shadow)",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "var(--dark)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {event.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--gray)",
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>📍 {event.venue}</span>
                    <span className={isFull ? "seats-full" : "seats-available"}>
                      🪑{" "}
                      {isFull ? "Fully Booked" : `${availableSeats} seats left`}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/events/${event._id}`}
                  className={`btn btn-sm ${isFull ? "btn-secondary" : "btn-primary"}`}
                >
                  {isFull ? "View" : "Book Now"}
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "var(--gray)" }}>
          No upcoming events at the moment.
        </p>
      )}
    </div>
  );
};

export default StudentDashboard;
