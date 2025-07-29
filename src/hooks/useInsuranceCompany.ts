import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { toast } from "react-toastify";
import { db, secondaryAuth } from "../../firebase";

export const useInsuranceCompany = () => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, "insurance_company")
        );

        const companiesWithVerification = await Promise.all(
          querySnapshot.docs.map(async (companyDoc) => {
            const data = companyDoc.data();
            let isVerified = false;

            try {
              // fetch from users collection
              const userDoc = await getDoc(doc(db, "users", data.adminId));
              if (userDoc.exists()) {
                isVerified = userDoc.data().isVerified || false;
              }
            } catch (e) {
              console.warn("User lookup failed", e);
            }

            return {
              id: companyDoc.id,
              ...data,
              isVerified, // ✅ attach field
            };
          })
        );

        setInsuranceCompanies(companiesWithVerification);
        setError(null);
      } catch (err) {
        setError("Failed to fetch companies");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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

        await deleteDoc(doc(db, "users", id));

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
    formData: {
      companyName: string;
      contactEmail: string;
      region: string;
      password?: string;
      phone?: string;
      location?: string;
      language?: string;
    },
    currentCompany: any | null
  ) => {
    setFormLoading(true);

    try {
      if (currentCompany) {
        // ✅ Update existing company document
        await updateDoc(doc(db, "insurance_company", currentCompany.id), {
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          region: formData.region,
        });

        // ✅ Update related user document as well
        await updateDoc(doc(db, "users", currentCompany.id), {
          fullName: formData.companyName,
          email: formData.contactEmail,
          phone: formData.phone || "",
          location: formData.location || "",
          language: formData.language || "en",
          updatedAt: Timestamp.now(),
        });

        setInsuranceCompanies((prev) =>
          prev.map((company) =>
            company.id === currentCompany.id
              ? { ...company, ...formData }
              : company
          )
        );
        toast.success("Company updated successfully");
      } else {
        // ✅ Create new
        if (!formData.password) {
          toast.error("Password is required for new companies");
          return false;
        }

        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.contactEmail,
          formData.password
        );

        const newUser = userCredential.user;
        await sendEmailVerification(newUser);

        const createdAt = Timestamp.now();

        // ✅ Create user document with phone & location
        await setDoc(doc(db, "users", newUser.uid), {
          createdAt,
          email: formData.contactEmail,
          fullName: formData.companyName,
          isVerified: false,
          language: formData.language || "en",
          lastLogin: null,
          location: formData.location || "",
          phone: formData.phone || "",
          role: "insurer",
          verifiedAt: null,
        });

        // ✅ Create insurance company document
        await setDoc(doc(db, "insurance_company", newUser.uid), {
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          region: formData.region,
          createdAt,
          activeClaims: [],
          adminId: newUser.uid,
        });

        setInsuranceCompanies((prev) => [
          ...prev,
          {
            id: newUser.uid,
            companyName: formData.companyName,
            contactEmail: formData.contactEmail,
            region: formData.region,
            createdAt,
            activeClaims: [],
            adminId: newUser.uid,
            isVerified: false,
            phone: formData.phone || "",
            location: formData.location || "",
          },
        ]);

        toast.success(
          "Company and user added successfully. Verification email sent."
        );
      }
      return true;
    } catch (error) {
      console.error(error);
      setError("Operation failed");
      toast.error("Operation failed");
      return false;
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
