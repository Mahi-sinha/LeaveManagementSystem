
import { useMemo, useState } from "react";

function ReportingOfficerDashboard({
  applications = [],
  onReview,
  onNavigate,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Applications awaiting the reporting officer's review
  const pendingApplications = useMemo(
    () =>
      applications.filter(
        (application) => application.status === "Pending"
      ),
    [applications]
  );

  // Applications already forwarded for approval
  const forwardedApplications = applications.filter(
    (application) =>
      application.status === "Forwarded" ||
      application.status === "Approved"
  );

  const filteredApplications = pendingApplications.filter(
    (application) => {
      const search = searchTerm.toLowerCase();

      return (
        String(application.id).toLowerCase().includes(search) ||
        (application.employeeName || "Anushka Jha")
          .toLowerCase()
          .includes(search) ||
        (application.type || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  function getDates(application) {
    if (application.dates) return application.dates;

    if (application.startDate && application.endDate) {
      return `${application.startDate} – ${application.endDate}`;
    }

    return application.startDate || application.endDate || "—";
  }

  return (
    <main className="dashboard-main reporting-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h2>Reporting Officer Dashboard</h2>
          <p>Applications awaiting your review.</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">RS</div>
          <div>
            <strong>Rahul Sharma</strong>
            <span>Reporting Officer</span>
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <section className="reporting-summary">
        <div className="reporting-stat-card">
          <div className="reporting-stat-icon review-icon">
            <span>◷</span>
          </div>

          <div>
            <p>Pending Review</p>
            <h3>{pendingApplications.length}</h3>
            <span className="reporting-stat-note">
              Awaiting your decision
            </span>
          </div>
        </div>

        <div className="reporting-stat-card">
          <div className="reporting-stat-icon forwarded-icon">
            <span>↗</span>
          </div>

          <div>
            <p>Forwarded Applications</p>
            <h3>{forwardedApplications.length}</h3>
            <span className="reporting-stat-note">
              Sent for approval
            </span>
          </div>
        </div>
      </section>

      {/* Pending applications */}
      <section className="dashboard-panel reporting-applications-panel">
        <div className="panel-heading">
          <div>
            <h3>Pending Applications</h3>
            <p>Review employee leave requests and their details.</p>
          </div>

          <span className="reporting-count">
            {pendingApplications.length} Pending
          </span>
        </div>

        {/* Search */}
        <div className="reporting-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by employee name, ID, or leave type..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {/* Applications table */}
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
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <div className="reporting-employee">
                        <div className="reporting-employee-avatar">
                          {(application.employeeName || "AJ")
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {application.employeeName || "Anushka Jha"}
                          </strong>
                          <span>LF-{application.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{application.type || "—"}</td>

                    <td>{getDates(application)}</td>

                    <td>
                      {application.days ?? "—"}
                    </td>

                    <td>
                      <span className="status-badge pending">
                        Pending
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reporting-review-button"
                        onClick={() => {
                          if (onReview) {
                            onReview(application);
                          } else if (onNavigate) {
                            onNavigate("application-details");
                          }
                        }}
                      >
                        Review <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="reporting-empty-state">
                      <span>✓</span>
                      <h3>No pending applications</h3>
                      <p>
                        No applications match your search or are awaiting
                        review.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="applications-footer">
          Showing {filteredApplications.length} of{" "}
          {pendingApplications.length} pending applications
        </div>
      </section>
    </main>
  );
}

export default ReportingOfficerDashboard;
