import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        textAlign: "center",
        padding: "5rem 2rem",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>🔍</div>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "900",
          color: "var(--dark)",
          marginBottom: "0.5rem",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "var(--gray)",
          marginBottom: "1rem",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--gray)",
          maxWidth: "400px",
          marginBottom: "2rem",
          lineHeight: "1.6",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
        <Link to="/" className="btn btn-primary btn-lg">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
