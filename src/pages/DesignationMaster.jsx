
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import "./DesignationMaster.css";

function DesignationMaster() {
  const [designations, setDesignations] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch designations from Supabase
  async function fetchDesignations() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("designation_master")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setDesignations([]);
    } else {
      setDesignations(
        (data || []).map((item) => ({
          id: item.id,
          name: item.designation_name,
          description: item.description || "",
        }))
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDesignations();
  }, []);

  // Search designations
  const filteredDesignations = useMemo(() => {
    const query = search.toLowerCase().trim();

    return designations.filter(
      (designation) =>
        designation.name.toLowerCase().includes(query) ||
        designation.description.toLowerCase().includes(query)
    );
  }, [designations, search]);

  // Open Add form
  function openAddForm() {
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
    setError("");
    setShowModal(true);
  }

  // Open Edit form
  function openEditForm(designation) {
    setEditingDesignation(designation);

    setFormData({
      name: designation.name,
      description: designation.description,
    });

    setError("");
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
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

  // Add or Update designation
  async function handleSubmit(e) {
    e.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Please enter a designation name.");
      return;
    }

    const duplicate = designations.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingDesignation?.id
    );

    if (duplicate) {
      setError("This designation already exists.");
      return;
    }

    setSaving(true);
    setError("");

    const designationData = {
      designation_name: name,
      description: description || null,
    };

    let result;

    if (editingDesignation) {
      result = await supabase
        .from("designation_master")
        .update(designationData)
        .eq("id", editingDesignation.id);
    } else {
      result = await supabase
        .from("designation_master")
        .insert([designationData]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });

    await fetchDesignations();

    setSaving(false);
  }

  // Delete designation
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("designation_master")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchDesignations();
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
          disabled={loading}
        >
          <span>+</span> Add Designation
        </button>
      </div>

      {error && !showModal && (
        <p className="designation-error">{error}</p>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="4" className="designation-empty">
                  Loading designations...
                </td>
              </tr>
            ) : filteredDesignations.length > 0 ? (
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
          onClick={closeModal}
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
                onClick={closeModal}
                disabled={saving}
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

              {error && (
                <p className="designation-error">{error}</p>
              )}

              <div className="designation-modal-actions">
                <button
                  type="button"
                  className="designation-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="designation-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingDesignation
                    ? "Update Designation"
                    : "Save Designation"}
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
