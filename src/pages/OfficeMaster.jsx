
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import "./OfficeMaster.css";

function OfficeMaster() {
  const [offices, setOffices] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
  });

  // Fetch companies and offices from Supabase
  async function fetchData() {
    setLoading(true);
    setError("");

    const [companyResult, officeResult] = await Promise.all([
      supabase
        .from("company_master")
        .select("id, company_name")
        .order("company_name", { ascending: true }),

      supabase
        .from("office_master")
        .select("id, office_name, company_id")
        .order("id", { ascending: true }),
    ]);

    if (companyResult.error) {
      setError(companyResult.error.message);
      setCompanies([]);
      setOffices([]);
      setLoading(false);
      return;
    }

    if (officeResult.error) {
      setError(officeResult.error.message);
      setCompanies(companyResult.data || []);
      setOffices([]);
      setLoading(false);
      return;
    }

    setCompanies(companyResult.data || []);

    // Convert database records into the format used by the UI
    const companyMap = new Map(
      (companyResult.data || []).map((company) => [
        company.id,
        company.company_name,
      ])
    );

    const formattedOffices = (officeResult.data || []).map((office) => ({
      id: office.id,
      name: office.office_name,
      companyId: office.company_id,
      company: companyMap.get(office.company_id) || "Unknown Company",
    }));

    setOffices(formattedOffices);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Search offices
  const filteredOffices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return offices.filter(
      (office) =>
        office.name.toLowerCase().includes(query) ||
        office.company.toLowerCase().includes(query)
    );
  }, [offices, search]);

  // Open Add form
  function openAddForm() {
    setEditingOffice(null);
    setFormData({ name: "", company: "" });
    setError("");
    setShowModal(true);
  }

  // Open Edit form
  function openEditForm(office) {
    setEditingOffice(office);

    setFormData({
      name: office.name,
      company: String(office.companyId),
    });

    setError("");
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingOffice(null);
    setFormData({ name: "", company: "" });
    setError("");
  }

  // Handle form input
  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Add or Update office
  async function handleSubmit(e) {
    e.preventDefault();

    const officeName = formData.name.trim();
    const companyId = Number(formData.company);

    if (!officeName || !formData.company) {
      setError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(companyId) || companyId <= 0) {
      setError("Please select a valid company.");
      return;
    }

    const duplicate = offices.some(
      (office) =>
        office.name.toLowerCase() === officeName.toLowerCase() &&
        office.id !== editingOffice?.id
    );

    if (duplicate) {
      setError("An office with this name already exists.");
      return;
    }

    setSaving(true);
    setError("");

    const officeData = {
      office_name: officeName,
      company_id: companyId,
    };

    let result;

    if (editingOffice) {
      result = await supabase
        .from("office_master")
        .update(officeData)
        .eq("id", editingOffice.id);
    } else {
      result = await supabase
        .from("office_master")
        .insert([officeData]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setShowModal(false);
    setEditingOffice(null);
    setFormData({ name: "", company: "" });

    await fetchData();

    setSaving(false);
  }

  // Delete office
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this office?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("office_master")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchData();
  }

  return (
    <main className="office-master-page">
      <div className="office-page-header">
        <div>
          <h2>Office Master</h2>
          <p>Manage company offices and their locations.</p>
        </div>

        <button
          type="button"
          className="add-office-btn"
          onClick={openAddForm}
          disabled={loading}
        >
          <span>+</span> Add Office
        </button>
      </div>

      {error && !showModal && (
        <p className="office-error">{error}</p>
      )}

      <div className="office-search">
        <span className="office-search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search office..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="office-table-container">
        <table className="office-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Office Name</th>
              <th>Company</th>
              <th className="office-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="office-empty">
                  Loading offices...
                </td>
              </tr>
            ) : filteredOffices.length > 0 ? (
              filteredOffices.map((office, index) => (
                <tr key={office.id}>
                  <td>{index + 1}</td>

                  <td className="office-name-cell">
                    {office.name}
                  </td>

                  <td>{office.company}</td>

                  <td>
                    <div className="office-action-buttons">
                      <button
                        type="button"
                        className="office-edit-btn"
                        title="Edit Office"
                        onClick={() => openEditForm(office)}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="office-delete-btn"
                        title="Delete Office"
                        onClick={() => handleDelete(office.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="office-empty">
                  No offices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="office-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="office-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="office-modal-header">
              <h3>
                {editingOffice ? "Edit Office" : "Add New Office"}
              </h3>

              <button
                type="button"
                className="office-close-btn"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="office-form-group">
                <label htmlFor="officeName">Office Name</label>

                <input
                  id="officeName"
                  type="text"
                  name="name"
                  placeholder="Enter office name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="office-form-group">
                <label htmlFor="officeCompany">Company</label>

                <select
                  id="officeCompany"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select company</option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="office-error">{error}</p>
              )}

              <div className="office-modal-actions">
                <button
                  type="button"
                  className="office-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="office-save-btn"
                  disabled={saving || companies.length === 0}
                >
                  {saving
                    ? "Saving..."
                    : editingOffice
                    ? "Update Office"
                    : "Save Office"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default OfficeMaster;
