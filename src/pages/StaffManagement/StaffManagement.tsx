import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import TowingStaffPage from "../TowingCompany/TowingStaffPage";
import InsuranceStaffPage from "../InsuranceCompany/InsuranceStaffPage";

export default function StaffMangement() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/signin");
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const userData = docSnap.data();
        const userRole = userData?.role;

        if (!userRole) {
          navigate("/unauthorized");
          return;
        }

        setRole(userRole);
      } catch (error) {
        console.error("Error getting user role:", error);
        navigate("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (role === "towing_company") return <TowingStaffPage />;
  if (role === "insurance_company") return <InsuranceStaffPage />;

  return <p>You are not authorized to access this page.</p>;
}
