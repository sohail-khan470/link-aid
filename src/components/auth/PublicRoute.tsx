import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../ui/LoadingSpinner";
import { auth } from "../../../firebase";

const PublicRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // ✅ If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise allow access to public route (e.g. SignIn)
  return <Outlet />;
};

export default PublicRoute;
