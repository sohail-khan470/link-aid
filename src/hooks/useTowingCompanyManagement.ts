import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";

const useTowingCompanyManagement = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "towing_companies"));
      const querySnapshot = await getDocs(q);
      const companiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompanies(companiesData);
    } catch (err) {
      setError("Failed to fetch companies. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: any) => {
    try {
      const newCompany = {
        ...companyData,
        createdAt: new Date().toISOString(),
        isActive: true,
        location: [59.3293, 18.0687],
        operatorIds: [],
        vehicleIds: [],
      };
      const docRef = await addDoc(
        collection(db, "towing_companies"),
        newCompany
      );

      return { id: docRef.id, ...newCompany };
    } catch (err) {
      setError("Failed to create company. Please try again.");
      console.error(err);
      throw err;
    }
  };

  const updateCompany = async (id: string, companyData: any) => {
    try {
      const companyRef = doc(db, "towing_companies", id);
      await updateDoc(companyRef, companyData);
      setCompanies(
        companies.map((company) =>
          company.id === id ? { ...company, ...companyData } : company
        )
      );
    } catch (err) {
      setError("Failed to update company. Please try again.");
      console.error(err);
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, "towing_companies", id));
      setCompanies(companies.filter((company) => company.id !== id));
    } catch (err) {
      setError("Failed to delete company. Please try again.");
      console.error(err);
      throw err;
    }
  };

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};

export default useTowingCompanyManagement;
