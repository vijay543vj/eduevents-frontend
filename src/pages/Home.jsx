import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents, getPublicStats } from "../services/api";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: "-",
    totalUsers: "-",
    totalBookings: "-",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents({ status: "Upcoming" });
        setEvents(res.data.events.slice(0, 3));
      } catch (err) {
        console.error("Events fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error("Stats fetch error:", err);
        // Fallback if API fails
        setStats({
          totalEvents: "...",
          totalUsers: "...",
          totalBookings: "...",
        });
      }
    };

    fetchEvents();
    fetchStats();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <h1 className="hero-title">Discover Campus Events</h1>
        <p className="hero-subtitle">
          Book your seat for workshops, seminars, cultural fests, sports
          tournaments and more — all in one place.
        </p>
        <div className="hero-actions">
          <Link to="/events" className="btn btn-lg hero-btn-white">
            Browse Events
          </Link>
          <Link to="/register" className="btn btn-lg hero-btn-outline">
            Join Free
          </Link>
        </div>
      </section>

      {/* ── Real Stats Bar ── */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <div className="stat-number">{stats.totalEvents}</div>
            <div className="stat-label">Events Hosted</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Students Enrolled</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-label">Seats Booked</div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">Upcoming Events</h2>
          <p className="page-subtitle">
            Don't miss out on these exciting events
          </p>
        </div>

        {loading ? (
          <Loader fullPage />
        ) : events.length > 0 ? (
          <>
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link to="/events" className="btn btn-primary btn-lg">
                View All Events →
              </Link>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎪</div>
            <h3>No upcoming events yet</h3>
            <p>Check back soon for exciting events!</p>
          </div>
        )}
      </div>

      {/* ── Categories ── */}
      <div style={{ background: "var(--light-gray)", padding: "3rem 0" }}>
        <div className="page-container">
          <div className="page-header" style={{ textAlign: "center" }}>
            <h2 className="page-title">Browse by Category</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              { name: "Technical", icon: "💻" },
              { name: "Cultural", icon: "🎭" },
              { name: "Sports", icon: "⚽" },
              { name: "Workshops", icon: "🔧" },
              { name: "Seminars", icon: "🎓" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/events?category=${cat.name}`}
                style={{
                  background: "white",
                  borderRadius: "var(--radius)",
                  padding: "1.5rem",
                  textAlign: "center",
                  boxShadow: "var(--shadow)",
                  transition: "var(--transition)",
                  display: "block",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                  {cat.icon}
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "var(--dark)",
                    fontSize: "0.9rem",
                  }}
                >
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
