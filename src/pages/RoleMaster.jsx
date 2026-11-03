
import { useState } from "react";

const initialRoles = [
  {
    id: 1,
    roleId: "ROLE-1",
    name: "Employee",
    description: "Can apply for leave and track applications.",
    status: "Active",
  },
  {
    id: 2,
    roleId: "ROLE-2",
    name: "Reporting Officer",
    description: "Reviews and forwards employee leave applications.",
    status: "Active",
  },
  {
    id: 3,
    roleId: "ROLE-3",
    name: "Approving Officer",
    description: "Provides final approval or rejection of leave applications.",
    status: "Active",
  },
  {
    id: 4,
    roleId: "ROLE-4",
    name: "Admin",
    description: "Manages company and employee master information.",
    status: "Active",
  },
];

function RoleMaster() {
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  // STATISTICS
  const totalRoles = roles.length;

  const activeRoles = roles.filter(
    (role) => role.status === "Active"
  ).length;

  const inactiveRoles = roles.filter(
    (role) => role.status === "Inactive"
  ).length;

  // SEARCH ROLES
  const filteredRoles = roles.filter((role) =>
    `${role.roleId} ${role.name} ${role.description} ${role.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // FORM INPUT HANDLER
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // OPEN ADD ROLE FORM
  function handleAddRole() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  // CLOSE FORM
  function handleCloseForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // SAVE ROLE
  function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = form.name.trim();

    const duplicate = roles.some(
      (role) =>
        role.id !== editingId &&
        role.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      alert("This role already exists.");
      return;
    }

    if (editingId !== null) {
      // UPDATE EXISTING ROLE
      setRoles((previous) =>
        previous.map((role) =>
          role.id === editingId
            ? {
                ...role,
                name: trimmedName,
                description: form.description.trim(),
                status: form.status,
              }
            : role
        )
      );
    } else {
      // CREATE NEW ROLE
      const nextRoleNumber =
        roles.reduce((max, role) => {
          const number = Number(role.roleId.replace("ROLE-", ""));
          return Math.max(max, number);
        }, 0) + 1;

      const newRole = {
        id: Date.now(),
        roleId: `ROLE-${nextRoleNumber}`,
        name: trimmedName,
        description: form.description.trim(),
        status: form.status,
      };

      setRoles((previous) => [...previous, newRole]);
    }

    handleCloseForm();
  }

  // EDIT ROLE
  function handleEdit(role) {
    setForm({
      name: role.name,
      description: role.description,
      status: role.status,
    });

    setEditingId(role.id);
    setShowForm(true);
  }

  // ACTIVATE / DEACTIVATE ROLE
  function toggleStatus(id) {
    setRoles((previous) =>
      previous.map((role) =>
        role.id === id
          ? {
              ...role,
              status:
                role.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : role
      )
    );
  }

  // DELETE ROLE
  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this role?"
    );

    if (!confirmed) return;

    setRoles((previous) =>
      previous.filter((role) => role.id !== id)
    );
  }

  return (
    <div className="page-content role-master-page">

      {/* PAGE HEADER */}
      <div className="master-header">
        <div>
          <div className="master-breadcrumb">
            Admin <span>/</span> Master Data
          </div>

          <h1>Role Master</h1>

          <p>
            Create and manage system roles and their descriptions.
          </p>
        </div>

        <button
          type="button"
          className="master-primary-btn"
          onClick={handleAddRole}
        >
          + Add New Role
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div className="master-stats">

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>♙</span>
          </div>

          <div>
            <p>Total Roles</p>
            <h2>{totalRoles}</h2>
          </div>
        </div>

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>✓</span>
          </div>

          <div>
            <p>Active Roles</p>
            <h2>{activeRoles}</h2>
          </div>
        </div>

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>−</span>
          </div>

          <div>
            <p>Inactive Roles</p>
            <h2>{inactiveRoles}</h2>
          </div>
        </div>

      </div>

      {/* ADD / EDIT ROLE FORM */}
      {showForm && (
        <div className="master-form-card">

          <div className="master-form-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Role"
                  : "Add New Role"}
              </h2>

              <p>
                Enter the role information below.
              </p>
            </div>

            <button
              type="button"
              className="master-close-btn"
              onClick={handleCloseForm}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="master-form-grid">

              <div className="master-field">
                <label htmlFor="roleName">
                  Role Name *
                </label>

                <input
                  id="roleName"
                  type="text"
                  name="name"
                  placeholder="Enter role name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="master-field">
                <label htmlFor="roleStatus">
                  Status
                </label>

                <select
                  id="roleStatus"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="master-field role-description-field">
                <label htmlFor="roleDescription">
                  Description *
                </label>

                <textarea
                  id="roleDescription"
                  name="description"
                  placeholder="Enter role description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

            </div>

            <div className="master-actions">

              <button
                type="button"
                className="master-cancel-btn"
                onClick={handleCloseForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="master-primary-btn"
              >
                {editingId !== null
                  ? "Update Role"
                  : "Save Role"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ROLE LIST */}
      <div className="master-table-card">

        <div className="master-table-header">

          <div>
            <h2>Role List</h2>

            <p>
              Manage all roles available in LeaveFlow.
            </p>
          </div>

          <input
            type="text"
            className="master-search"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* TABLE */}
        <div className="master-table-wrapper">

          <table className="master-table">

            <thead>
              <tr>
                <th>Role ID</th>
                <th>Role Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredRoles.length > 0 ? (

                filteredRoles.map((role) => (

                  <tr key={role.id}>

                    <td>{role.roleId}</td>

                    <td>
                      <strong>{role.name}</strong>
                    </td>

                    <td>{role.description}</td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`role-status-badge ${
                          role.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {role.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="role-row-actions">

                        <button
                          type="button"
                          className="role-edit-btn"
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="role-toggle-btn"
                          onClick={() => toggleStatus(role.id)}
                        >
                          {role.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="role-delete-btn"
                          onClick={() => handleDelete(role.id)}
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="5" className="master-empty">
                    No roles found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}
        <div className="role-table-footer">
          Showing {filteredRoles.length} of {totalRoles} roles
        </div>

      </div>

    </div>
  );
}

export default RoleMaster;
