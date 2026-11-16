
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function LoginMaster() {
  const emptyForm = {
    loginId: "",
    employeeId: "",
    email: "",
    roleId: "",
    status: "Active",
  };

  const [logins, setLogins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // LOAD DATABASE RECORDS

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [loginResult, employeeResult, roleResult] =
        await Promise.all([
          supabase
            .from("login_master")
            .select("login_id, employee_name, email, role_id, status, employee_id")
            .order("login_id"),

          supabase
            .from("employee_master")
            .select("employee_id, employee_name")
            .order("employee_name"),

          supabase
            .from("role_master")
            .select("id, role_name, status")
            .order("id"),
        ]);

      if (loginResult.error) throw loginResult.error;
      if (employeeResult.error) throw employeeResult.error;
      if (roleResult.error) throw roleResult.error;

      setLogins(loginResult.data || []);
      setEmployees(employeeResult.data || []);
      setRoles(roleResult.data || []);

      console.log("Employees:", employeeResult.data);
      console.log("Roles:", roleResult.data);
      console.log("Login accounts:", loginResult.data);

    } catch (err) {
      console.error("Login Master loading error:", err);
      setError(err.message || "Unable to load data from Supabase.");

      setEmployees([]);
      setRoles([]);
      setLogins([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);

  // GET ROLE NAME
  function getRoleName(roleId) {
    return (
      roles.find((role) => role.id === roleId)?.role_name ||
      "Unknown Role"
    );
  }

  // ADMIN PROTECTION
  function isAdmin(item) {
    return (
      item.login_id === "ADMIN001" ||
      getRoleName(item.role_id).toLowerCase() === "admin"
    );
  }

  // EMPLOYEES WITHOUT LOGIN ACCOUNTS
  const availableEmployees = employees.filter(
    (employee) =>
      !logins.some(
        (login) => login.employee_id === employee.employee_id
      )
  );

  // SEARCH
  const filteredLogins = logins.filter((item) =>
    `${item.login_id} ${item.employee_name} ${item.email} ${getRoleName(item.role_id)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // STATISTICS
  const totalCount = logins.length;

  const activeCount = logins.filter(
    (item) => item.status?.toLowerCase() === "active"
  ).length;

  const inactiveCount = logins.filter(
    (item) => item.status?.toLowerCase() === "inactive"
  ).length;

  // FORM INPUT
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // OPEN CREATE FORM
  function handleCreate() {
    setError("");
    setMessage("");
    setEditingId(null);

    setForm({
      ...emptyForm,
      roleId:
        roles.find(
          (role) =>
            role.role_name.toLowerCase() === "employee" &&
            role.status?.toLowerCase() === "active"
        )?.id?.toString() || "",
    });

    setShowForm(true);
  }

  // CLOSE FORM
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  // CREATE / UPDATE LOGIN
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (saving) return;

    const selectedRole = roles.find(
      (role) => role.id === Number(form.roleId)
    );

    if (
      !selectedRole ||
      selectedRole.status?.toLowerCase() !== "active"
    ) {
      setError("Please select an active role.");
      return;
    }

    // CREATE LOGIN
    if (editingId === null) {
      const selectedEmployee = employees.find(
        (employee) =>
          employee.employee_id === form.employeeId
      );

      if (!selectedEmployee) {
        setError("Please select a valid employee.");
        return;
      }

      if (
        selectedRole.role_name.toLowerCase() === "admin"
      ) {
        setError("Additional Admin accounts cannot be created.");
        return;
      }

      setSaving(true);

      const { data, error: functionError } =
        await supabase.functions.invoke("manage-login", {
          body: {
            login_id: form.loginId.trim(),
            employee_id: form.employeeId,
            email: form.email.trim().toLowerCase(),
            role_id: Number(form.roleId),
          },
        });

      setSaving(false);

      if (functionError || !data?.success) {
        setError(
          data?.error ||
          functionError?.message ||
          "Unable to create login account."
        );
        return;
      }

      setMessage(
        "Invitation sent successfully to " + form.email.trim()
      );

      closeForm();
      await loadData();
      return;
    }

    // UPDATE EXISTING LOGIN
    const existingLogin = logins.find(
      (item) => item.login_id === editingId
    );

    if (!existingLogin || isAdmin(existingLogin)) {
      setError("This account cannot be modified.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("login_master")
      .update({
        role_id: Number(form.roleId),
        status: form.status,
      })
      .eq("login_id", editingId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Login account updated successfully.");

    closeForm();
    await loadData();
  }

  // EDIT LOGIN
  function handleEdit(item) {
    if (isAdmin(item)) return;

    setError("");
    setMessage("");

    setForm({
      loginId: item.login_id,
      employeeId: item.employee_id,
      email: item.email,
      roleId: item.role_id.toString(),
      status: item.status,
    });

    setEditingId(item.login_id);
    setShowForm(true);
  }

  // ACTIVATE / DEACTIVATE
  async function toggleStatus(item) {
    if (isAdmin(item)) return;

    const newStatus =
      item.status?.toLowerCase() === "active"
        ? "Inactive"
        : "Active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus.toLowerCase()} this login account?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("login_master")
      .update({ status: newStatus })
      .eq("login_id", item.login_id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(`Account ${newStatus.toLowerCase()} successfully.`);
    await loadData();
  }

  // SELECTED EMPLOYEE
  const selectedEmployee = employees.find(
    (employee) => employee.employee_id === form.employeeId
  );

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

      {/* MESSAGES */}
      {message && (
        <p role="status" style={{ color: "green", marginBottom: "15px" }}>
          {message}
        </p>
      )}

      {error && (
        <p role="alert" style={{ color: "red", marginBottom: "15px" }}>
          {error}
        </p>
      )}

      {/* STATISTICS */}
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

      {/* CREATE / EDIT FORM */}
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
                {editingId !== null
                  ? "Update the account details below."
                  : "Create a login account and send an invitation."}
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
                  disabled={editingId !== null}
                  required
                />
              </div>

              <div className="master-field">
                <label>Select Employee *</label>

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  disabled={editingId !== null}
                  required
                >
                  <option value="">Select Employee</option>

                  {availableEmployees.map((employee) => (
                    <option
                      key={employee.employee_id}
                      value={employee.employee_id}
                    >
                      {employee.employee_name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="master-field">
                <label>Employee Name</label>

                <input
                  type="text"
                  value={selectedEmployee?.employee_name || ""}
                  placeholder="Select an employee"
                  readOnly
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
                  disabled={editingId !== null}
                  required
                />
              </div>

              <div className="master-field">
                <label>Assign Role *</label>

                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>

                  {roles
                    .filter(
                      (role) =>
                        String(role.status || "").trim().toLowerCase() === "active" &&
                        String(role.role_name || "").trim().toLowerCase() !== "admin"
                    )
                    .map((role) => (
                      <option
                        key={role.id}
                        value={String(role.id)}
                      >
                        {role.role_name}
                      </option>
                    ))}
                </select>
              </div>

              {editingId !== null && (
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
              )}

            </div>

            <div className="master-actions">

              <button
                type="button"
                className="master-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="master-primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Please wait..."
                  : editingId !== null
                    ? "Update Account"
                    : "Create Account"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* LOGIN TABLE */}
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

              {loading ? (
                <tr>
                  <td colSpan="6" className="master-empty">
                    Loading login accounts...
                  </td>
                </tr>
              ) : filteredLogins.length > 0 ? (

                filteredLogins.map((item) => (
                  <tr key={item.login_id}>

                    <td>
                      <strong>{item.login_id}</strong>
                    </td>

                    <td>{item.employee_name}</td>

                    <td>{item.email}</td>

                    <td>{getRoleName(item.role_id)}</td>

                    <td>
                      <span
                        className={`login-status-badge ${
                          item.status?.toLowerCase() === "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="login-row-actions">

                        {isAdmin(item) ? (
                          <span>Protected</span>
                        ) : (
                          <>
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
                              onClick={() => toggleStatus(item)}
                            >
                              {item.status?.toLowerCase() === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </>
                        )}

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
