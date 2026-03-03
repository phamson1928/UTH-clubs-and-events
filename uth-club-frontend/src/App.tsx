import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Footer from "./components/Footer";
import { ReactNode } from "react";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Student Pages
import StudentHome from "./pages/student/Home";
import StudentClubs from "./pages/student/Clubs";
import StudentClubDetail from "./pages/student/ClubDetail";

// Club Owner Pages
import ClubOwnerDashboard from "./pages/club-owner/Dashboard";
import ClubOwnerMembers from "./pages/club-owner/Members";
import ClubOwnerApplications from "./pages/club-owner/Applications";
import ClubOwnerEvents from "./pages/club-owner/Events";
import ClubOwnerRequests from "./pages/club-owner/Requests";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClubs from "./pages/admin/Clubs";
import AdminEvents from "./pages/admin/Events";
import AdminRequests from "./pages/admin/Requests";
import AdminUsers from "./pages/admin/Users";

function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const token = localStorage.getItem("authToken");
  const userRaw = localStorage.getItem("authUser");
  const user = userRaw ? (JSON.parse(userRaw) as { role: string }) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect đến trang phù hợp với role thực tế
    if (user.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "club_owner")
      return <Navigate to="/club-owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route path="/" element={<StudentHome />} />
        <Route path="/student/clubs" element={<StudentClubs />} />
        <Route path="/student/clubs/:id" element={<StudentClubDetail />} />

        {/* Club Owner Routes */}
        <Route
          path="/club-owner/dashboard"
          element={
            <ProtectedRoute roles={["club_owner"]}>
              <ClubOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club-owner/members"
          element={
            <ProtectedRoute roles={["club_owner"]}>
              <ClubOwnerMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club-owner/applications"
          element={
            <ProtectedRoute roles={["club_owner"]}>
              <ClubOwnerApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club-owner/events"
          element={
            <ProtectedRoute roles={["club_owner"]}>
              <ClubOwnerEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club-owner/requests"
          element={
            <ProtectedRoute roles={["club_owner"]}>
              <ClubOwnerRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clubs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <Toaster />
    </Router>
  );
}

export default App;
