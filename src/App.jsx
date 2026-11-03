
import { useState } from "react";
import "./index.css";
import "./dashboard.css";

// Admin pages
import LoginMaster from "./pages/LoginMaster";
import RoleMaster from "./pages/RoleMaster";
import EmployeeMaster from "./pages/EmployeeMaster";
import DesignationMaster from "./pages/DesignationMaster";
import CompanyMaster from "./pages/CompanyMaster";
import OfficeMaster from "./pages/OfficeMaster";

// Common Profile page
import Profile from "./pages/Profile";

// Reporting Officer and Approving Officer pages
import ReportingOfficerReview from "./pages/ReportingOfficerReview";
import ReportingOfficerDashboard from "./pages/ReportingOfficerDashboard";
import ApprovingOfficerDashboard from "./pages/ApprovingOfficerDashboard";
import ApprovingOfficerReview from "./pages/ApprovingOfficerReview";

// Employee pages
import ApplicationDetails from "./pages/ApplicationDetails";
import ApplyLeave from "./pages/ApplyLeave";
import MyApplications from "./pages/MyApplications";
import LeaveStatus from "./pages/LeaveStatus";
import Dashboard from "./pages/Dashboard";

// Initial sample applications
const initialApplications = [
  {
    id: 1,
    type: "Casual Leave",
    dates: "20 Oct – 21 Oct",
    startDate: "20 Oct",
    endDate: "21 Oct",
    days: 2,
    status: "Pending",
    reason: "Personal work",
    employeeName: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Employee",
    department: "Engineering",
    submittedBy: "employee",
    submittedById: "EMP001",
    document: null,
  },
  {
    id: 2,
    type: "Sick Leave",
    dates: "12 Oct – 12 Oct",
    startDate: "12 Oct",
    endDate: "12 Oct",
    days: 1,
    status: "Approved",
    reason: "Medical appointment",
    employeeName: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Employee",
    department: "Engineering",
    submittedBy: "employee",
    submittedById: "EMP001",
    document: null,
  },
  {
    id: 3,
    type: "Earned Leave",
    dates: "5 Oct – 7 Oct",
    startDate: "5 Oct",
    endDate: "7 Oct",
    days: 3,
    status: "Rejected",
    reason: "Personal reasons",
    employeeName: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Employee",
    department: "Engineering",
    submittedBy: "employee",
    submittedById: "EMP001",
    document: null,
  },
];

// Demo accounts for frontend testing
const demoUsers = {
  emp001: {
    password: "employee123",
    role: "employee",
    name: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Employee",
    department: "Engineering",
    email: "employee@leaveflow.com",
  },

  "employee@leaveflow.com": {
    password: "employee123",
    role: "employee",
    name: "Anushka Jha",
    employeeId: "EMP001",
    designation: "Employee",
    department: "Engineering",
    email: "employee@leaveflow.com",
  },

  off001: {
    password: "officer123",
    role: "reporting-officer",
    name: "Rahul Sharma",
    employeeId: "OFF001",
    designation: "Reporting Officer",
    department: "Engineering",
    email: "officer@leaveflow.com",
  },

  "officer@leaveflow.com": {
    password: "officer123",
    role: "reporting-officer",
    name: "Rahul Sharma",
    employeeId: "OFF001",
    designation: "Reporting Officer",
    department: "Engineering",
    email: "officer@leaveflow.com",
  },

  apr001: {
    password: "approver123",
    role: "approving-officer",
    name: "Priya Verma",
    employeeId: "APR001",
    designation: "Approving Officer",
    department: "Administration",
    email: "approver@leaveflow.com",
  },

  "approver@leaveflow.com": {
    password: "approver123",
    role: "approving-officer",
    name: "Priya Verma",
    employeeId: "APR001",
    designation: "Approving Officer",
    department: "Administration",
    email: "approver@leaveflow.com",
  },

  admin001: {
    password: "admin123",
    role: "admin",
    name: "Admin",
    employeeId: "ADM001",
    designation: "Administrator",
    department: "Administration",
    email: "admin@leaveflow.com",
  },

  "admin@leaveflow.com": {
    password: "admin123",
    role: "admin",
    name: "Admin",
    employeeId: "ADM001",
    designation: "Administrator",
    department: "Administration",
    email: "admin@leaveflow.com",
  },
};

function App() {
  // AUTHENTICATION
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // MESSAGES
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // NAVIGATION
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [previousPage, setPreviousPage] = useState("my-applications");

  // APPLICATION DATA
  const [myApplications, setMyApplications] = useState(
    initialApplications
  );

  // ROLE CHECKS
  const isEmployee = userRole === "employee";
  const isReportingOfficer = userRole === "reporting-officer";
  const isApprovingOfficer = userRole === "approving-officer";
  const isAdmin = userRole === "admin";

  // LOGIN
  function handleLogin(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const id = employeeId.trim().toLowerCase();
    const user = demoUsers[id];

    if (!id || !password.trim()) {
      setError("Please enter your employee ID and password.");
      return;
    }

    if (!user || user.password !== password) {
      setError("Invalid employee ID/email or password.");
      return;
    }

    setCurrentUser(user);
    setUserRole(user.role);
    setLoggedIn(true);
    setSelectedApplication(null);

    if (user.role === "reporting-officer") {
      setCurrentPage("reporting-dashboard");
    } else if (user.role === "approving-officer") {
      setCurrentPage("approving-dashboard");
    } else if (user.role === "admin") {
      setCurrentPage("company-master");
    } else {
      setCurrentPage("dashboard");
    }

    setPassword("");
    setShowPassword(false);
  }

  // FORGOT PASSWORD
  function handleForgotPassword() {
    setError("");
    setMessage(
      "Please contact your administrator to reset your password."
    );
  }

  // LOGOUT
  function handleLogout() {
    setLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentPage("dashboard");
    setSelectedApplication(null);
    setPreviousPage("my-applications");
    setEmployeeId("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setMessage("");
  }

  // NAVIGATION HELPER
  function navigateTo(page) {
    setCurrentPage(page);
    setSelectedApplication(null);
  }

  // SUBMIT LEAVE APPLICATION
  function handleLeaveSubmit(newApplication) {
    const isOfficerApplication =
      userRole === "reporting-officer";

    const submittedApplication = {
      ...newApplication,
      id: Date.now(),
      employeeName: currentUser?.name || "",
      employeeId: currentUser?.employeeId || "",
      designation: currentUser?.designation || "",
      department: currentUser?.department || "",
      submittedBy: userRole,
      submittedById: currentUser?.employeeId || "",

      // Reporting Officer applications go directly
      // to the Approving Officer.
      status: isOfficerApplication ? "Forwarded" : "Pending",

      ...(isOfficerApplication && {
        reportingOfficer: currentUser?.name || "",
      }),
    };

    setMyApplications((previous) => [
      submittedApplication,
      ...previous,
    ]);

    setCurrentPage("my-applications");
  }

  // APPLICATIONS BELONGING TO CURRENT USER
  const ownApplications = myApplications.filter(
    (application) =>
      application.submittedBy === userRole &&
      application.submittedById === currentUser?.employeeId
  );

  // EMPLOYEE APPLICATIONS FOR REPORTING OFFICER
  const employeeApplications = myApplications.filter(
    (application) =>
      application.submittedBy === "employee"
  );

  // APPLICATIONS FOR APPROVING OFFICER
  const forwardedApplications = myApplications.filter(
    (application) =>
      application.status === "Forwarded"
  );

  // OPEN APPLICATION DETAILS
  function handleViewDetails(application) {
    setPreviousPage(currentPage);
    setSelectedApplication(application);
    setCurrentPage("application-details");
  }

  // REPORTING OFFICER REVIEW
  function handleOpenOfficerReview(application) {
    setSelectedApplication(application);
    setCurrentPage("review-applications");
  }

  function handleBackToReviewQueue() {
    setSelectedApplication(null);
    setCurrentPage("review-applications");
  }

  // REPORTING OFFICER DECISION
  function handleOfficerDecision(applicationId, status, remarks) {
    setMyApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status,
              officerRemarks: remarks,
              reportingOfficer: currentUser?.name || "",
            }
          : application
      )
    );

    setSelectedApplication(null);
    setCurrentPage("review-applications");
  }

  // APPROVING OFFICER REVIEW
  function handleOpenApprovingReview(application) {
    setSelectedApplication(application);
    setCurrentPage("approving-review");
  }

  function handleBackToApprovingQueue() {
    setSelectedApplication(null);
    setCurrentPage("approving-dashboard");
  }

  // APPROVING OFFICER FINAL DECISION
  function handleApprovingOfficerDecision(
    applicationId,
    status,
    remarks
  ) {
    setMyApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status,
              approvingOfficerRemarks: remarks,
              approvingOfficer: currentUser?.name || "",
            }
          : application
      )
    );

    setSelectedApplication(null);
    setCurrentPage("approving-dashboard");
  }

  // BACK FROM APPLICATION DETAILS
  function handleDetailsBack() {
    setSelectedApplication(null);
    setCurrentPage(previousPage);
  }

  // LOGIN PAGE
  if (!loggedIn) {
    return (
      <main className="login-page">
        <section className="welcome-section">
          <div className="brand">
            <div className="brand-icon">L</div>
            <span>LeaveFlow</span>
          </div>

          <div className="welcome-content">
            <div className="illustration">
              <div className="illustration-circle circle-one"></div>
              <div className="illustration-circle circle-two"></div>

              <div className="calendar">
                <div className="calendar-top"></div>
                <div className="calendar-dots">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span key={index}></span>
                  ))}
                </div>
              </div>

              <div className="person">
                <div className="person-head"></div>
                <div className="person-body"></div>
                <div className="person-laptop"></div>
              </div>

              <div className="plant plant-left">🌿</div>
              <div className="plant plant-right">🪴</div>
            </div>

            <h1>Leave Management System</h1>

            <p className="welcome-description">
              Manage your leaves, build a better tomorrow.
            </p>

            <div className="features">
              <div className="feature">
                <span className="feature-icon">📝</span>
                <span>Easy Application</span>
              </div>

              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Fast Approval</span>
              </div>

              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Track Progress</span>
              </div>
            </div>
          </div>

          <p className="welcome-footer">
            LeaveFlow · Your workplace, simplified
          </p>
        </section>

        <section className="login-section">
          <div className="login-card">
            <div className="login-logo">
              <span className="leaf-icon">◆</span>
            </div>

            <h2>Welcome Back</h2>

            <p className="login-subtitle">
              Sign in to your account
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="employeeId">
                  Employee ID / Email
                </label>

                <input
                  id="employeeId"
                  type="text"
                  placeholder="Enter your employee ID or email"
                  value={employeeId}
                  onChange={(e) =>
                    setEmployeeId(e.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="password-input">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="form-message error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="form-message success" role="status">
                  {message}
                </p>
              )}

              <button type="submit" className="sign-in-button">
                Sign In <span>→</span>
              </button>
            </form>

            <div className="login-security">
              <span>🔒</span>
              Secure &amp; Reliable · Easy to Use
            </div>

            <div className="demo-credentials">
              <p>
                <strong>Employee:</strong> EMP001 / employee123
              </p>
              <p>
                <strong>Reporting Officer:</strong> OFF001 / officer123
              </p>
              <p>
                <strong>Approving Officer:</strong> APR001 / approver123
              </p>
              <p>
                <strong>Admin:</strong> admin001 / admin123
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // APPLICATION DETAILS
  if (currentPage === "application-details") {
    return (
      <ApplicationDetails
        application={selectedApplication}
        onBack={handleDetailsBack}
      />
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">L</span>
          <span>LeaveFlow</span>
        </div>

        {/* EMPLOYEE SIDEBAR */}
        {isEmployee && (
          <>
            <p className="sidebar-label">MENU</p>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  currentPage === "dashboard" ? "active" : ""
                }`}
                onClick={() => navigateTo("dashboard")}
              >
                <span>▦</span> Dashboard
              </button>

              <button
                className={`nav-item ${
                  currentPage === "apply-leave" ? "active" : ""
                }`}
                onClick={() => navigateTo("apply-leave")}
              >
                <span>✎</span> Apply Leave
              </button>

              <button
                className={`nav-item ${
                  currentPage === "my-applications" ? "active" : ""
                }`}
                onClick={() => navigateTo("my-applications")}
              >
                <span>▤</span> My Applications
              </button>

              <button
                className={`nav-item ${
                  currentPage === "leave-status" ? "active" : ""
                }`}
                onClick={() => navigateTo("leave-status")}
              >
                <span>◷</span> Leave Status
              </button>

              <button
                className={`nav-item ${
                  currentPage === "profile" ? "active" : ""
                }`}
                onClick={() => navigateTo("profile")}
              >
                <span>♙</span> Profile
              </button>
            </nav>
          </>
        )}

        {/* REPORTING OFFICER SIDEBAR */}
        {isReportingOfficer && (
          <>
            <p className="sidebar-label">MENU</p>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  currentPage === "reporting-dashboard" ? "active" : ""
                }`}
                onClick={() => navigateTo("reporting-dashboard")}
              >
                <span>▦</span> Dashboard
              </button>

              <button
                className={`nav-item ${
                  currentPage === "apply-leave" ? "active" : ""
                }`}
                onClick={() => navigateTo("apply-leave")}
              >
                <span>✎</span> Apply Leave
              </button>

              <button
                className={`nav-item ${
                  currentPage === "my-applications" ? "active" : ""
                }`}
                onClick={() => navigateTo("my-applications")}
              >
                <span>▤</span> My Applications
              </button>

              <button
                className={`nav-item ${
                  currentPage === "review-applications" ? "active" : ""
                }`}
                onClick={() => navigateTo("review-applications")}
              >
                <span>▤</span> Review Applications
              </button>

              <button
                className={`nav-item ${
                  currentPage === "profile" ? "active" : ""
                }`}
                onClick={() => navigateTo("profile")}
              >
                <span>♙</span> Profile
              </button>
            </nav>
          </>
        )}

        {/* APPROVING OFFICER SIDEBAR */}
        {isApprovingOfficer && (
          <>
            <p className="sidebar-label">MENU</p>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  currentPage === "approving-dashboard" ? "active" : ""
                }`}
                onClick={() => navigateTo("approving-dashboard")}
              >
                <span>▦</span> Dashboard
              </button>

              <button
                className={`nav-item ${
                  currentPage === "approving-review" ? "active" : ""
                }`}
                onClick={() => navigateTo("approving-review")}
              >
                <span>▤</span> Review Applications
              </button>

              <button
                className={`nav-item ${
                  currentPage === "profile" ? "active" : ""
                }`}
                onClick={() => navigateTo("profile")}
              >
                <span>♙</span> Profile
              </button>
            </nav>
          </>
        )}

        {/* ADMIN SIDEBAR */}
        {isAdmin && (
          <>
            <p className="sidebar-label">MASTER DATA</p>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  currentPage === "company-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("company-master")}
              >
                <span>▣</span> Company Master
              </button>

              <button
                className={`nav-item ${
                  currentPage === "office-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("office-master")}
              >
                <span>▤</span> Office Master
              </button>

              <button
                className={`nav-item ${
                  currentPage === "designation-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("designation-master")}
              >
                <span>▤</span> Designation Master
              </button>

              <button
                className={`nav-item ${
                  currentPage === "employee-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("employee-master")}
              >
                <span>♙</span> Employee Master
              </button>

              <button
                className={`nav-item ${
                  currentPage === "role-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("role-master")}
              >
                <span>♧</span> Role Master
              </button>

              <button
                className={`nav-item ${
                  currentPage === "login-master" ? "active" : ""
                }`}
                onClick={() => navigateTo("login-master")}
              >
                <span>▣</span> Login Master
              </button>
            </nav>

            <p className="sidebar-label">ACCOUNT</p>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  currentPage === "profile" ? "active" : ""
                }`}
                onClick={() => navigateTo("profile")}
              >
                <span>♙</span> Profile
              </button>
            </nav>
          </>
        )}

        {/* LOGOUT */}
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span> Logout
        </button>
      </aside>

      {/* EMPLOYEE PAGES */}
      {isEmployee && (
        currentPage === "apply-leave" ? (
          <ApplyLeave
            onSubmit={handleLeaveSubmit}
            onCancel={() => navigateTo("dashboard")}
          />
        ) : currentPage === "my-applications" ? (
          <MyApplications
            applications={ownApplications}
            onViewDetails={handleViewDetails}
          />
        ) : currentPage === "leave-status" ? (
          <LeaveStatus
            applications={ownApplications}
            onViewDetails={handleViewDetails}
          />
        ) : currentPage === "profile" ? (
          <Profile currentUser={currentUser} />
        ) : (
          <Dashboard
            applications={ownApplications}
            onNavigate={navigateTo}
          />
        )
      )}

      {/* REPORTING OFFICER PAGES */}
      {isReportingOfficer && (
        currentPage === "apply-leave" ? (
          <ApplyLeave
            onSubmit={handleLeaveSubmit}
            onCancel={() => navigateTo("reporting-dashboard")}
          />
        ) : currentPage === "my-applications" ? (
          <MyApplications
            applications={ownApplications}
            onViewDetails={handleViewDetails}
          />
        ) : currentPage === "profile" ? (
          <Profile currentUser={currentUser} />
        ) : currentPage === "review-applications" ? (
          <ReportingOfficerReview
            applications={employeeApplications}
            application={selectedApplication}
            onReview={handleOpenOfficerReview}
            onBack={handleBackToReviewQueue}
            onDecision={handleOfficerDecision}
          />
        ) : (
          <ReportingOfficerDashboard
            applications={employeeApplications}
            onReview={handleOpenOfficerReview}
            onNavigate={navigateTo}
          />
        )
      )}

      {/* APPROVING OFFICER PAGES */}
      {isApprovingOfficer && (
        currentPage === "profile" ? (
          <Profile currentUser={currentUser} />
        ) : currentPage === "approving-review" ? (
          <ApprovingOfficerReview
            applications={forwardedApplications}
            application={selectedApplication}
            onReview={handleOpenApprovingReview}
            onBack={handleBackToApprovingQueue}
            onDecision={handleApprovingOfficerDecision}
          />
        ) : (
          <ApprovingOfficerDashboard
            applications={myApplications}
            onReview={handleOpenApprovingReview}
            onNavigate={navigateTo}
          />
        )
      )}

      {/* ADMIN PAGES */}
      {isAdmin && (
        currentPage === "company-master" ? (
          <CompanyMaster />
        ) : currentPage === "office-master" ? (
          <OfficeMaster />
        ) : currentPage === "designation-master" ? (
          <DesignationMaster />
        ) : currentPage === "employee-master" ? (
          <EmployeeMaster />
        ) : currentPage === "role-master" ? (
          <RoleMaster />
        ) : currentPage === "login-master" ? (
          <LoginMaster />
        ) : currentPage === "profile" ? (
          <Profile currentUser={currentUser} />
        ) : (
          <CompanyMaster />
        )
      )}
    </div>
  );
}

export default App;

