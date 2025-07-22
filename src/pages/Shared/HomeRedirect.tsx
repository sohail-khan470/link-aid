import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { onAuthStateChanged } from "firebase/auth";

export default function HomeRedirect() {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRedirectPath("/signin");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        const role = snapshot.data()?.role;

        if (
          role === "super_admin" ||
          role === "towing_company" ||
          role === "insurer"
        ) {
          setRedirectPath("/home");
        } else {
          setRedirectPath("/unauthorized");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setRedirectPath("/unauthorized");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (redirectPath) return <Navigate to={redirectPath} replace />;

  return null;
}
