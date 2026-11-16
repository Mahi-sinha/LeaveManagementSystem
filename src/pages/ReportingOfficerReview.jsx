
import { useState, useEffect } from "react";

function ApplicationDocument({ document, documentName }) {
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    if (!document) {
      setDocumentUrl("");
      return;
    }

    // If the document is already a URL
    if (typeof document === "string") {
      setDocumentUrl(document);
      return;
    }

    // If the document is a File or Blob
    const url = URL.createObjectURL(document);
    setDocumentUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [document]);

  if (!document || !documentUrl) {
    return (
      <div className="review-document-empty">
        No supporting document uploaded.
      </div>
    );
  }

  const fileName = documentName || document.name || "Supporting document";
  const fileType = document.type || "";
  const isImage = fileType.startsWith("image/");
  const isPDF =
    fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="review-document-box">
      <div className="review-document-info">
        <span className="review-document-icon">
          {isPDF ? "📄" : isImage ? "🖼️" : "📎"}
        </span>

        <div>
          <strong>{fileName}</strong>
          <small>Supporting document</small>
        </div>
      </div>

      <a
        href={documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="review-document-button"
      >
        View Document ↗
      </a>

      {isImage && (
        <img
          src={documentUrl}
          alt="Uploaded supporting document"
          className="review-document-preview"
        />
      )}

      {isPDF && (
        <iframe
          src={documentUrl}
          title="Supporting document preview"
          className="review-document-preview review-pdf-preview"
        />
      )}
    </div>
  );
}

function ReportingOfficerReview({
  applications = [],
  application,
  onReview,
  onBack,
  onDecision,
}) {
  const [remarks, setRemarks] = useState("");

  // Show the application queue when no request is selected
  if (!application) {
    const pendingApplications = applications.filter(
      (item) => item.status === "Pending"
    );

    return (
      <main className="dashboard-main officer-review-page">
        <header className="dashboard-header">
          <div>
            <h2>Review Leave Applications</h2>
            <p>Review employee requests and make your recommendation.</p>
          </div>
        </header>

        <section className="dashboard-panel">
          <div className="review-panel-heading">
            <div>
              <h3>Pending Applications</h3>
              <p>Select an application to review its details.</p>
            </div>
            <span className="review-count">
              {pendingApplications.length} Pending
            </span>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="review-empty">
              <span>✓</span>
              <h3>All caught up!</h3>
              <p>There are no pending applications to review.</p>
            </div>
          ) : (
            <div className="review-queue">
              {pendingApplications.map((item) => (
                <div className="review-queue-item" key={item.id}>
                  <div className="review-employee-avatar">
                    {(item.employeeName || "A").charAt(0).toUpperCase()}
                  </div>

                  <div className="review-queue-info">
                    <strong>{item.employeeName || "Unknown employee"}</strong>
                    <span>
                      {item.employeeId || "EMP001"} · {item.type}
                    </span>
                    <small>
                      {item.dates ||
                        `${item.startDate || ""} – ${item.endDate || ""}`}
                      {" · "}
                      {item.days} {item.days === 1 ? "day" : "days"}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="review-queue-review-button"
                    onClick={() => onReview(item)}
                  >
                    Review <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  const employeeName = application.employeeName || "Unknown employee";
  const employeeId = application.employeeId || "-";

  function handleDecision(status) {
    if (status === "Rejected" && !remarks.trim()) {
      window.alert("Please enter a reason before rejecting this application.");
      return;
    }

    onDecision(application.id, status, remarks.trim());
  }

  return (
    <main className="dashboard-main officer-review-page">
      <header className="dashboard-header review-page-header">
        <div>
          <button
            type="button"
            className="review-back-link"
            onClick={onBack}
          >
            ← Back to Applications
          </button>

          <h2>Review Leave Application</h2>
          <p>Check the employee's information before making a decision.</p>
        </div>

        <span className={`status-badge ${application.status.toLowerCase()}`}>
          {application.status}
        </span>
      </header>

      <div className="officer-review-grid">
        {/* EMPLOYEE DETAILS */}
        <section className="dashboard-panel review-info-card">
          <div className="review-section-heading">
            <span className="review-heading-icon">♙</span>
            <h3>Employee Details</h3>
          </div>

          <div className="review-employee-profile">
            <div className="review-large-avatar">
              {employeeName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4>{employeeName}</h4>
              <p>{application.designation || "Employee"}</p>
            </div>
          </div>

          <div className="review-detail-list">
            <div>
              <span>Employee ID</span>
              <strong>{employeeId}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{application.department || "Not specified"}</strong>
            </div>
            <div>
              <span>Office</span>
              <strong>{application.office || "Not specified"}</strong>
            </div>
          </div>
        </section>

        {/* LEAVE DETAILS */}
        <section className="dashboard-panel review-info-card">
          <div className="review-section-heading">
            <span className="review-heading-icon">▣</span>
            <h3>Leave Details</h3>
          </div>

          <div className="review-detail-list">
            <div>
              <span>Leave Type</span>
              <strong>{application.type}</strong>
            </div>
            <div>
              <span>From</span>
              <strong>
                {application.startDate || application.dates || "—"}
              </strong>
            </div>
            <div>
              <span>To</span>
              <strong>{application.endDate || "See date range above"}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>
                {application.days}{" "}
                {application.days === 1 ? "day" : "days"}
              </strong>
            </div>
            <div>
              <span>Application ID</span>
              <strong>LF-{application.id}</strong>
            </div>
          </div>

          <div className="review-reason-box">
            <span>Reason for Leave</span>
            <p>{application.reason || "No reason provided."}</p>
          </div>
        </section>

        <div className="review-attachment-section">
  <h4>Supporting Document</h4>

  <ApplicationDocument
    document={application.document}
    documentName={application.documentName}
  />
</div>

        {/* APPROVAL HISTORY */}
        <section className="dashboard-panel review-info-card">
          <div className="review-section-heading">
            <span className="review-heading-icon">◷</span>
            <h3>Approval History</h3>
          </div>

          <div className="approval-timeline">
            <div className="approval-timeline-item completed">
              <span className="timeline-dot">✓</span>
              <div>
                <strong>Submitted by Employee</strong>
                <p>Leave request submitted</p>
              </div>
            </div>

            <div className="approval-timeline-item current">
              <span className="timeline-dot">2</span>
              <div>
                <strong>Reporting Officer Review</strong>
                <p>Awaiting your decision</p>
              </div>
            </div>

            <div className="approval-timeline-item">
              <span className="timeline-dot">3</span>
              <div>
                <strong>Approving Officer</strong>
                <p>Pending forwarding</p>
              </div>
            </div>
          </div>
        </section>

        {/* OFFICER DECISION */}
        <section className="dashboard-panel review-info-card decision-card">
          <div className="review-section-heading">
            <span className="review-heading-icon">✎</span>
            <h3>Reporting Officer Decision</h3>
          </div>

          <label htmlFor="officerRemarks">Add Remarks</label>
          <textarea
            id="officerRemarks"
            rows={5}
            placeholder="Enter your remarks for this application..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <p className="review-help-text">
            Remarks are required when rejecting an application.
          </p>

          {application.status === "Pending" ? (
            <div className="review-decision-actions">
              <button
                type="button"
                className="reject-application-button"
                onClick={() => handleDecision("Rejected")}
              >
                Reject Application
              </button>

              <button
                type="button"
                className="forward-application-button"
                onClick={() => handleDecision("Forwarded")}
              >
                Forward to Approving Officer →
              </button>
            </div>
          ) : (
            <p className="review-completed-message">
              This application has already been processed by the reporting
              officer. Its current status is {application.status}.
            </p>
          )}

          <button
            type="button"
            className="secondary-action review-bottom-back"
            onClick={onBack}
          >
            Back to Applications
          </button>
        </section>
      </div>
    </main>
  );
}

export default ReportingOfficerReview;
