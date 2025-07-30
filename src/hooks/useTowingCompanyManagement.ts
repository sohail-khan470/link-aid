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

export const useTowingCompanyManagement = () => {
  const [towingCompanies, setTowingCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "towing_companies"));
        const companies = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let isVerified = false;

            try {
              const userSnap = await getDoc(doc(db, "users", data.adminId));
              if (userSnap.exists()) {
                isVerified = userSnap.data().isVerified || false;
              }
            } catch (e) {
              console.warn("Verification lookup failed", e);
            }

            return {
              id: docSnap.id,
              ...data,
              isVerified,
            };
          })
        );
        setTowingCompanies(companies);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch towing companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this towing company?")
    ) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "towing_companies", id));
        await deleteDoc(doc(db, "users", id));
        setTowingCompanies((prev) => prev.filter((c) => c.id !== id));
        toast.success("Towing company deleted successfully");
      } catch (err) {
        console.error(err);
        setError("Failed to delete towing company");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (
    formData: {
      name: string;
      email: string;
      phoneNumber?: string;
      address?: string;
      region: string;
      password?: string;
    },
    currentCompany: any | null
  ) => {
    setFormLoading(true);

    try {
      if (currentCompany) {
        // ✅ Update towing company document
        await updateDoc(doc(db, "towing_companies", currentCompany.id), {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          address: formData.address || "",
          region: formData.region,
        });

        // ✅ Use adminId if it exists, fallback to company.id
        const userId = currentCompany.adminId || currentCompany.id;
        const userRef = doc(db, "users", userId);

        // ✅ Merge so it won't error if doc missing
        await setDoc(
          userRef,
          {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phoneNumber || "",
            location: formData.address || "",
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );

        setTowingCompanies((prev) =>
          prev.map((c) =>
            c.id === currentCompany.id ? { ...c, ...formData } : c
          )
        );

        toast.success("Towing company updated successfully");
      } else {
        // ✅ New towing company
        if (!formData.password) {
          toast.error("Password is required for new towing company");
          return false;
        }

        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          formData.password
        );
        const newUser = userCredential.user;
        await sendEmailVerification(newUser);

        const createdAt = Timestamp.now();

        // ✅ Create user doc
        await setDoc(doc(db, "users", newUser.uid), {
          createdAt,
          email: formData.email,
          fullName: formData.name,
          isVerified: false,
          language: "en",
          lastLogin: null,
          location: formData.address || "",
          phone: formData.phoneNumber || "",
          role: "towing_company",
          verifiedAt: null,
        });

        // ✅ Create towing company doc
        await setDoc(doc(db, "towing_companies", newUser.uid), {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          address: formData.address || "",
          region: formData.region,
          createdAt,
          adminId: newUser.uid,
        });

        setTowingCompanies((prev) => [
          ...prev,
          {
            id: newUser.uid,
            ...formData,
            createdAt,
            isVerified: false,
            adminId: newUser.uid,
          },
        ]);

        toast.success("Towing company added. Verification email sent.");
      }

      return true;
    } catch (err) {
      console.error("🔥 Error in towing handleSubmit:", err);
      setError("Operation failed");
      toast.error("Operation failed");
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  return {
    towingCompanies,
    loading,
    error,
    formLoading,
    handleDelete,
    handleSubmit,
  };
};
