import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../ui/LoadingSpinner";

const ProtectedRoute = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const currentDoc = await getDoc(doc(db, "users", user.uid));
          const userData = currentDoc.data();
          setRole(userData?.role || null);
        } catch (error) {
          console.error("Failed to fetch role:", error);
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (role) {
      // Example: If you want to redirect based on role
      if (role === "banned") {
        navigate("/banned", { replace: true });
      }
    }
  }, [role, navigate]);

  if (loading) return <LoadingSpinner />;

  return currentUser ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
