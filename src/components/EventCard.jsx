import React from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../services/api";

const STATUS_COLORS = {
  Upcoming: "#10b981",
  Ongoing: "#3b82f6",
  Completed: "#6b7280",
  Cancelled: "#ef4444",
};

const CATEGORY_ICONS = {
  Technical: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Workshops: "🔧",
  Seminars: "🎓",
};

const EventCard = ({
  event,
  showAdminActions,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const navigate = useNavigate();
  const imageUrl = event.image ? `${BASE_URL}${event.image}` : null;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Safe guard — availableSeats may be undefined in old DB documents
  const availableSeats = event.availableSeats ?? event.totalSeats ?? 0;
  const isFull = availableSeats === 0;

  return (
    <div className="event-card">
      <div className="event-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={event.title} />
        ) : (
          <div className="event-card-placeholder">
            <span>{CATEGORY_ICONS[event.category] || "🎪"}</span>
          </div>
        )}
        <span
          className="event-status-badge"
          style={{ backgroundColor: STATUS_COLORS[event.status] }}
        >
          {event.status}
        </span>
      </div>

      <div className="event-card-body">
        <div className="event-card-category">
          {CATEGORY_ICONS[event.category]} {event.category}
        </div>
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-description">
          {event.description.length > 100
            ? event.description.substring(0, 100) + "..."
            : event.description}
        </p>

        <div className="event-card-meta">
          <span>📅 {formattedDate}</span>
          <span>⏰ {event.time}</span>
          <span>📍 {event.venue}</span>
          <span className={isFull ? "seats-full" : "seats-available"}>
            🪑 {isFull ? "Fully Booked" : `${availableSeats} seats left`}
          </span>
        </div>

        <div className="event-card-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/events/${event._id}`)}
          >
            View Details
          </button>
          {showAdminActions && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => onEdit(event)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(event._id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
