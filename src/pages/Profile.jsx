
import { useState } from "react";
import "./Profile.css";

function Profile({ currentUser, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    employeeId: currentUser?.employeeId || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    designation: currentUser?.designation || "",
    department: currentUser?.department || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [message, setMessage] = useState("");

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleProfileChange(e) {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    setIsEditing(false);
    setMessage("Profile updated successfully!");
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();

    if (passwords.new.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }

    setMessage(
      "Password validated. Connect authentication to save the new password."
    );

    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });

    setShowPasswordForm(false);
  }

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings.</p>
        </div>
      </div>

      {message && (
        <div className="profile-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="profile-layout">
        {/* PROFILE OVERVIEW */}
        <div className="profile-overview-card">
          <div className="profile-cover"></div>

          <div className="profile-avatar">
            {initials || "U"}
          </div>

          <h2>{profile.name}</h2>
          <p className="profile-role">
            {currentUser?.designation || "User"}
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
                <p>View and update your personal details.</p>
              </div>

              <button
                className="profile-edit-btn"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setMessage("");
                }}
                type="button"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Employee ID</label>
                  <input
                    value={profile.employeeId}
                    disabled
                  />
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="profile-field">
                  <label>Designation</label>
                  <input
                    value={profile.designation}
                    disabled
                  />
                </div>

                <div className="profile-field">
                  <label>Department</label>
                  <input
                    value={profile.department}
                    disabled
                  />
                </div>
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button className="profile-save-btn" type="submit">
                    Save Changes
                  </button>
                </div>
              )}
            </form>
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
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setMessage("");
                }}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

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
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="profile-save-btn" type="submit">
                    Update Password
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
