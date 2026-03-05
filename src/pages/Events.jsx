import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getEvents } from "../services/api";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";

const CATEGORIES = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshops",
  "Seminars",
];
const STATUSES = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setCategory] = useState("All");
  const [activeStatus, setStatus] = useState("All");
  const [searchParams] = useSearchParams();

  // Apply category from URL query param (e.g. from home page category links)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  // Fetch from API whenever category or status filter changes
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory !== "All") params.category = activeCategory;
        if (activeStatus !== "All") params.status = activeStatus;
        const res = await getEvents(params);
        setEvents(res.data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeCategory, activeStatus]);

  // Client-side search filter — runs on every keystroke against already-fetched events
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(events);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const results = events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query),
    );
    setFiltered(results);
  }, [searchQuery, events]);

  const handleClearSearch = () => setSearchQuery("");

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Events</h1>
        <p className="page-subtitle">Find and book events that interest you</p>
      </div>

      {/* ── Search Bar ── */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, venue, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={handleClearSearch}>
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="search-results-count">
            {filtered.length === 0
              ? "No results found"
              : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* ── Category Filter ── */}
      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => {
              setCategory(cat);
              setSearchQuery("");
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Status Filter ── */}
      <div className="filter-bar" style={{ marginBottom: "2rem" }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-btn ${activeStatus === s ? "active" : ""}`}
            onClick={() => {
              setStatus(s);
              setSearchQuery("");
            }}
            style={{ fontSize: "0.8rem" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Results ── */}
      {loading ? (
        <Loader fullPage />
      ) : filtered.length > 0 ? (
        <div className="events-grid">
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>
            {searchQuery
              ? `No events match "${searchQuery}"`
              : "No events found"}
          </h3>
          <p>
            {searchQuery
              ? "Try a different search term or clear the search"
              : "Try changing the filters above"}
          </p>
          {searchQuery && (
            <button
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={handleClearSearch}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
