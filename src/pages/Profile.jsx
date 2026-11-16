
import { useState } from "react";
import "./Profile.css";
import { supabase } from "../supabaseClient";

function Profile({ currentUser }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const profile = {
    name: currentUser?.name || "",
    employeeId: currentUser?.employeeId || "",
    email: currentUser?.email || "",
    designation: currentUser?.designation || "",
    department: currentUser?.department || "",
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function showFeedback(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    // 1. Validate current password
    if (!passwords.current) {
      showFeedback("Please enter your current password.");
      return;
    }

    // 2. Validate new password length
    if (passwords.new.length < 8) {
      showFeedback("Password must contain at least 8 characters.");
      return;
    }

    // 3. Validate password confirmation
    if (passwords.new !== passwords.confirm) {
      showFeedback("New passwords do not match.");
      return;
    }

    // 4. Prevent reusing the current password
    if (passwords.current === passwords.new) {
      showFeedback("New password must be different from current password.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser?.email,
        password: passwords.current,
      });

      if (verifyError) {
        showFeedback("Current password is incorrect.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
        current_password: passwords.current,
      });

      if (error) {
        showFeedback("Password update failed: " + error.message);
        return;
      }

      showFeedback("Password changed successfully!", "success");

      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (error) {
      showFeedback(
        error?.message || "Something went wrong while updating your password."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  function togglePasswordForm() {
    if (isUpdatingPassword) return;

    setShowPasswordForm((previous) => !previous);

    setMessage("");
    setMessageType("");

    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });
  }

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* PROFILE OVERVIEW */}
        <div className="profile-overview-card">
          <div className="profile-cover"></div>

          <div className="profile-avatar">
            {initials || "U"}
          </div>

          <h2>{profile.name}</h2>

          <p className="profile-role">
            {profile.designation || "User"}
          </p>

          <div className="profile-divider"></div>

          <div className="profile-summary">
            <div>
              <span>Employee ID</span>
              <strong>{profile.employeeId}</strong>
            </div>

            <div>
              <span>Department</span>
              <strong>{profile.department || "Not specified"}</strong>
            </div>

            <div>
              <span>Designation</span>
              <strong>{profile.designation || "Not specified"}</strong>
            </div>

            <div>
              <span>Account Status</span>
              <strong className="profile-active">Active</strong>
            </div>
          </div>
        </div>

        {/* PROFILE INFORMATION */}
        <div className="profile-content">
          <section className="profile-section">
            <div className="profile-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Your registered employee information.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={profile.employeeId}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Department</label>
                <input
                  type="text"
                  value={profile.department}
                  disabled
                />
              </div>
            </div>
          </section>

          {/* ACCOUNT SECURITY */}
          <section className="profile-section">
            <div className="profile-section-heading">
              <div>
                <h2>Account Security</h2>
                <p>Manage your account password.</p>
              </div>

              <button
                className="profile-edit-btn"
                type="button"
                onClick={togglePasswordForm}
                disabled={isUpdatingPassword}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

              {message && (
              <div className={`profile-message ${messageType}`} role="alert">
                {message}
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setMessageType("");
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                      disabled={isUpdatingPassword}
                    />
                  </div>

                  <div className="profile-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      required
                      disabled={isUpdatingPassword}
                    />
                  </div>

                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      required
                      disabled={isUpdatingPassword}
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="profile-save-btn"
                    type="submit"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
