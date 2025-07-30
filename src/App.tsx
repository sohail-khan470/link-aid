import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Firebase
import { auth, db } from "../firebase";

// Layout & Components
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Auth Components
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import SignIn from "./pages/Shared/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Unauthorized from "./pages/Shared/Unauthourised/Unauthorised";
import HomeRedirect from "./pages/Shared/HomeRedirect";
import CompanyDashboard from "./pages/Dashboard/CompanyDashboard";
import StaffMangement from "./pages/StaffManagement/StaffManagement";
import UserProfiles from "./pages/UserProfiles";
import TowingRequestPage from "./pages/TowingCompany/TowingRequestsPage";
import InsuranceCompanyPage from "./pages/InsuranceCompany/InsuranceCompanyPage";
import TowingCompanyPage from "./pages/TowingCompany/TowingCompanyPage";
import RespondersPage from "./pages/Shared/Responders/Responders";
import { RoleRoute } from "./components/auth/RoleRoute";
import EmergencyReportsPage from "./pages/EmergencyReports/EmergencyReportsPage";
import EmergencyReportDetailsPage from "./pages/EmergencyReports/EmergencyReportDetailsPage";
import InsurerClaimsPage from "./pages/InsuranceClaimsPage.tsx/ClaimsPage";
import TowRequestsPage from "./pages/TowRequestPage/TowRequestPage";
import ActionLogPage from "./pages/ActionLogsPage/ActionLogPage";
import InsuranceStaffPage from "./pages/InsuranceCompany/InsuranceStaffPage";
import IncidentsReportsPage from "./pages/IncidentsReportsPage/IncidentsReportsPage";
import ResetPassword from "./components/auth/ResetPassword";
import { useWatchVerification } from "./hooks/useWatchVerification";

// Types
interface FirebaseUserData {
  role: string;
  [key: string]: any;
}

export default function App() {
  useWatchVerification();
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setRole] = useState("");
  const [, setFirebaseUser] = useState<FirebaseUserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const currentDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const data = currentDoc.data() as FirebaseUserData;

          if (data) {
            setFirebaseUser(data);
            setRole(data.role);
          }
        } catch (err) {
          console.error("Error fetching user doc:", err);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
        </Route>
        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Shared Routes */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/home" element={<CompanyDashboard />} />
            <Route path="/staff" element={<StaffMangement />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Super Admin Routes */}
            <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
              <Route
                path="/admin/towing-management"
                element={<TowingCompanyPage />}
              />
              <Route path="/admin/home" element={<CompanyDashboard />} />
              <Route
                path="/admin/insurance-management"
                element={<InsuranceCompanyPage />}
              />
              <Route path="/responders" element={<RespondersPage />} />
              <Route
                path="/admin/emergency-reports"
                element={<EmergencyReportsPage />}
              />
              <Route
                path="/admin/insurance-claims"
                element={<InsurerClaimsPage />}
              />
              <Route path="/admin/tow-requests" element={<TowRequestsPage />} />
              <Route
                path="/emergency-reports/:id"
                element={<EmergencyReportDetailsPage />}
              />
            </Route>
            <Route path="/admin/action-logs" element={<ActionLogPage />} />
            <Route
              path="/admin/incidents-reports"
              element={<IncidentsReportsPage />}
            />

            {/* Towing Company Routes */}
            <Route element={<RoleRoute allowedRoles={["towing_company"]} />}>
              <Route path="/towing/staff" element={<StaffMangement />} />
              <Route path="/towing/requests" element={<TowingRequestPage />} />
            </Route>

            {/* insurer Company Routes */}
            <Route element={<RoleRoute allowedRoles={["insurer"]} />}>
              <Route path="/insurer/staff" element={<InsuranceStaffPage />} />
              <Route path="/insurer/claims" element={<InsurerClaimsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
