import React from "react";

const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="loader-inline">
      <div className="spinner-small"></div>
    </div>
  );
};

export default Loader;
