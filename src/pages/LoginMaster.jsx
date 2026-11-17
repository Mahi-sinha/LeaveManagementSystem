
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function LoginMaster() {
  const emptyForm = {
    loginId: "",
    employeeId: "",
    employeeName: "",
    email: "",
    companyId: "",
    officeId: "",
    designationId: "",
    roleId: "",
    status: "Active",
  };

  const [logins, setLogins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [offices, setOffices] = useState([]);
  const [designations, setDesignations] = useState([]);

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
      const [
        loginResult,
        roleResult,
        companyResult,
        officeResult,
        designationResult,
      ] = await Promise.all([
        supabase
          .from("login_master")
          .select("login_id, employee_name, email, role_id, status, employee_id")
          .order("login_id"),

        supabase
          .from("role_master")
          .select("id, role_name, status")
          .order("id"),

        supabase
          .from("company_master")
          .select("id, company_name")
          .order("company_name"),

        supabase
          .from("office_master")
          .select("id, office_name, company_id")
          .order("office_name"),

        supabase
          .from("designation_master")
          .select("id, designation_name")
          .order("designation_name"),
      ]);

      if (loginResult.error) throw loginResult.error;
      if (roleResult.error) throw roleResult.error;
      if (companyResult.error) throw companyResult.error;
      if (officeResult.error) throw officeResult.error;
      if (designationResult.error) throw designationResult.error;

      setLogins(loginResult.data || []);
      setRoles(roleResult.data || []);
      setCompanies(companyResult.data || []);
      setOffices(officeResult.data || []);
      setDesignations(designationResult.data || []);
    } catch (err) {
      console.error("Login Master loading error:", err);
      setError(err.message || "Unable to load data from Supabase.");

      setLogins([]);
      setRoles([]);
      setCompanies([]);
      setOffices([]);
      setDesignations([]);
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
      roles.find((role) => String(role.id) === String(roleId))
        ?.role_name || "Unknown Role"
    );
  }

  // ADMIN PROTECTION
  function isAdmin(item) {
    return (
      item.login_id === "ADMIN001" ||
      getRoleName(item.role_id).toLowerCase() === "admin"
    );
  }

  // AVAILABLE OFFICES FOR SELECTED COMPANY
  const filteredOffices = offices.filter(
    (office) => String(office.company_id) === String(form.companyId)
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
      ...(name === "companyId" ? { officeId: "" } : {}),
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
      (role) => String(role.id) === String(form.roleId)
    );

    if (
      !selectedRole ||
      selectedRole.status?.toLowerCase() !== "active"
    ) {
      setError("Please select an active application role.");
      return;
    }

    // CREATE EMPLOYEE AND LOGIN ACCOUNT
    if (editingId === null) {
      if (selectedRole.role_name.toLowerCase() === "admin") {
        setError("Additional Admin accounts cannot be created.");
        return;
      }

      if (!form.employeeId.trim() || !form.employeeName.trim()) {
        setError("Please enter Employee ID and Employee Name.");
        return;
      }

      if (!form.companyId || !form.officeId || !form.designationId) {
        setError("Please select Company, Office and Designation.");
        return;
      }

      setSaving(true);

      try {
        const { data, error: functionError } =
          await supabase.functions.invoke("manage-login", {
            body: {
              login_id: form.loginId.trim(),
              employee_id: form.employeeId.trim(),
              employee_name: form.employeeName.trim(),
              email: form.email.trim().toLowerCase(),
              company_id: Number(form.companyId),
              office_id: Number(form.officeId),
              designation_id: Number(form.designationId),
              role_id: Number(form.roleId),
            },
          });

        if (functionError || !data?.success) {
          let message =
            data?.error ||
            functionError?.message ||
            "Unable to create login account.";

          if (functionError?.context?.json) {
            try {
              const details = await functionError.context.json();
              message = details?.error || message;
            } catch {
              // Keep the original error message.
            }
          }

          throw new Error(message);
        }

        setMessage(
          "Employee and login account created. Invitation sent to " +
            form.email.trim()
        );

        setShowForm(false);
        setForm(emptyForm);
        await loadData();
      } catch (err) {
        console.error("Create login error:", err);
        setError(err.message || "Unable to create login account.");
      } finally {
        setSaving(false);
      }

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
      ...emptyForm,
      loginId: item.login_id,
      employeeId: item.employee_id || "",
      employeeName: item.employee_name || "",
      email: item.email,
      roleId: String(item.role_id),
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

  return (
    <div className="page-content login-master-page">

      {/* PAGE HEADER */}
      <div className="master-header">
        <div>
          <div className="master-breadcrumb">
            Admin <span>/</span> Login Master
          </div>

          <h1>Login Master</h1>

          <p>Manage user login accounts and access roles.</p>
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
                  : "Create an employee record and login account together."}
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

              {editingId === null && (
                <div className="master-field">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    placeholder="Enter employee ID"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {editingId === null && (
                <div className="master-field">
                  <label>Employee Name *</label>
                  <input
                    type="text"
                    name="employeeName"
                    placeholder="Enter employee name"
                    value={form.employeeName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

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

              {editingId === null && (
                <>
                  <div className="master-field">
                    <label>Company *</label>
                    <select
                      name="companyId"
                      value={form.companyId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="master-field">
                    <label>Office *</label>
                    <select
                      name="officeId"
                      value={form.officeId}
                      onChange={handleChange}
                      disabled={!form.companyId}
                      required
                    >
                      <option value="">Select Office</option>
                      {filteredOffices.map((office) => (
                        <option key={office.id} value={office.id}>
                          {office.office_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="master-field">
                    <label>Designation *</label>
                    <select
                      name="designationId"
                      value={form.designationId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations.map((designation) => (
                        <option
                          key={designation.id}
                          value={designation.id}
                        >
                          {designation.designation_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="master-field">
                <label>
                  {editingId !== null ? "Application Role *" : "Assign Application Role *"}
                </label>

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
                      <option key={role.id} value={String(role.id)}>
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
            <p>View and manage registered login accounts.</p>
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
                    <td><strong>{item.login_id}</strong></td>
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
