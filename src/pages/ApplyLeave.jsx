
import { useState } from "react";

function ApplyLeave({ onSubmit, onCancel }) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [attachedDocument, setAttachedDocument] = useState(null);
  const [documentError, setDocumentError] = useState("");
  const [error, setError] = useState("");

  // Today's date in local YYYY-MM-DD format
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Handle document selection
  function handleDocumentChange(e) {
    const file = e.target.files?.[0];

    setDocumentError("");
    setAttachedDocument(null);

    if (!file) return;

    const allowedExtensions = /\.(pdf|jpe?g|png|docx?)$/i;

    if (!allowedExtensions.test(file.name)) {
      setDocumentError(
        "Please select a PDF, JPG, PNG, DOC or DOCX file."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDocumentError("File size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setAttachedDocument(file);
    setError("");
  }

  // Remove selected document
  function handleRemoveDocument() {
    setAttachedDocument(null);
    setDocumentError("");

    const fileInput = document.getElementById("supportingDocument");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // Submit leave application
  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (startDate < todayString) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before the start date.");
      return;
    }

    if (documentError) {
      setError("Please correct the supporting document error.");
      return;
    }

    // Calculate inclusive leave duration
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const days =
      Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Format dates for the application list
    function formatDate(dateString) {
      return new Date(`${dateString}T00:00:00`).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
        }
      );
    }

    const formattedDates =
      startDate === endDate
        ? formatDate(startDate)
        : `${formatDate(startDate)} – ${formatDate(endDate)}`;

    onSubmit({
      id: Date.now(),
      type: leaveType,
      startDate,
      endDate,
      dates: formattedDates,
      days,
      status: "Pending",
      reason: reason.trim(),
      document: attachedDocument,
      documentName: attachedDocument?.name || "",
    });

    // Reset the form after submission
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachedDocument(null);
    setDocumentError("");
  }

  return (
    <main className="dashboard-main">
      {/* Page Header */}
      <header className="dashboard-header">
        <div>
          <h2>Apply for Leave</h2>
          <p>Fill in the details to submit your leave request.</p>
        </div>
      </header>

      {/* Application Form */}
      <section className="dashboard-panel apply-leave-panel">
        <div className="panel-heading">
          <h3>Leave Application Form</h3>
        </div>

        <form onSubmit={handleSubmit} className="apply-leave-form">
          {/* Leave Type */}
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type</label>

            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value);
                setError("");
              }}
              required
            >
              <option value="">Select leave type</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Paid Leave">Paid Leave</option>
            </select>
          </div>

          {/* Date Fields */}
          <div className="date-fields">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>

              <input
                id="startDate"
                type="date"
                min={todayString}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError("");

                  if (endDate && e.target.value > endDate) {
                    setEndDate("");
                  }
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>

              <input
                id="endDate"
                type="date"
                min={startDate || todayString}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
          </div>

          {/* Leave Duration Preview */}
          {startDate && endDate && endDate >= startDate && (
            <p className="leave-duration">
              Total leave duration:{" "}
              <strong>
                {Math.round(
                  (new Date(`${endDate}T00:00:00`) -
                    new Date(`${startDate}T00:00:00`)) /
                    (1000 * 60 * 60 * 24)
                ) + 1}{" "}
                day(s)
              </strong>
            </p>
          )}

          {/* Reason */}
          <div className="form-group">
            <label htmlFor="reason">Reason for Leave</label>

            <textarea
              id="reason"
              placeholder="Explain why you need leave..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              rows={5}
              required
            />
          </div>

          {/* Optional Supporting Document */}
          <div className="form-group document-upload-group">
            <label htmlFor="supportingDocument">
              Supporting Document
              <span className="optional-label"> (Optional)</span>
            </label>

            <p className="document-help">
              Attach a medical certificate or other supporting
              document if required.
            </p>

            <label
              htmlFor="supportingDocument"
              className="document-upload-box"
            >
              <span className="document-upload-icon">📎</span>

              <span className="document-upload-title">
                {attachedDocument
                  ? "Change attached document"
                  : "Click to upload or choose a file"}
              </span>

              <span className="document-upload-subtitle">
                PDF, JPG, PNG or DOC/DOCX · Maximum 5 MB
              </span>

              <input
                id="supportingDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleDocumentChange}
              />
            </label>

            {documentError && (
              <p className="document-error" role="alert">
                {documentError}
              </p>
            )}

            {attachedDocument && (
              <div className="attached-document">
                <span className="attached-document-icon">📄</span>

                <div className="attached-document-info">
                  <strong>{attachedDocument.name}</strong>
                  <span>
                    {(attachedDocument.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  className="remove-document"
                  onClick={handleRemoveDocument}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button type="submit" className="primary-action">
              Submit Application →
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ApplyLeave;
