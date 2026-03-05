import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import Notification from "../components/Notification";

const Profile = () => {
  const { user, token, login } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNew: "",
  });
  const [nameErrors, setNameErrors] = useState({});
  const [passErrors, setPassErrors] = useState({});
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [notif, setNotif] = useState({ msg: "", type: "success" });

  const showNotif = (msg, type = "success") => setNotif({ msg, type });

  const validateName = () => {
    const errors = {};
    if (!nameForm.name.trim() || nameForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    return errors;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passForm.currentPassword)
      errors.currentPassword = "Current password is required";
    if (passForm.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (passForm.newPassword !== passForm.confirmNew)
      errors.confirmNew = "Passwords do not match";
    return errors;
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    const errors = validateName();
    if (Object.keys(errors).length > 0) {
      setNameErrors(errors);
      return;
    }
    setNameLoading(true);
    try {
      const res = await updateProfile({ name: nameForm.name.trim() });
      // Bug 11 fix: re-call login() to update AuthContext AND localStorage
      // so navbar reflects new name immediately without page refresh
      login(res.data.user, token);
      showNotif("✅ Name updated successfully!");
      setNameErrors({});
    } catch (err) {
      showNotif(err.response?.data?.message || "Update failed", "error");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      return;
    }
    setPassLoading(true);
    try {
      await updateProfile({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassForm({ currentPassword: "", newPassword: "", confirmNew: "" });
      setPassErrors({});
      showNotif("✅ Password changed successfully!");
    } catch (err) {
      showNotif(
        err.response?.data?.message || "Password update failed",
        "error",
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <>
      <Notification
        message={notif.msg}
        type={notif.type}
        onClose={() => setNotif({ msg: "" })}
      />
      <div className="profile-page">
        {/* Header Card */}
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <span className="profile-role">{user?.role}</span>
          <div
            style={{ marginTop: "0.75rem", fontSize: "0.8rem", opacity: 0.75 }}
          >
            Member since{" "}
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long" },
            )}
          </div>
        </div>

        {/* Update Name */}
        <div className="profile-form" style={{ marginBottom: "1.5rem" }}>
          <h3>Update Name</h3>
          <form onSubmit={handleNameUpdate} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input ${nameErrors.name ? "input-error" : ""}`}
                value={nameForm.name}
                onChange={(e) => {
                  setNameForm({ name: e.target.value });
                  if (nameErrors.name) setNameErrors({});
                }}
                placeholder="Your full name"
              />
              {nameErrors.name && (
                <p className="form-error">{nameErrors.name}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={nameLoading}
            >
              {nameLoading ? "Saving..." : "Update Name"}
            </button>
          </form>
        </div>

        <hr className="divider" />

        {/* Change Password */}
        <div className="profile-form">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordUpdate} noValidate>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                className={`form-input ${passErrors.currentPassword ? "input-error" : ""}`}
                type="password"
                placeholder="Your current password"
                value={passForm.currentPassword}
                onChange={(e) => {
                  setPassForm({ ...passForm, currentPassword: e.target.value });
                  if (passErrors.currentPassword)
                    setPassErrors({ ...passErrors, currentPassword: "" });
                }}
              />
              {passErrors.currentPassword && (
                <p className="form-error">{passErrors.currentPassword}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className={`form-input ${passErrors.newPassword ? "input-error" : ""}`}
                type="password"
                placeholder="Minimum 6 characters"
                value={passForm.newPassword}
                onChange={(e) => {
                  setPassForm({ ...passForm, newPassword: e.target.value });
                  if (passErrors.newPassword)
                    setPassErrors({ ...passErrors, newPassword: "" });
                }}
              />
              {passErrors.newPassword && (
                <p className="form-error">{passErrors.newPassword}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                className={`form-input ${passErrors.confirmNew ? "input-error" : ""}`}
                type="password"
                placeholder="Repeat new password"
                value={passForm.confirmNew}
                onChange={(e) => {
                  setPassForm({ ...passForm, confirmNew: e.target.value });
                  if (passErrors.confirmNew)
                    setPassErrors({ ...passErrors, confirmNew: "" });
                }}
              />
              {passErrors.confirmNew && (
                <p className="form-error">{passErrors.confirmNew}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={passLoading}
            >
              {passLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
