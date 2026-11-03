
function ApplicationDetails({ application, onBack }) {
  if (!application) {
    return (
      <main className="dashboard-main">
        <section className="dashboard-panel application-details-panel">
          <h2>Application Details</h2>
          <p>No application has been selected.</p>

          <div className="application-details-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={onBack}
            >
              ← Back to Applications
            </button>
          </div>
        </section>
      </main>
    );
  }

  const statusClass = (application.status || "Pending").toLowerCase();

  const statusMessage =
    application.status === "Approved"
      ? "Your leave request has been approved."
      : application.status === "Rejected"
      ? "Your leave request has been rejected."
      : "Your leave request is awaiting approval.";

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <div>
          <h2>Application Details</h2>
          <p>Review your leave request and its current status.</p>
        </div>
      </header>

      <section className="dashboard-panel application-details-panel">
        {/* Application heading */}
        <div className="application-details-heading">
          <div>
            <span className="details-label">APPLICATION ID</span>
            <h3>LF-{application.id}</h3>
          </div>

          <span className={`status-badge ${statusClass}`}>
            {application.status || "Pending"}
          </span>
        </div>

        <div className="details-divider" />

        {/* Leave information */}
        <div className="application-details-grid">
          <div className="detail-item">
            <span className="details-label">Leave Type</span>
            <strong>{application.type || "—"}</strong>
          </div>

          <div className="detail-item">
            <span className="details-label">Duration</span>
            <strong>
              {application.days ?? "—"}{" "}
              {application.days === 1 ? "day" : "days"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="details-label">Start Date</span>
            <strong>
              {application.startDate || application.dates || "—"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="details-label">End Date</span>
            <strong>
              {application.endDate || "See date range above"}
            </strong>
          </div>
        </div>

        <div className="details-divider" />

        {/* Leave reason */}
        <div className="detail-section">
          <h4>Reason for Leave</h4>
          <p className="detail-reason">
            {application.reason || "No reason provided."}
          </p>
        </div>

        <div className="details-divider" />

        {/* Supporting document */}
        <div className="detail-section">
          <h4>Supporting Document</h4>

          {application.document ? (
            <div className="attached-document">
              <span className="attached-document-icon">📄</span>

              <div className="attached-document-info">
                <strong>
                  {application.documentName ||
                    application.document.name}
                </strong>
                <span>
                  {(application.document.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <a
                className="document-download"
                href={URL.createObjectURL(application.document)}
                download={application.document.name}
              >
                Download
              </a>
            </div>
          ) : (
            <p className="no-document">
              No supporting document attached.
            </p>
          )}
        </div>

        <div className="details-divider" />

        {/* Application status */}
        <div className="detail-section">
          <h4>Application Status</h4>
          <p className="status-description">{statusMessage}</p>
        </div>

        {/* Single back button */}
        <div className="application-details-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={onBack}
          >
            ← Back to Applications
          </button>
        </div>
      </section>
    </main>
  );
}

export default ApplicationDetails;
