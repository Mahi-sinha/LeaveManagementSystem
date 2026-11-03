
import { useMemo, useState } from "react";
import "./DesignationMaster.css";

const initialDesignations = [
  { id: 1, name: "Software Engineer", description: "Software Development" },
  { id: 2, name: "HR Executive", description: "Human Resources" },
  { id: 3, name: "Project Manager", description: "Project Management" },
  { id: 4, name: "Team Lead", description: "Team Management" },
  { id: 5, name: "Tester", description: "Quality Assurance" },
];

function DesignationMaster() {
  const [designations, setDesignations] = useState(initialDesignations);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filteredDesignations = useMemo(() => {
    const query = search.toLowerCase().trim();

    return designations.filter(
      (designation) =>
        designation.name.toLowerCase().includes(query) ||
        designation.description.toLowerCase().includes(query)
    );
  }, [designations, search]);

  function openAddForm() {
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  }

  function openEditForm(designation) {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description,
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

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) return;

    const duplicate = designations.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingDesignation?.id
    );

    if (duplicate) {
      alert("This designation already exists.");
      return;
    }

    if (editingDesignation) {
      setDesignations((previous) =>
        previous.map((item) =>
          item.id === editingDesignation.id
            ? { ...item, name, description }
            : item
        )
      );
    } else {
      setDesignations((previous) => [
        ...previous,
        {
          id: Date.now(),
          name,
          description,
        },
      ]);
    }

    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (confirmed) {
      setDesignations((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  }

  return (
    <main className="designation-master-page">
      <div className="designation-page-header">
        <div>
          <h2>Designation Master</h2>
          <p>Manage employee designations and their descriptions.</p>
        </div>

        <button
          type="button"
          className="add-designation-btn"
          onClick={openAddForm}
        >
          <span>+</span> Add Designation
        </button>
      </div>

      <div className="designation-search">
        <span className="designation-search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="designation-table-container">
        <table className="designation-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Designation Name</th>
              <th>Description</th>
              <th className="designation-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDesignations.length > 0 ? (
              filteredDesignations.map((designation, index) => (
                <tr key={designation.id}>
                  <td>{index + 1}</td>

                  <td className="designation-name-cell">
                    {designation.name}
                  </td>

                  <td>{designation.description || "—"}</td>

                  <td>
                    <div className="designation-action-buttons">
                      <button
                        type="button"
                        className="designation-edit-btn"
                        title="Edit Designation"
                        onClick={() => openEditForm(designation)}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="designation-delete-btn"
                        title="Delete Designation"
                        onClick={() => handleDelete(designation.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="designation-empty">
                  No designations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="designation-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="designation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="designation-modal-header">
              <h3>
                {editingDesignation
                  ? "Edit Designation"
                  : "Add New Designation"}
              </h3>

              <button
                type="button"
                className="designation-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="designation-form-group">
                <label htmlFor="designationName">
                  Designation Name
                </label>

                <input
                  id="designationName"
                  type="text"
                  name="name"
                  placeholder="Enter designation name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="designation-form-group">
                <label htmlFor="designationDescription">
                  Description
                </label>

                <textarea
                  id="designationDescription"
                  name="description"
                  placeholder="Enter designation description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="designation-modal-actions">
                <button
                  type="button"
                  className="designation-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="designation-save-btn"
                >
                  {editingDesignation ? "Update Designation" : "Save Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default DesignationMaster;
