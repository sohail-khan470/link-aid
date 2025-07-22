import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Company, Operator } from "../pages/types/Company";

interface UseTowingUserManagementReturn {
  // State
  company: Company | null;
  operators: Operator[];
  loading: boolean;
  error: string;

  // Actions
  updateOperator: (id: string, operator: Partial<Operator>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useTowingStaffManagement = (): UseTowingUserManagementReturn => {
  const [company, setCompany] = useState<Company | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUserId = auth.currentUser?.uid;

  // Fetch company and operators
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!loggedInUserId) {
        throw new Error("User not authenticated");
      }

      // Get company for logged-in admin
      const companiesRef = collection(db, "towing_companies");
      const companyQuery = query(
        companiesRef,
        where("adminId", "==", loggedInUserId)
      );
      const companySnapshot = await getDocs(companyQuery);

      if (companySnapshot.empty) {
        throw new Error("No company found for this admin");
      }

      const companyData = companySnapshot.docs[0].data() as Company;
      companyData.id = companySnapshot.docs[0].id;
      setCompany(companyData);

      // Get users with role "tow_operator" and matching companyId
      const usersRef = collection(db, "users");
      const usersQuery = query(
        usersRef,
        where("role", "==", "tow_operator"),
        where("companyId", "==", companyData.id) // Using adminId as companyId reference
      );
      const usersSnapshot = await getDocs(usersQuery);

      const operatorsData = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          fullName: userData.fullName,
          email: userData.email,
          location: userData.location || null,
          status: userData.status !== false, // Default to true if not specified
          etaToCurrentJob: userData.etaToCurrentJob || null,
          isVerified: userData.isVerified || false,
          vehicleTypes: userData.vehicleTypes || [],
          companyId: userData.companyId,
          role: userData.role,
          userId: doc.id,
          createdAt: userData.createdAt,
        } as Operator;
      });

      setOperators(operatorsData);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Update existing operator (user)
  const updateOperator = async (
    id: string,
    operatorData: Partial<Operator>
  ) => {
    try {
      // Update the user document
      await updateDoc(doc(db, "users", id), operatorData);

      // Update local state
      setOperators((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...operatorData } : op))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update operator");
    }
  };

  // Refresh data
  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (loggedInUserId) {
      fetchData();
    }
  }, [loggedInUserId]);

  return {
    company,
    operators,
    loading,
    error,
    updateOperator,
    refreshData,
  };
};
