import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function HomeRedirect() {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const user = auth.currentUser;
      if (!user) {
        setRedirectPath("/signin");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        const role = snapshot.data()?.role;

        if (role === "super_admin") {
          setRedirectPath("/admin/home");
        } else if (role === "towing_company") {
          setRedirectPath("/towing/home");
        } else if (role === "insurance_company") {
          setRedirectPath("/insurance/home");
        } else {
          setRedirectPath("/unauthorized");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setRedirectPath("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndRedirect();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (redirectPath) return <Navigate to={redirectPath} replace />;

  return null;
}
