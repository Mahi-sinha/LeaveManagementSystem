
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./CompanyMaster.css";

function CompanyMaster() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch companies from Supabase
  const fetchCompanies = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("company_master")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setCompanies([]);
    } else {
      setCompanies(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Search companies
  const filteredCompanies = companies.filter((company) =>
    `${company.company_name} ${company.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Open Add form
  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setError("");
    setShowForm(true);
  };

  // Open Edit form
  const openEditForm = (company) => {
    setEditingId(company.id);

    setFormData({
      name: company.company_name,
      description: company.description,
    });

    setError("");
    setShowForm(true);
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or Update company
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    setError("");

    const companyData = {
      company_name: formData.name.trim(),
      description: formData.description.trim(),
    };

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("company_master")
        .update(companyData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("company_master")
        .insert([companyData]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });

    await fetchCompanies();

    setSaving(false);
  };

  // Delete company
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("company_master")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchCompanies();
  };

  return (
    <div className="company-master-page">
      <div className="company-page-header">
        <h2>Company Master</h2>

        <button className="add-company-btn" onClick={openAddForm}>
          <span>＋</span> Add Company
        </button>
      </div>

      {error && !showForm && (
        <p className="company-error">{error}</p>
      )}

      <div className="company-search">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="company-table-container">
        <table className="company-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Company Name</th>
              <th>Description</th>
              <th className="company-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="company-empty">
                  Loading companies...
                </td>
              </tr>
            ) : filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <tr key={company.id}>
                  <td>{index + 1}</td>

                  <td className="company-name-cell">
                    {company.company_name}
                  </td>

                  <td>{company.description}</td>

                  <td>
                    <div className="company-action-buttons">
                      <button
                        className="company-edit-btn"
                        title="Edit"
                        onClick={() => openEditForm(company)}
                      >
                        ✎
                      </button>

                      <button
                        className="company-delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(company.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="company-empty">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="company-modal-overlay">
          <div className="company-modal">
            <div className="company-modal-header">
              <h3>
                {editingId !== null ? "Edit Company" : "Add Company"}
              </h3>

              <button
                className="company-close-btn"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="company-form-group">
                <label>Company Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Enter company description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              {error && (
                <p className="company-error">{error}</p>
              )}

              <div className="company-modal-actions">
                <button
                  type="button"
                  className="company-cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="company-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Company"
                    : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyMaster;
