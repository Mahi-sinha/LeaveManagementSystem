
import { useMemo, useState } from "react";
import "./EmployeeMaster.css";

const initialEmployees = [
  {
    id: 1,
    name: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Software Engineer",
    office: "Noida Office",
    company: "ABC Technologies",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    employeeId: "EMP002",
    designation: "Developer",
    office: "Gurgaon Office",
    company: "ABC Technologies",
  },
  {
    id: 3,
    name: "Priya Singh",
    employeeId: "EMP003",
    designation: "Tester",
    office: "Bangalore Office",
    company: "XYZ Solutions",
  },
  {
    id: 4,
    name: "Amit Verma",
    employeeId: "EMP004",
    designation: "Designer",
    office: "Chennai Office",
    company: "Global Tech",
  },
];

const designations = [
  "Software Engineer",
  "Developer",
  "HR Executive",
  "Tester",
  "Designer",
  "Project Manager",
  "Team Lead",
];

const offices = [
  "Noida Office",
  "Gurgaon Office",
  "Bangalore Office",
  "Chennai Office",
];

const companies = [
  "ABC Technologies",
  "XYZ Solutions",
  "Global Tech",
  "Sunrise Group",
];

const emptyForm = {
  name: "",
  employeeId: "",
  designation: "",
  office: "",
  company: "",
};

function EmployeeMaster() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) =>
      [
        employee.name,
        employee.employeeId,
        employee.designation,
        employee.office,
        employee.company,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [employees, search]);

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
      designation: employee.designation,
      office: employee.office,
      company: employee.company,
    });
    setFormError("");
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      employeeId: formData.employeeId.trim().toUpperCase(),
    };

    const duplicateId = employees.some(
      (employee) =>
        employee.employeeId.toLowerCase() ===
          cleanedData.employeeId.toLowerCase() &&
        employee.id !== editingEmployee?.id
    );

    if (duplicateId) {
      setFormError("This Employee ID already exists.");
      return;
    }

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? { ...employee, ...cleanedData }
            : employee
        )
      );
    } else {
      setEmployees((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...cleanedData,
        },
      ]);
    }

    setShowModal(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (confirmed) {
      setEmployees((previous) =>
        previous.filter((employee) => employee.id !== id)
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
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr key={employee.id}>
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
                        onClick={() => handleDelete(employee.id)}
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
          onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
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
                    <option key={company} value={company}>
                      {company}
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
                >
                  <option value="">Select office</option>
                  {offices.map((office) => (
                    <option key={office} value={office}>
                      {office}
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
                    <option key={designation} value={designation}>
                      {designation}
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
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-modal-save"
                >
                  {editingEmployee ? "Update Employee" : "Save Employee"}
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
