
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import "./EmployeeMaster.css";

const emptyForm = {
  name: "",
  employeeId: "",
  designation: "",
  office: "",
  company: "",
};

function EmployeeMaster() {
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [offices, setOffices] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch all employee master data from Supabase
  async function fetchData() {
    setLoading(true);
    setPageError("");

    try {
      const [
        employeeResult,
        companyResult,
        officeResult,
        designationResult,
      ] = await Promise.all([
        supabase
          .from("employee_master")
          .select("employee_id, employee_name, company_id, office_id, designation_id")
          .order("employee_name"),

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

      if (employeeResult.error) throw employeeResult.error;
      if (companyResult.error) throw companyResult.error;
      if (officeResult.error) throw officeResult.error;
      if (designationResult.error) throw designationResult.error;

      setCompanies(companyResult.data || []);
      setOffices(officeResult.data || []);
      setDesignations(designationResult.data || []);

      const companyMap = new Map(
        (companyResult.data || []).map((item) => [
          String(item.id),
          item.company_name,
        ])
      );

      const officeMap = new Map(
        (officeResult.data || []).map((item) => [
          String(item.id),
          item.office_name,
        ])
      );

      const designationMap = new Map(
        (designationResult.data || []).map((item) => [
          String(item.id),
          item.designation_name,
        ])
      );

      const formattedEmployees = (employeeResult.data || []).map(
        (employee) => ({
          id: employee.employee_id,
          employeeId: employee.employee_id,
          name: employee.employee_name,
          companyId: String(employee.company_id),
          officeId: String(employee.office_id),
          designationId: String(employee.designation_id),
          company: companyMap.get(String(employee.company_id)) || "Unknown",
          office: officeMap.get(String(employee.office_id)) || "Unknown",
          designation:
            designationMap.get(String(employee.designation_id)) || "Unknown",
        })
      );

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Employee Master fetch error:", error);
      setPageError(error.message || "Unable to load employee records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Search employees
  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) =>
      [
        employee.name,
        employee.employeeId,
        employee.designation,
        employee.office,
        employee.company,
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [employees, search]);

  // Offices belonging to the selected company
  const filteredOffices = useMemo(() => {
    return offices.filter(
      (office) => String(office.company_id) === String(formData.company)
    );
  }, [offices, formData.company]);

  function openAddForm() {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name,
      employeeId: employee.employeeId,
      company: employee.companyId,
      office: employee.officeId,
      designation: employee.designationId,
    });

    setFormError("");
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "company" ? { office: "" } : {}),
    }));

    setFormError("");
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
    setFormError("");
  }

  // Add or update employee in Supabase
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const employeeId = formData.employeeId.trim().toUpperCase();
    const employeeName = formData.name.trim();

    if (!employeeName || !employeeId) {
      setFormError("Please enter the employee name and ID.");
      return;
    }

    if (!formData.company || !formData.office || !formData.designation) {
      setFormError("Please select company, office and designation.");
      return;
    }

    const selectedOffice = offices.find(
      (office) => String(office.id) === String(formData.office)
    );

    if (
      !selectedOffice ||
      String(selectedOffice.company_id) !== String(formData.company)
    ) {
      setFormError("Please select an office belonging to the selected company.");
      return;
    }

    const duplicateId = employees.some(
      (employee) =>
        employee.employeeId.toLowerCase() === employeeId.toLowerCase() &&
        employee.employeeId !== editingEmployee?.employeeId
    );

    if (duplicateId) {
      setFormError("This Employee ID already exists.");
      return;
    }

    const employeeData = {
      employee_id: employeeId,
      employee_name: employeeName,
      company_id: Number(formData.company),
      office_id: Number(formData.office),
      designation_id: Number(formData.designation),
    };

    setSaving(true);

    try {
      let result;

      if (editingEmployee) {
        // Employee ID is the primary key, so it remains unchanged.
        result = await supabase
          .from("employee_master")
          .update({
            employee_name: employeeData.employee_name,
            company_id: employeeData.company_id,
            office_id: employeeData.office_id,
            designation_id: employeeData.designation_id,
          })
          .eq("employee_id", editingEmployee.employeeId);
      } else {
        result = await supabase
          .from("employee_master")
          .insert([employeeData]);
      }

      if (result.error) throw result.error;

      await fetchData();

      setShowModal(false);
      setEditingEmployee(null);
      setFormData(emptyForm);
      setFormError("");
    } catch (error) {
      console.error("Employee save error:", error);
      setFormError(error.message || "Unable to save employee.");
    } finally {
      setSaving(false);
    }
  }

  // Delete employee from Supabase
  async function handleDelete(employeeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    setPageError("");

    try {
      const { error } = await supabase
        .from("employee_master")
        .delete()
        .eq("employee_id", employeeId);

      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error("Employee delete error:", error);

      setPageError(
        error.message ||
          "Unable to delete employee. This employee may be linked to other records."
      );
    }
  }

  return (
    <main className="employee-master-page">
      <div className="employee-master-header">
        <div>
          <h2>Employee Master</h2>
          <p>Manage employee information and office assignments.</p>
        </div>

        <button
          type="button"
          className="add-employee-btn"
          onClick={openAddForm}
        >
          <span>+</span> Add Employee
        </button>
      </div>

      <div className="employee-master-search">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {pageError && (
        <p className="employee-form-error">{pageError}</p>
      )}

      <div className="employee-master-table-wrapper">
        <table className="employee-master-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Designation</th>
              <th>Office</th>
              <th className="employee-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="employee-master-empty">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr key={employee.employeeId}>
                  <td>{index + 1}</td>

                  <td className="employee-name-cell">
                    {employee.name}
                  </td>

                  <td>{employee.employeeId}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.office}</td>

                  <td>
                    <div className="employee-master-actions">
                      <button
                        type="button"
                        className="employee-master-edit"
                        title="Edit Employee"
                        onClick={() => openEditForm(employee)}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="employee-master-delete"
                        title="Delete Employee"
                        onClick={() => handleDelete(employee.employeeId)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="employee-master-empty">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="employee-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h3>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>
                <p>Enter the employee details below.</p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-form-group">
                <label htmlFor="employeeName">Employee Name</label>
                <input
                  id="employeeName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeCode">Employee ID</label>
                <input
                  id="employeeCode"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Example: EMP005"
                  required
                  readOnly={!!editingEmployee}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeCompany">Company</label>
                <select
                  id="employeeCompany"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select company</option>

                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeOffice">Office</label>
                <select
                  id="employeeOffice"
                  name="office"
                  value={formData.office}
                  onChange={handleChange}
                  required
                  disabled={!formData.company}
                >
                  <option value="">Select office</option>

                  {filteredOffices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.office_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeDesignation">Designation</label>
                <select
                  id="employeeDesignation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select designation</option>

                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.designation_name}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="employee-form-error">{formError}</p>
              )}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-modal-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-modal-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default EmployeeMaster;
