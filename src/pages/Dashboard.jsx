
function Dashboard({ applications, onNavigate }) {
  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <div>
          <h2>Employee Dashboard</h2>
          <p>Welcome to your leave management workspace.</p>
        </div>

        <div className="employee-profile">
          <div className="avatar">AJ</div>
          <div>
            <strong>Anushka Jha</strong>
            <span>Employee</span>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <p className="welcome-label">YOUR WORKSPACE</p>
          <h1>Good Morning, Anushka! 👋</h1>
          <p>Here's your leave overview for today.</p>
        </div>

        <div className="banner-decoration">✦</div>
      </section>

      {/* Statistics Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon blue">▤</span>
            <span className="stat-caption">TOTAL</span>
          </div>
          <p>Total Applications</p>
          <h2>{applications.length}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon orange">◷</span>
            <span className="stat-caption">WAITING</span>
          </div>
          <p>Pending</p>
          <h2>{pendingCount}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon green">✓</span>
            <span className="stat-caption">COMPLETED</span>
          </div>
          <p>Approved</p>
          <h2>{approvedCount}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon red">×</span>
            <span className="stat-caption">DECLINED</span>
          </div>
          <p>Rejected</p>
          <h2>{rejectedCount}</h2>
        </div>
      </section>

      {/* Quick Actions and Recent Applications */}
      <section className="dashboard-bottom">
        <div className="dashboard-panel quick-actions">
          <div className="panel-heading">
            <h3>Quick Actions</h3>
          </div>

          <button
            type="button"
            className="primary-action"
            onClick={() => onNavigate("apply-leave")}
          >
            <span>＋</span> Apply for Leave
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={() => onNavigate("my-applications")}
          >
            <span>▤</span> View My Applications
          </button>

          <div className="help-card">
            <span>💡</span>
            <div>
              <strong>Need time off?</strong>
              <p>Submit your leave request for approval.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel recent-applications">
          <div className="panel-heading">
            <h3>Recent Applications</h3>

            <button
              type="button"
              onClick={() => onNavigate("my-applications")}
            >
              View All →
            </button>
          </div>

          <div className="applications-list">
            {applications.slice(0, 3).map((application) => (
              <div
                className="application-row"
                key={application.id}
              >
                <div className="application-icon">
                  {application.status === "Approved"
                    ? "✓"
                    : application.status === "Rejected"
                    ? "×"
                    : "◷"}
                </div>

                <div className="application-info">
                  <strong>{application.type}</strong>
                  <span>
                    {application.dates} · {application.days}{" "}
                    {application.days === 1 ? "day" : "days"}
                  </span>
                </div>

                <span
                  className={`status-badge ${application.status.toLowerCase()}`}
                >
                  {application.status}
                </span>
              </div>
            ))}

            {applications.length === 0 && (
              <p>No leave applications yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
