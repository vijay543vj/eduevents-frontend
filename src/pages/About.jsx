import React from "react";
import { Link } from "react-router-dom";

const About = () => (
  <div>
    <div className="about-hero">
      <h1>About EduEvents</h1>
      <p>
        The central hub for all college events — connecting students with
        opportunities to learn, compete, and celebrate.
      </p>
    </div>

    <div className="page-container">
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto 3rem",
          textAlign: "center",
        }}
      >
        <h2
          className="page-title"
          style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
        >
          Our Mission
        </h2>
        <p style={{ color: "var(--gray)", lineHeight: "1.8" }}>
          EduEvents was built to simplify how students discover and participate
          in campus events. From technical workshops to cultural celebrations,
          we make it easy to browse, book, and attend — all in one place.
        </p>
      </div>

      <div className="about-features">
        {[
          {
            icon: "🎯",
            title: "Easy Booking",
            desc: "Book your seat in seconds with our streamlined registration process.",
          },
          {
            icon: "📅",
            title: "All Categories",
            desc: "Technical, Cultural, Sports, Workshops and Seminars — all under one roof.",
          },
          {
            icon: "🔒",
            title: "Secure & Reliable",
            desc: "JWT authentication and role-based access keep your data safe.",
          },
          {
            icon: "📊",
            title: "Live Seat Tracking",
            desc: "See real-time seat availability and never miss out on popular events.",
          },
          {
            icon: "🛡️",
            title: "Admin Control",
            desc: "Powerful admin tools to create, manage, and monitor all events.",
          },
          {
            icon: "📱",
            title: "Responsive Design",
            desc: "Access EduEvents on any device — desktop, tablet, or mobile.",
          },
        ].map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link to="/events" className="btn btn-primary btn-lg">
          Explore Events
        </Link>
      </div>
    </div>
  </div>
);

export default About;
