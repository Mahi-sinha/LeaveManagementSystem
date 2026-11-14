import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
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

function App() {
  // AUTHENTICATION
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // PASSWORD RESET
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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

  // Detect a Supabase password-recovery session.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResetPassword(true);
        setError("");
        setMessage("");
      }
    });

    // Also handle a recovery URL if the app loads before the auth event.
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

    if (hashParams.get("type") === "recovery") {
      setIsResetPassword(true);
      setError("");
      setMessage("");
    }

    return () => subscription.unsubscribe();
  }, []);

  // ROLE CHECKS
  const isEmployee = userRole === "employee";
  const isReportingOfficer = userRole === "reporting-officer";
  const isApprovingOfficer = userRole === "approving-officer";
  const isAdmin = userRole === "admin";

  // LOGIN WITH SUPABASE AUTHENTICATION
  
  // LOGIN WITH SUPABASE AUTHENTICATION
  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const email = employeeId.trim().toLowerCase();

    if (!email || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      // STEP 1: Authenticate through Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError("Invalid email or password.");
        return;
      }

      // STEP 2: Fetch login record using Auth UID
      const { data: loginRecord, error: loginError } =
        await supabase
          .from("login_master")
          .select(`
            login_id,
            employee_name,
            email,
            status,
            employee_id,
            auth_user_id,
            role:role_master!login_master_role_id_fkey (
              role_name,
              status
            )
          `)
          .eq("auth_user_id", authData.user.id)
          .maybeSingle();

      if (loginError || !loginRecord) {
        await supabase.auth.signOut();

        setError(
          "Your login record was not found. Please contact the administrator."
        );
        return;
      }

      // STEP 3: Check account status
      if (
        loginRecord.status?.toLowerCase() !== "active" ||
        loginRecord.role?.status?.toLowerCase() !== "active"
      ) {
        await supabase.auth.signOut();

        setError(
          "Your account is inactive. Please contact the administrator."
        );
        return;
      }

      if (!loginRecord.employee_id) {
        await supabase.auth.signOut();

        setError(
          "Your employee record is not linked to your login account."
        );
        return;
      }

      // STEP 4: Fetch employee details
      const { data: employee, error: employeeError } =
        await supabase
          .from("employee_master")
          .select(`
            employee_id,
            employee_name,
            designation:designation_master!employee_master_designation_id_fkey (
              designation_name
            ),
            office:office_master!employee_master_office_id_fkey (
              office_name
            )
          `)
          .eq("employee_id", loginRecord.employee_id)
          .maybeSingle();

      if (employeeError || !employee) {
        await supabase.auth.signOut();

        setError(
          "Your employee profile could not be found. Please contact the administrator."
        );
        return;
      }

      // STEP 5: Determine role from actual database record
      const roleName = loginRecord.role?.role_name
        ?.trim()
        .toLowerCase();

      const roleMap = {
        "admin": "admin",
        "employee": "employee",
        "reporting officer": "reporting-officer",
        "approving officer": "approving-officer",
      };

      const role = roleMap[roleName];

      if (!role) {
        await supabase.auth.signOut();

        setError(
          "Your assigned role is not supported. Please contact the administrator."
        );
        return;
      }

      // STEP 6: Prepare logged-in user
      const user = {
        id: employee.employee_id,
        name: employee.employee_name,
        employeeId: employee.employee_id,
        designation:
          employee.designation?.designation_name || "",
        department:
          employee.office?.office_name || "",
        email: loginRecord.email,
        role,
      };

      // STEP 7: Update application state
      setCurrentUser(user);
      setUserRole(role);
      setLoggedIn(true);

      setSelectedApplication(null);

      // STEP 8: Navigate according to role
      if (role === "reporting-officer") {
        setCurrentPage("reporting-dashboard");
      } else if (role === "approving-officer") {
        setCurrentPage("approving-dashboard");
      } else if (role === "admin") {
        setCurrentPage("company-master");
      } else {
        setCurrentPage("dashboard");
      }

      setPassword("");
      setShowPassword(false);

    } catch (loginError) {
      await supabase.auth.signOut();

      console.error("Login error:", loginError);

      setError(
        "Unable to sign in. Please try again."
      );
    }
  }


  // UPDATE PASSWORD AFTER RECOVERY
  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("The passwords do not match.");
      return;
    }

    setResetLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Unable to update password.");
        return;
      }

      await supabase.auth.signOut();

      setIsResetPassword(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword("");
      setMessage("Password updated successfully. Please sign in with your new password.");
    } catch (updateError) {
      setError(updateError.message || "Unable to update password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  }

  // FORGOT PASSWORD
  function handleForgotPassword() {
    setError("");
    setMessage(
      "Please contact your administrator to reset your password."
    );
  }

  // LOGOUT
  async function handleLogout() {
    await supabase.auth.signOut();

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

  // LOGIN PAGE AND PASSWORD RESET PAGE
  if (!loggedIn) {
    if (isResetPassword) {
      return (
        <main className="login-page">
          <section className="welcome-section">
            <div className="brand">
              <div className="brand-icon">L</div>
              <span>LeaveFlow</span>
            </div>

            <div className="welcome-content">
              <h1>Secure Your Account</h1>
              <p className="welcome-description">
                Choose a new password to regain access to your LeaveFlow account.
              </p>
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

              <h2>Set New Password</h2>
              <p className="login-subtitle">
                Enter and confirm your new password
              </p>

              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmNewPassword">Confirm New Password</label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                {error && (
                  <p className="form-message error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="sign-in-button"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Updating..." : "Update Password"}
                  {!resetLoading && <span>→</span>}
                </button>
              </form>

              <div className="login-security">
                <span>🔒</span>
                Your new password must be at least 8 characters.
              </div>
            </div>
          </section>
        </main>
      );
    }

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
                  Email Address
                </label>

                <input
                  id="employeeId"
                  type="text"
                  placeholder="Enter your registered email address"
                  value={employeeId}
                  onChange={(e) =>
                    setEmployeeId(e.target.value)
                  }
                  autoComplete="email"
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