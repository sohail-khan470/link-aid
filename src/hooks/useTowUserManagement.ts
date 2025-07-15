import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

interface TowingOperator {
  id?: string;
  companyId: string;
  name: string;
  plateNumber: string;
  status: boolean;
  isVerified: boolean;
  userId: string;
  etaToCurrentJob?: number;
  location?: [string, string];
  vehicleTypes?: string[];
}

interface Company {
  id: string;
  name: string;
  adminId: string;
  [key: string]: any;
}

interface UseTowingUserManagementReturn {
  // State
  company: Company | null;
  operators: TowingOperator[];
  loading: boolean;
  error: string;

  // Actions
  addOperator: (
    operator: Omit<TowingOperator, "id" | "companyId">
  ) => Promise<void>;
  updateOperator: (
    id: string,
    operator: Partial<TowingOperator>
  ) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useTowingUserManagement = (): UseTowingUserManagementReturn => {
  const [company, setCompany] = useState<Company | null>(null);
  const [operators, setOperators] = useState<TowingOperator[]>([]);
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

      // Get operators for this company
      const operatorsRef = collection(db, "towing_operators");
      const operatorsQuery = query(
        operatorsRef,
        where("companyId", "==", companyData.id)
      );
      const operatorsSnapshot = await getDocs(operatorsQuery);

      const operatorsData = operatorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TowingOperator[];

      setOperators(operatorsData);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Add new operator
  const addOperator = async (
    operatorData: Omit<TowingOperator, "id" | "companyId">
  ) => {
    try {
      if (!company?.id) {
        throw new Error("Company not found");
      }

      const newOperatorData = {
        ...operatorData,
        companyId: company.id,
      };

      const docRef = await addDoc(
        collection(db, "towing_operators"),
        newOperatorData
      );

      const newOperator = { ...newOperatorData, id: docRef.id };
      setOperators((prev) => [...prev, newOperator]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to add operator");
    }
  };

  // Update existing operator
  const updateOperator = async (
    id: string,
    operatorData: Partial<TowingOperator>
  ) => {
    try {
      await updateDoc(doc(db, "towing_operators", id), operatorData);

      setOperators((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...operatorData } : op))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update operator");
    }
  };

  // Delete operator
  const deleteOperator = async (id: string) => {
    try {
      await deleteDoc(doc(db, "towing_operators", id));
      setOperators((prev) => prev.filter((op) => op.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete operator");
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
    addOperator,
    updateOperator,
    deleteOperator,
    refreshData,
  };
};
