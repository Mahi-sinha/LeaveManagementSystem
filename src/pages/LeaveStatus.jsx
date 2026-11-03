
function LeaveStatus({ applications = [], onViewDetails }) {
  const totalLeaves = applications.length;

  const pendingLeaves = applications.filter(
    (item) => item.status === "Pending" || item.status === "Forwarded"
  ).length;

  const approvedLeaves = applications.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedLeaves = applications.filter(
    (item) => item.status === "Rejected"
  ).length;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const filteredApplications = applications.filter((item) => {
    const matchesSearch =
      `${item.type} ${item.dates} ${item.reason}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" &&
        (item.status === "Pending" || item.status === "Forwarded")) ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function getProgress(status) {
    if (status === "Pending") return 1;
    if (status === "Forwarded") return 2;
    if (status === "Approved" || status === "Rejected") return 3;
    return 0;
  }

  function getStatusLabel(status) {
    if (status === "Forwarded") return "Under Final Review";
    return status;
  }

  function renderProgress(application) {
    const status = application.status;
    const progress = getProgress(status);
    const isRejected = status === "Rejected";

    return (
      <div className={`leave-progress ${isRejected ? "rejected" : ""}`}>
        <div className={`progress-step ${progress >= 1 ? "completed" : ""}`}>
          <span className="progress-circle">
            {progress >= 1 ? "✓" : "1"}
          </span>
          <span>Submitted</span>
        </div>

        <div className={`progress-line ${progress >= 2 ? "completed" : ""}`} />

        <div className={`progress-step ${progress >= 2 ? "completed" : ""}`}>
          <span className="progress-circle">
            {progress >= 2 ? "✓" : "2"}
          </span>
          <span>Reporting Officer</span>
        </div>

        <div className={`progress-line ${progress >= 3 ? "completed" : ""}`} />

        <div className={`progress-step ${progress >= 3 ? "completed" : ""}`}>
          <span className="progress-circle">
            {progress >= 3 ? "✓" : "3"}
          </span>
          <span>Final Decision</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content leave-status-page">

      {/* HEADER */}
      <div className="leave-status-header">
        <div>
          <div className="leave-status-breadcrumb">
            Employee <span>/</span> Leave Status
          </div>

          <h1>Leave Status</h1>

          <p>
            Track your leave applications and approval progress.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="leave-status-stats">

        <div className="leave-status-stat">
          <div className="leave-stat-icon total-icon">▤</div>
          <div>
            <p>Total Applications</p>
            <h2>{totalLeaves}</h2>
          </div>
        </div>

        <div className="leave-status-stat">
          <div className="leave-stat-icon pending-icon">◷</div>
          <div>
            <p>Pending</p>
            <h2>{pendingLeaves}</h2>
          </div>
        </div>

        <div className="leave-status-stat">
          <div className="leave-stat-icon approved-icon">✓</div>
          <div>
            <p>Approved</p>
            <h2>{approvedLeaves}</h2>
          </div>
        </div>

        <div className="leave-status-stat">
          <div className="leave-stat-icon rejected-icon">✕</div>
          <div>
            <p>Rejected</p>
            <h2>{rejectedLeaves}</h2>
          </div>
        </div>

      </div>

      {/* APPLICATION LIST */}
      <div className="leave-status-card">

        <div className="leave-status-card-header">
          <div>
            <h2>My Leave Applications</h2>
            <p>Check the current status of your leave requests.</p>
          </div>

          <span className="leave-count">
            {filteredApplications.length} Applications
          </span>
        </div>

        {/* FILTERS */}
        <div className="leave-status-filters">

          <input
            type="text"
            placeholder="Search by leave type, date or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Forwarded">Forwarded</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

        </div>

        {/* APPLICATIONS */}
        <div className="leave-status-list">

          {filteredApplications.length > 0 ? (

            filteredApplications.map((application) => (

              <div className="leave-status-item" key={application.id}>

                <div className="leave-item-top">

                  <div className="leave-item-info">
                    <div className="leave-type-icon">📅</div>

                    <div>
                      <h3>{application.type}</h3>

                      <p>
                        {application.dates || "Dates not available"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`leave-status-badge ${application.status.toLowerCase()}`}
                  >
                    {getStatusLabel(application.status)}
                  </span>

                </div>

                <div className="leave-item-details">

                  <div>
                    <span>Duration</span>
                    <strong>
                      {application.days} {application.days === 1 ? "Day" : "Days"}
                    </strong>
                  </div>

                  <div>
                    <span>Reason</span>
                    <strong>{application.reason || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Application ID</span>
                    <strong>LF-{application.id}</strong>
                  </div>

                </div>

                <div className="leave-progress-section">
                  <h4>Approval Progress</h4>
                  {renderProgress(application)}
                </div>

                {application.status === "Rejected" && (
                  <div className="leave-status-remarks">
                    <strong>Rejection Remarks:</strong>
                    <p>
                      {application.approvingOfficerRemarks ||
                        application.officerRemarks ||
                        "No remarks provided."}
                    </p>
                  </div>
                )}

                {application.status === "Approved" && (
                  <div className="leave-status-success">
                    ✓ Your leave application has been approved.
                  </div>
                )}

                <div className="leave-item-footer">

                  <span>
                    Current Status: <strong>{getStatusLabel(application.status)}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => onViewDetails?.(application)}
                  >
                    View Details →
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="leave-status-empty">
              <div>📋</div>
              <h3>No Applications Found</h3>
              <p>
                No leave applications match your search or selected status.
              </p>
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

import React from "react";

export default LeaveStatus;
