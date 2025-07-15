import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-toastify";
// import { InsuranceCompany } from "../types/InsuranceCompany.types";

export const useInsuranceCompany = () => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, "insurance_company")
        );
        const companies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        setInsuranceCompanies(companies);
        setError(null);
      } catch (err) {
        setError("Failed to fetch companies");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [db]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "insurance_company", id));
        setInsuranceCompanies((prev) =>
          prev.filter((company) => company.id !== id)
        );
        toast.success("Company deleted successfully");
      } catch (error) {
        setError("Failed to delete company");
        toast.error("Failed to delete company");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (
    formData: { companyName: string; contactEmail: string; region: string },
    currentCompany: any | null
  ) => {
    setFormLoading(true);

    try {
      if (currentCompany) {
        // Update existing company
        await updateDoc(
          doc(db, "insurance_company", currentCompany.id),
          formData
        );
        setInsuranceCompanies((prev) =>
          prev.map((company) =>
            company.id === currentCompany.id
              ? { ...company, ...formData }
              : company
          )
        );
        toast.success("Company updated successfully");
      } else {
        // Add new company
        const docRef = await addDoc(
          collection(db, "insurance_company"),
          formData
        );
        setInsuranceCompanies((prev) => [
          ...prev,
          { id: docRef.id, ...formData },
        ]);
        toast.success("Company added successfully");
      }
      return true; // Success
    } catch (error) {
      setError("Operation failed");
      toast.error("Operation failed");
      return false; // Failure
    } finally {
      setFormLoading(false);
    }
  };

  return {
    insuranceCompanies,
    loading,
    error,
    formLoading,
    handleDelete,
    handleSubmit,
  };
};
