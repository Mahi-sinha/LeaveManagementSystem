
import { useState } from "react";

function ApprovingOfficerDashboard({
  applications = [],
  onReview,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const pendingApplications = applications.filter(
    (application) => application.status === "Forwarded"
  );

  const approvedApplications = applications.filter(
    (application) => application.status === "Approved"
  );

  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  );

  const filteredApplications = applications.filter((application) => {
    const searchableText = [
      application.id,
      application.employeeName,
      application.employeeId,
      application.type,
    ]
      .join(" ")
      .toLowerCase();

    return (
      application.status === "Forwarded" ||
      application.status === "Approved" ||
      application.status === "Rejected"
    ) && searchableText.includes(searchTerm.toLowerCase());
  });

  function getDates(application) {
    if (application.dates) return application.dates;

    if (application.startDate && application.endDate) {
      return `${application.startDate} – ${application.endDate}`;
    }

    return "Date not available";
  }

  return (
    <main className="dashboard-main approving-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Approving Officer Dashboard</h1>
          <p>Review applications forwarded for final approval.</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">PV</div>
          <div>
            <strong>Priya Verma</strong>
            <span>Approving Officer</span>
          </div>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <section className="reporting-summary">
        <div className="reporting-stat-card">
          <div className="reporting-stat-icon review-icon">
            <span>◷</span>
          </div>
          <div>
            <p>Pending Approval</p>
            <h2>{pendingApplications.length}</h2>
            <span className="reporting-stat-note">
              Awaiting your decision
            </span>
          </div>
        </div>

        <div className="reporting-stat-card">
          <div className="reporting-stat-icon forwarded-icon">
            <span>✓</span>
          </div>
          <div>
            <p>Approved Applications</p>
            <h2>{approvedApplications.length}</h2>
            <span className="reporting-stat-note">
              Final approvals completed
            </span>
          </div>
        </div>

        <div className="reporting-stat-card">
          <div className="reporting-stat-icon rejected-icon">
            <span>✕</span>
          </div>
          <div>
            <p>Rejected Applications</p>
            <h2>{rejectedApplications.length}</h2>
            <span className="reporting-stat-note">
              Final decisions completed
            </span>
          </div>
        </div>
      </section>

      {/* APPLICATION TABLE */}
      <section className="dashboard-panel reporting-applications-panel">
        <div className="panel-heading">
          <div>
            <h2>Leave Applications</h2>
            <p>
              Applications forwarded by Reporting Officers.
            </p>
          </div>

          <span className="reporting-count">
            {pendingApplications.length} Pending
          </span>
        </div>

        <div className="reporting-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by employee name, ID or leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="applications-table-wrapper">
          <table className="applications-table reporting-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div className="reporting-employee">
                      <div className="reporting-employee-avatar">
                        {(application.employeeName || "E")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <strong>
                          {application.employeeName || "Employee"}
                        </strong>
                        <span>
                          {application.employeeId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>{application.type}</td>
                  <td>{getDates(application)}</td>
                  <td>{application.days}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        application.status === "Forwarded"
                          ? "forwarded"
                          : application.status.toLowerCase()
                      }`}
                    >
                      {application.status === "Forwarded"
                        ? "Pending Approval"
                        : application.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="reporting-review-button"
                      onClick={() => onReview?.(application)}
                    >
                      {application.status === "Forwarded"
                        ? "Review"
                        : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="reporting-empty-state">
              <div>📄</div>
              <h3>No applications found</h3>
              <p>
                Forwarded applications will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="applications-footer">
          Showing {filteredApplications.length} applications
        </div>
      </section>
    </main>
  );
}

export default ApprovingOfficerDashboard;
