
import { useState } from "react";

function ApprovingOfficerReview({
  applications = [],
  application,
  onReview,
  onBack,
  onDecision,
}) {
  const [remarks, setRemarks] = useState("");

  function handleDecision(status) {
    if (!application) return;

    onDecision?.(application.id, status, remarks);
    setRemarks("");
  }

  function getDates(item) {
    if (item.dates) return item.dates;

    if (item.startDate && item.endDate) {
      return `${item.startDate} – ${item.endDate}`;
    }

    return "Date not available";
  }

  // APPLICATION QUEUE
  if (!application) {
    const filteredApplications = applications.filter(
      (item) => item.status === "Forwarded"
    );

    return (
      <main className="dashboard-main approving-review-page">
        <header className="dashboard-header">
          <div>
            <h1>Review Applications</h1>
            <p>
              Review applications forwarded by Reporting Officers.
            </p>
          </div>
        </header>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Pending Final Approval</h2>
              <p>
                Select an application to review its details.
              </p>
            </div>

            <span className="reporting-count">
              {filteredApplications.length} Pending
            </span>
          </div>

          <div className="applications-table-wrapper">
            <table className="applications-table reporting-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="reporting-employee">
                        <div className="reporting-employee-avatar">
                          {(item.employeeName || "E")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {item.employeeName || "Employee"}
                          </strong>
                          <span>{item.employeeId || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{item.type}</td>
                    <td>{getDates(item)}</td>
                    <td>{item.days}</td>

                    <td>
                      <button
                        type="button"
                        className="reporting-review-button"
                        onClick={() => onReview?.(item)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplications.length === 0 && (
              <div className="reporting-empty-state">
                <div>✓</div>
                <h3>No pending applications</h3>
                <p>
                  There are no forwarded applications awaiting your decision.
                </p>
              </div>
            )}
          </div>

          <div className="applications-footer">
            Showing {filteredApplications.length} pending applications
          </div>
        </section>
      </main>
    );
  }

  // APPLICATION DETAILS AND FINAL DECISION
  return (
    <main className="dashboard-main approving-review-page">
      <header className="dashboard-header">
        <div>
          <h1>Application Review</h1>
          <p>Review the details and make your final decision.</p>
        </div>
      </header>

      <section className="dashboard-panel approving-detail-panel">
        <div className="approving-review-top">
          <div>
            <h2>Leave Application #{application.id}</h2>
            <p>Forwarded for final approval</p>
          </div>

          <span className="status-badge forwarded">
            Pending Approval
          </span>
        </div>

        <div className="approving-detail-grid">
          <div className="approving-detail-item">
            <span>Employee Name</span>
            <strong>{application.employeeName || "N/A"}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Employee ID</span>
            <strong>{application.employeeId || "N/A"}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Department</span>
            <strong>{application.department || "N/A"}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Designation</span>
            <strong>{application.designation || "N/A"}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Leave Type</span>
            <strong>{application.type || "N/A"}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Duration</span>
            <strong>{getDates(application)}</strong>
          </div>

          <div className="approving-detail-item">
            <span>Total Days</span>
            <strong>{application.days || 0} Days</strong>
          </div>

          <div className="approving-detail-item">
            <span>Submitted By</span>
            <strong>{application.employeeName || "N/A"}</strong>
          </div>
        </div>

        <div className="approving-reason">
          <span>Reason for Leave</span>
          <p>{application.reason || "No reason provided."}</p>
        </div>

       
{/* SUPPORTING DOCUMENT */}
<div className="approving-document">
  <span>Supporting Document</span>

  {application.document ? (
    <div className="document-preview">
      <div className="document-file-icon">📎</div>

      <div className="document-file-info">
        <strong>
          {typeof application.document === "string"
            ? application.document.split("/").pop()
            : application.document.name || "Supporting Document"}
        </strong>
        <span>Document submitted with application</span>
      </div>

      {application.document instanceof File && (
        <a
          href={URL.createObjectURL(application.document)}
          target="_blank"
          rel="noopener noreferrer"
          className="document-view-button"
        >
          View Document
        </a>
      )}

      {typeof application.document === "string" && (
        <a
          href={application.document}
          target="_blank"
          rel="noopener noreferrer"
          className="document-view-button"
        >
          View Document
        </a>
      )}
    </div>
  ) : (
    <p>No supporting document attached.</p>
  )}
</div>


        {application.officerRemarks && (
          <div className="approving-officer-remarks">
            <span>Reporting Officer Remarks</span>
            <p>{application.officerRemarks}</p>
          </div>
        )}

        <div className="approving-remarks-section">
          <label htmlFor="approvingRemarks">
            Final Remarks
          </label>

          <textarea
            id="approvingRemarks"
            rows="4"
            placeholder="Enter your remarks or decision comments..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="approving-review-actions">
          <button
            type="button"
            className="approving-back-button"
            onClick={() => {
              setRemarks("");
              onBack?.();
            }}
          >
            Back to Applications
          </button>

          <div className="approving-decision-buttons">
            <button
              type="button"
              className="approving-reject-button"
              onClick={() => handleDecision("Rejected")}
            >
              Reject
            </button>

            <button
              type="button"
              className="approving-approve-button"
              onClick={() => handleDecision("Approved")}
            >
              Approve
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ApprovingOfficerReview;
