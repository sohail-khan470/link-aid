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
import TowingCompanyHome from "./pages/TowingCompnayDashboard/Dashboard/TowingCompanyHome";
import HomeRedirect from "./pages/Shared/HomeRedirect";
import InsuranceDashboard from "./pages/InsuranceCompanyDasboard/InsuranceDashboard";
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Wait for Firebase to initialize
  const [role, setrole] = useState("");
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const currentDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const data = currentDoc.data();

          if (data) {
            setFirebaseUser(data);
            setrole(data.role);
          }
        } catch (err) {
          console.error("Error fetching user doc:", err);
        }
      }

      // ✅ Whether user exists or not, we're done loading
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  console.log(firebaseUser);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Super Admin Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/home" element={<Home />} />
                <Route
                  path="/admin/insurance-companies"
                  element={<InsuranceCompanyPage />}
                />
              </Route>
            </Route>
          </Route>

          {/* Towing Company Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["towing_company"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/towing/home" element={<TowingCompanyHome />} />
                <Route
                  path="/towing/staff-management"
                  element={<UserManagement />}
                />
                <Route
                  path="/towing/incidents-analytics"
                  element={<IncidentsAnalytics />}
                />
                <Route path="/towing/profile" element={<ProfilePage />} />
                <Route path="/towing/requests" element={<ProfilePage />} />
                <Route path="/towing/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Route>

          {/* Insurance company Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={["insurance_company"]} />}>
              <Route element={<AppLayout />}>
                <Route
                  path="/insurance/home"
                  element={<InsuranceDashboard />}
                />
                <Route
                  path="/insurance/staff-management"
                  element={<UserManagement />}
                />
                <Route
                  path="/insurance/incidents-analytics"
                  element={<IncidentsAnalytics />}
                />
                <Route path="/insurance/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
