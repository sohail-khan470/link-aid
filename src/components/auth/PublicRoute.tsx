import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";

const PublicRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setAuthUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          if (userData?.role) {
            setRole(userData.role);
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;

  // 🔴 Redirect if user is logged in and has a role
  if (authUser && role) {
    return <Navigate to="/" replace />;
  }

  // 🔴 Redirect to SignIn if user is authenticated but role is missing
  if (authUser && !role) {
    return <Navigate to="/signin" replace />;
  }

  //   Otherwise allow access to public route (e.g. SignIn page)
  return <Outlet />;
};

export default PublicRoute;
