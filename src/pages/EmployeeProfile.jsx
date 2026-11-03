
import { useState } from "react";

function EmployeeProfile({ onCancel }) {
  const [profile, setProfile] = useState({
    name: "Anushka Jha",
    employeeId: "EMP001",
    email: "",
    department: "",
    designation: "",
  });

  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <div>
          <h2>My Profile</h2>
          <p>View and update your personal information.</p>
        </div>
      </header>

      <section className="dashboard-panel profile-panel">
        {/* Profile Heading */}
        <div className="profile-heading">
          <div className="profile-avatar">
            {profile.name
              .split(" ")
              .filter(Boolean)
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <h3>{profile.name || "Employee Name"}</h3>
            <p>{profile.designation || "Employee"}</p>
            <span className="profile-id">
              Employee ID: {profile.employeeId}
            </span>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Profile Form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="profileName">Full Name</label>
              <input
                id="profileName"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profileEmployeeId">
                Employee ID
              </label>
              <input
                id="profileEmployeeId"
                name="employeeId"
                type="text"
                value={profile.employeeId}
                readOnly
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profileEmail">Email Address</label>
              <input
                id="profileEmail"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profileDepartment">
                Department
              </label>
              <input
                id="profileDepartment"
                name="department"
                type="text"
                placeholder="Enter your department"
                value={profile.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profileDesignation">
                Designation
              </label>
              <input
                id="profileDesignation"
                name="designation"
                type="text"
                placeholder="Enter your designation"
                value={profile.designation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {saved && (
            <p className="profile-success">
              Profile changes saved successfully!
            </p>
          )}

          {/* Form Actions */}
          <div className="profile-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-action"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EmployeeProfile;
