
import { useState } from "react";
import "./CompanyMaster.css";

const initialCompanies = [
  { id: 1, name: "ABC Technologies", description: "IT Services" },
  { id: 2, name: "XYZ Solutions", description: "Software Development" },
  { id: 3, name: "Global Tech", description: "Consulting" },
  { id: 4, name: "Sunrise Group", description: "Finance & Investment" },
];

function CompanyMaster() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filteredCompanies = companies.filter((company) =>
    `${company.name} ${company.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setShowForm(true);
  };

  const openEditForm = (company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      description: company.description,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (editingId !== null) {
      setCompanies((previous) =>
        previous.map((company) =>
          company.id === editingId
            ? { ...company, ...formData }
            : company
        )
      );
    } else {
      setCompanies((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: formData.name.trim(),
          description: formData.description.trim(),
        },
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (confirmed) {
      setCompanies((previous) =>
        previous.filter((company) => company.id !== id)
      );
    }
  };

  return (
    <div className="company-master-page">
      <div className="company-page-header">
        <h2>Company Master</h2>

        <button className="add-company-btn" onClick={openAddForm}>
          <span>＋</span> Add Company
        </button>
      </div>

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
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <tr key={company.id}>
                  <td>{index + 1}</td>
                  <td className="company-name-cell">{company.name}</td>
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
                onClick={() => setShowForm(false)}
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

              <div className="company-modal-actions">
                <button
                  type="button"
                  className="company-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="company-save-btn">
                  {editingId !== null ? "Update Company" : "Save Company"}
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
