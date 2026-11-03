import { useState } from "react";

function MyApplications({ applications = [], onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter applications by search term and status
  const filteredApplications = applications.filter((application) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (application.type || "").toLowerCase().includes(search) ||
      (application.dates || "").toLowerCase().includes(search) ||
      String(application.id).toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const approvedApplications = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  // Format date for display
  function formatDate(application) {
    if (application.dates) {
      return application.dates;
    }

    if (application.startDate && application.endDate) {
      return application.startDate === application.endDate
        ? application.startDate
        : `${application.startDate} – ${application.endDate}`;
    }

    return application.startDate || application.endDate || "—";
  }

  return (
    <main className="dashboard-main">
      {/* Page Header */}
      <header className="dashboard-header">
        <div>
          <h2>My Applications</h2>
          <p>View and track all your leave requests.</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">AJ</div>
          <div>
            <strong>Anushka Jha</strong>
            <span>Employee</span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="application-summary">
        <div className="summary-card">
          <div className="summary-icon total-icon">▤</div>
          <div>
            <p>Total Applications</p>
            <h3>{totalApplications}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon pending-icon">◷</div>
          <div>
            <p>Pending</p>
            <h3>{pendingApplications}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon approved-icon">✓</div>
          <div>
            <p>Approved</p>
            <h3>{approvedApplications}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon rejected-icon">×</div>
          <div>
            <p>Rejected</p>
            <h3>{rejectedApplications}</h3>
          </div>
        </div>
      </section>

      {/* Applications Table Panel */}
      <section className="dashboard-panel applications-panel">
        <div className="panel-heading">
          <div>
            <h3>Leave History</h3>
            <p>Manage and review your submitted applications.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="application-toolbar">
          <div className="application-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search by leave type, date, or ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter applications by status"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Applications Table */}
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong className="application-id">
                        LF-{application.id}
                      </strong>
                    </td>

                    <td>{application.type}</td>

                    <td>{formatDate(application)}</td>

                    <td>
                      {application.days}{" "}
                      {application.days === 1 ? "day" : "days"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          (application.status || "Pending").toLowerCase()
                        }`}
                      >
                        {application.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() => onViewDetails?.(application)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-applications">
                    <div className="empty-state">
                      <span className="empty-state-icon">▤</span>
                      <h3>No applications found</h3>
                      <p>
                        Try changing your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="applications-footer">
          Showing {filteredApplications.length} of {totalApplications}{" "}
          applications
        </div>
      </section>
    </main>
  );
}

export default MyApplications;