import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import { useEffect } from "react";
import ProfilePage from "./pages/Profile/Profile";
import UserManagement from "./pages/StaffManagement/UserManagement";
import IncidentsAnalytics from "./pages/IncidentsManagement/IncidentsAnalytics";
import InsuranceCompanyPage from "./pages/InsuranceCompany/InsuranceCompanyPage";
export default function App() {
  useEffect(() => {
    const cleanup = useAuthStore.getState().initializeAuth();
    return cleanup; // This will now properly call the unsubscribe
  }, []);

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/staff-management" element={<UserManagement />} />
              <Route
                path="/incidents-analytics"
                element={<IncidentsAnalytics />}
              />
              <Route
                path="/insurance-companies"
                element={<InsuranceCompanyPage />}
              />
              {/* Add other protected routes here */}
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
