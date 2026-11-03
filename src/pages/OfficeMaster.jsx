
import { useMemo, useState } from "react";
import "./OfficeMaster.css";

const initialOffices = [
  { id: 1, name: "Noida Office", company: "ABC Technologies" },
  { id: 2, name: "Gurgaon Office", company: "ABC Technologies" },
  { id: 3, name: "Bangalore Office", company: "XYZ Solutions" },
  { id: 4, name: "Chennai Office", company: "Global Tech" },
];

const companies = [
  "ABC Technologies",
  "XYZ Solutions",
  "Global Tech",
  "Sunrise Group",
];

function OfficeMaster() {
  const [offices, setOffices] = useState(initialOffices);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
  });

  const filteredOffices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return offices.filter(
      (office) =>
        office.name.toLowerCase().includes(query) ||
        office.company.toLowerCase().includes(query)
    );
  }, [offices, search]);

  function openAddForm() {
    setEditingOffice(null);
    setFormData({ name: "", company: "" });
    setShowModal(true);
  }

  function openEditForm(office) {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      company: office.company,
    });
    setShowModal(true);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const officeName = formData.name.trim();

    if (!officeName || !formData.company) {
      return;
    }

    const duplicate = offices.some(
      (office) =>
        office.name.toLowerCase() === officeName.toLowerCase() &&
        office.id !== editingOffice?.id
    );

    if (duplicate) {
      alert("An office with this name already exists.");
      return;
    }

    if (editingOffice) {
      setOffices((previous) =>
        previous.map((office) =>
          office.id === editingOffice.id
            ? { ...office, ...formData, name: officeName }
            : office
        )
      );
    } else {
      setOffices((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: officeName,
          company: formData.company,
        },
      ]);
    }

    setShowModal(false);
    setEditingOffice(null);
    setFormData({ name: "", company: "" });
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this office?"
    );

    if (confirmed) {
      setOffices((previous) =>
        previous.filter((office) => office.id !== id)
      );
    }
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
        >
          <span>+</span> Add Office
        </button>
      </div>

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
            {filteredOffices.length > 0 ? (
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
          onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
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
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="office-modal-actions">
                <button
                  type="button"
                  className="office-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="office-save-btn"
                >
                  {editingOffice ? "Update Office" : "Save Office"}
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
