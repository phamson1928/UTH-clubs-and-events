import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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
import ClubOwnerOrgRequest from "./pages/club-owner/OrganizationRequest";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClubs from "./pages/admin/Clubs";
import AdminEvents from "./pages/admin/Events";
import AdminRequests from "./pages/admin/Requests";
import AdminUsers from "./pages/admin/Users";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/" element={<StudentHome />} />
        <Route path="/student/clubs" element={<StudentClubs />} />
        <Route path="/student/clubs/:id" element={<StudentClubDetail />} />

        {/* Club Owner Routes */}
        <Route path="/club-owner/dashboard" element={<ClubOwnerDashboard />} />
        <Route path="/club-owner/members" element={<ClubOwnerMembers />} />
        <Route
          path="/club-owner/applications"
          element={<ClubOwnerApplications />}
        />
        <Route path="/club-owner/events" element={<ClubOwnerEvents />} />
        <Route path="/club-owner/requests" element={<ClubOwnerRequests />} />
        <Route
          path="/club-owner/organization-request"
          element={<ClubOwnerOrgRequest />}
        />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/clubs" element={<AdminClubs />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
