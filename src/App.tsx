import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/Shared/AuthPages/SignIn";
import SignUp from "./pages/Shared/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import ProfilePage from "./pages/Profile/Profile";
import IncidentsAnalytics from "./pages/Shared/IncidentsManagement/IncidentsAnalytics";
import InsuranceCompanyPage from "./pages/InsuranceCompany/InsuranceCompanyPage";
import { onAuthStateChanged, User } from "firebase/auth";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { auth, db } from "../firebase";
import Home from "./pages/AdminDashboard/Dashboard/Home";
import UserManagement from "./pages/TowingCompnayDashboard/StaffManagement/UserManagement";
import { doc, getDoc } from "firebase/firestore";
import Unauthorized from "./pages/Shared/Unauthourised/Unauthorised";
import { RoleRoute } from "./components/auth/RoleRoute";
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Wait for Firebase to initialize
  const [role, setrole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("User:", firebaseUser);
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const currentDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setrole(currentDoc.data()?.role as string);
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(role);

  if (loading) {
    return <LoadingSpinner />;
  }

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

          {/* Super Admin Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/insurance-companies"
                  element={<InsuranceCompanyPage />}
                />
              </Route>
            </Route>
          </Route>

          {/* Towing Company Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["towing_company"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/staff-management" element={<UserManagement />} />
                <Route
                  path="/incidents-analytics"
                  element={<IncidentsAnalytics />}
                />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
