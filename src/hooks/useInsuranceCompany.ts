import { useEffect, useState, useRef } from "react";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { toast } from "react-toastify";
import { db, secondaryAuth, auth } from "../../firebase";
import { logAction } from "../utils/logAction";

// Helper: current admin context
const getCurrentUserContext = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    const data = snap.exists() ? snap.data()! : {};
    return {
      userId: currentUser.uid,
      userName: (data.fullName as string) || "Unknown",
      role: (data.role as string) || "unknown",
    };
  } catch {
    return {
      userId: currentUser.uid,
      userName: "Unknown",
      role: "unknown",
    };
  }
};

export const useInsuranceCompany = () => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cache to track previous isVerified values
  const verificationCache = useRef<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);

    // 1️⃣ Listen for insurance_company docs
    const unsubCompanies = onSnapshot(
      collection(db, "insurance_company"),
      async (snapshot) => {
        try {
          const companies = await Promise.all(
            snapshot.docs.map(async (companyDoc) => {
              const data = companyDoc.data();
              let isVerified = false;
              try {
                const userDoc = await getDoc(doc(db, "users", data.adminId));
                if (userDoc.exists()) {
                  isVerified = userDoc.data().isVerified || false;
                }
              } catch {
                /* ignore */
              }
              return { id: companyDoc.id, ...data, isVerified };
            })
          );
          setInsuranceCompanies(companies);
          setLoading(false);
        } catch (e) {
          console.error(e);
          setError("Failed to sync companies");
          setLoading(false);
        }
      }
    );

    // 2️⃣ Listen for insurer-user isVerified changes
    const userQuery = query(
      collection(db, "users"),
      where("role", "==", "insurer")
    );
    const unsubUsers = onSnapshot(userQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const userId = change.doc.id;
        const data = change.doc.data();
        const newVerified = data.isVerified || false;

        if (change.type === "added") {
          // Initialize cache on first load
          verificationCache.current[userId] = newVerified;
        }

        if (change.type === "modified") {
          const oldVerified = verificationCache.current[userId];
          // If it actually changed, log it and update state
          if (oldVerified !== undefined && oldVerified !== newVerified) {
            const ctx = await getCurrentUserContext();
            if (ctx) {
              await logAction({
                userId: ctx.userId,
                userName: ctx.userName,
                role: ctx.role,
                action: "Verification Status Change",
                description: `Verification status for "${
                  data.fullName
                }" changed from ${oldVerified ? "Verified" : "Unverified"} to ${
                  newVerified ? "Verified" : "Unverified"
                }.`,
              });
            }
            // Also update the matching company’s badge in state
            setInsuranceCompanies((prev) =>
              prev.map((c) =>
                c.adminId === userId ? { ...c, isVerified: newVerified } : c
              )
            );
          }
          // Always update cache
          verificationCache.current[userId] = newVerified;
        }
      }
    });

    return () => {
      unsubCompanies();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    const ctx = await getCurrentUserContext();
    try {
      setLoading(true);
      const compRef = doc(db, "insurance_company", id);
      const compSnap = await getDoc(compRef);
      const comp = compSnap.exists() ? compSnap.data()! : {};

      await deleteDoc(compRef);
      await deleteDoc(doc(db, "users", comp.adminId || id));

      setInsuranceCompanies((prev) => prev.filter((c) => c.id !== id));
      toast.success("Company deleted successfully");

      if (ctx) {
        await logAction({
          userId: ctx.userId,
          userName: ctx.userName,
          role: ctx.role,
          action: "Delete Insurance Company",
          description: `Insurance company "${
            comp.companyName || "Unnamed"
          }" with email ${comp.contactEmail || "N/A"} was permanently deleted.`,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete company");
    } finally {
      setLoading(false);
    }
  };

  // Create / Update
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
    const ctx = await getCurrentUserContext();

    try {
      if (currentCompany) {
        // Update existing
        await updateDoc(doc(db, "insurance_company", currentCompany.id), {
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          region: formData.region,
        });
        const userId = currentCompany.adminId || currentCompany.id;
        await setDoc(
          doc(db, "users", userId),
          {
            fullName: formData.companyName,
            email: formData.contactEmail,
            phone: formData.phone || "",
            location: formData.location || "",
            language: formData.language || "en",
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
        setInsuranceCompanies((prev) =>
          prev.map((c) =>
            c.id === currentCompany.id ? { ...c, ...formData } : c
          )
        );
        toast.success("Company updated successfully");
        if (ctx) {
          await logAction({
            userId: ctx.userId,
            userName: ctx.userName,
            role: ctx.role,
            action: "Update Insurance Company",
            description: `Insurance company "${formData.companyName}" (Email: ${formData.contactEmail}) was updated successfully.`,
          });
        }
      } else {
        // Create new
        if (!formData.password) {
          toast.error("Password is required");
          return false;
        }
        const { user } = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.contactEmail,
          formData.password
        );
        await sendEmailVerification(user);
        const createdAt = Timestamp.now();
        await setDoc(doc(db, "users", user.uid), {
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
        await setDoc(doc(db, "insurance_company", user.uid), {
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          region: formData.region,
          createdAt,
          activeClaims: [],
          adminId: user.uid,
        });
        setInsuranceCompanies((prev) => [
          ...prev,
          {
            id: user.uid,
            companyName: formData.companyName,
            contactEmail: formData.contactEmail,
            region: formData.region,
            createdAt,
            activeClaims: [],
            adminId: user.uid,
            isVerified: false,
            phone: formData.phone || "",
            location: formData.location || "",
          },
        ]);
        toast.success("Company and user added; verification email sent.");
        if (ctx) {
          await logAction({
            userId: ctx.userId,
            userName: ctx.userName,
            role: ctx.role,
            action: "Add Insurance Company",
            description: `A new insurance company "${formData.companyName}" was created with email ${formData.contactEmail}.`,
          });
        }
      }
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Operation failed");
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /////logic pogic
  const getStaffCounts = async () => {
    try {
      // 1. Get all insurance companies
      const insuranceCompaniesSnap = await getDocs(
        collection(db, "insurance_company")
      );
      const companies = insuranceCompaniesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (companies.length === 0) return {};

      // 2. Get all insurer users
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((doc) => doc.data());

      // 3. Build a map of companyId → staff count
      const staffCounts: Record<string, number> = {};
      companies.forEach((c) => {
        const count = users.filter(
          (u) => u.role === "insurer" && u.companyId === c.id
        ).length;
        staffCounts[c.id] = count;
      });

      return staffCounts;
    } catch (error) {
      console.error("Error fetching staff counts:", error);
      return {};
    }
  };

  return {
    insuranceCompanies,
    loading,
    error,
    formLoading,
    handleDelete,
    handleSubmit,
    getStaffCounts,
  };
};
