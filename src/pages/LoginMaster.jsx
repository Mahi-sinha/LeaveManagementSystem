
import { useState } from "react";

const initialLogins = [
  {
    id: 1,
    loginId: "EMP001",
    name: "Anushka Jha",
    email: "employee@leaveflow.com",
    role: "Employee",
    status: "Active",
  },
  {
    id: 2,
    loginId: "OFF001",
    name: "Rahul Sharma",
    email: "officer@leaveflow.com",
    role: "Reporting Officer",
    status: "Active",
  },
  {
    id: 3,
    loginId: "APR001",
    name: "Priya Verma",
    email: "approver@leaveflow.com",
    role: "Approving Officer",
    status: "Active",
  },
  {
    id: 4,
    loginId: "ADM001",
    name: "Admin",
    email: "admin@leaveflow.com",
    role: "Admin",
    status: "Active",
  },
];

function LoginMaster() {
  // LOGIN DATA
  const [logins, setLogins] = useState(initialLogins);

  // SEARCH
  const [search, setSearch] = useState("");

  // FORM
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    loginId: "",
    name: "",
    email: "",
    role: "Employee",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  // FILTER LOGIN ACCOUNTS
  const filteredLogins = logins.filter((item) =>
    `${item.loginId} ${item.name} ${item.email} ${item.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // STATISTICS
  const totalCount = logins.length;

  const activeCount = logins.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = logins.filter(
    (item) => item.status === "Inactive"
  ).length;

  // HANDLE FORM INPUTS
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // OPEN CREATE FORM
  function handleCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  // CLOSE FORM
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // CREATE OR UPDATE LOGIN
  function handleSubmit(e) {
    e.preventDefault();

    const duplicate = logins.some(
      (item) =>
        item.id !== editingId &&
        (
          item.loginId.toLowerCase() ===
            form.loginId.trim().toLowerCase() ||
          item.email.toLowerCase() ===
            form.email.trim().toLowerCase()
        )
    );

    if (duplicate) {
      alert("Login ID or email already exists.");
      return;
    }

    const updatedForm = {
      ...form,
      loginId: form.loginId.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (editingId !== null) {
      setLogins((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...updatedForm,
                id: editingId,
              }
            : item
        )
      );
    } else {
      const newLogin = {
        ...updatedForm,
        id: Date.now(),
      };

      setLogins((previous) => [...previous, newLogin]);
    }

    closeForm();
  }

  // EDIT LOGIN
  function handleEdit(item) {
    setForm({
      loginId: item.loginId,
      name: item.name,
      email: item.email,
      role: item.role,
      status: item.status,
    });

    setEditingId(item.id);
    setShowForm(true);
  }

  // ACTIVATE / DEACTIVATE LOGIN
  function toggleStatus(id) {
    setLogins((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  }

  // DELETE LOGIN
  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this login account?"
    );

    if (!confirmed) return;

    setLogins((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="page-content login-master-page">

      {/* PAGE HEADER */}
      <div className="master-header">
        <div>
          <div className="master-breadcrumb">
            Admin <span>/</span> Login Master
          </div>

          <h1>Login Master</h1>

          <p>
            Manage user login accounts and access roles.
          </p>
        </div>

        <button
          type="button"
          className="master-primary-btn"
          onClick={handleCreate}
        >
          + Create Login
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div className="master-stats">

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>♟</span>
          </div>

          <div>
            <p>Total Accounts</p>
            <h2>{totalCount}</h2>
          </div>
        </div>

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>✓</span>
          </div>

          <div>
            <p>Active Accounts</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="master-stat-card">
          <div className="master-stat-icon">
            <span>⊘</span>
          </div>

          <div>
            <p>Inactive Accounts</p>
            <h2>{inactiveCount}</h2>
          </div>
        </div>

      </div>

      {/* CREATE / EDIT LOGIN FORM */}
      {showForm && (
        <div className="master-form-card">

          <div className="master-form-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Login Account"
                  : "Create Login Account"}
              </h2>

              <p>
                Enter the login account details below.
              </p>
            </div>

            <button
              type="button"
              className="login-close-btn"
              onClick={closeForm}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="master-form-grid">

              <div className="master-field">
                <label>Login ID *</label>

                <input
                  type="text"
                  name="loginId"
                  placeholder="Enter login ID"
                  value={form.loginId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="master-field">
                <label>Employee Name *</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="master-field">
                <label>Email Address *</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="master-field">
                <label>Assign Role *</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Employee">
                    Employee
                  </option>

                  <option value="Reporting Officer">
                    Reporting Officer
                  </option>

                  <option value="Approving Officer">
                    Approving Officer
                  </option>

                  <option value="Admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="master-field">
                <label>Account Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>

            <div className="master-actions">

              <button
                type="button"
                className="master-cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="master-primary-btn"
              >
                {editingId !== null
                  ? "Update Account"
                  : "Create Account"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* LOGIN ACCOUNTS TABLE */}
      <div className="master-table-card">

        <div className="master-table-header">

          <div>
            <h2>Login Accounts</h2>

            <p>
              View and manage registered login accounts.
            </p>
          </div>

          <input
            type="text"
            className="master-search"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="master-table-wrapper">

          <table className="master-table">

            <thead>
              <tr>
                <th>Login ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredLogins.length > 0 ? (

                filteredLogins.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <strong>{item.loginId}</strong>
                    </td>

                    <td>{item.name}</td>

                    <td>{item.email}</td>

                    <td>{item.role}</td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`login-status-badge ${
                          item.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {item.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="login-row-actions">

                        <button
                          type="button"
                          className="login-edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="login-toggle-btn"
                          onClick={() => toggleStatus(item.id)}
                        >
                          {item.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="login-delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="master-empty">
                    No login accounts found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default LoginMaster;

