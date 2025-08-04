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

// Helper: get current admin context
const getCurrentUserContext = async () => {
  const u = auth.currentUser;
  if (!u) return null;
  try {
    const snap = await getDoc(doc(db, "users", u.uid));
    const data = snap.exists() ? snap.data()! : {};
    return {
      userId: u.uid,
      userName: (data.fullName as string) || "Unknown",
      role: (data.role as string) || "unknown",
    };
  } catch {
    return { userId: u.uid, userName: "Unknown", role: "unknown" };
  }
};

export const useTowingCompanyManagement = () => {
  const [towingCompanies, setTowingCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cache previous isVerified states
  const verificationCache = useRef<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);

    // 1️⃣ Listen for towing_company docs
    const unsubCompanies = onSnapshot(
      collection(db, "towing_companies"),
      async (snap) => {
        try {
          const list = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data();
              let isVerified = false;
              try {
                const uSnap = await getDoc(doc(db, "users", data.adminId));
                if (uSnap.exists()) {
                  isVerified = uSnap.data().isVerified || false;
                }
              } catch {}
              return { id: d.id, ...data, isVerified };
            })
          );
          setTowingCompanies(list);
          setLoading(false);
        } catch (e) {
          console.error(e);
          setError("Failed to sync towing companies");
          setLoading(false);
        }
      }
    );

    // 2️⃣ Listen for user isVerified changes on towing_company role
    const q = query(
      collection(db, "users"),
      where("role", "==", "towing_company")
    );
    const unsubUsers = onSnapshot(q, async (snap) => {
      for (const change of snap.docChanges()) {
        const id = change.doc.id;
        const data = change.doc.data();
        const newVerified = data.isVerified || false;

        if (change.type === "added") {
          verificationCache.current[id] = newVerified;
        }
        if (change.type === "modified") {
          const old = verificationCache.current[id];
          if (old !== undefined && old !== newVerified) {
            const ctx = await getCurrentUserContext();
            if (ctx) {
              await logAction({
                userId: ctx.userId,
                userName: ctx.userName,
                role: ctx.role,
                action: "Verification Status Change",
                description: `Verification status for "${
                  data.fullName
                }" changed from ${old ? "Verified" : "Unverified"} to ${
                  newVerified ? "Verified" : "Unverified"
                }.`,
              });
            }
            // update UI badge
            setTowingCompanies((prev) =>
              prev.map((c) =>
                c.adminId === id ? { ...c, isVerified: newVerified } : c
              )
            );
          }
          verificationCache.current[id] = newVerified;
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

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this towing company?"))
      return;
    const ctx = await getCurrentUserContext();
    try {
      setLoading(true);
      const compRef = doc(db, "towing_companies", id);
      const compSnap = await getDoc(compRef);
      const comp = compSnap.exists() ? compSnap.data()! : {};

      await deleteDoc(compRef);
      await deleteDoc(doc(db, "users", comp.adminId || id));

      setTowingCompanies((prev) => prev.filter((c) => c.id !== id));
      toast.success("Towing company deleted successfully");

      if (ctx) {
        await logAction({
          userId: ctx.userId,
          userName: ctx.userName,
          role: ctx.role,
          action: "Delete Towing Company",
          description: `Towing company "${comp.name || "Unknown"}" with email ${
            comp.email || "N/A"
          } was permanently deleted.`,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete towing company");
    } finally {
      setLoading(false);
    }
  };

  // ➕ / ✏️ Create or Update
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
    const ctx = await getCurrentUserContext();
    try {
      if (currentCompany) {
        // Update
        await updateDoc(doc(db, "towing_companies", currentCompany.id), {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          address: formData.address || "",
          region: formData.region,
        });
        const userId = currentCompany.adminId || currentCompany.id;
        await setDoc(
          doc(db, "users", userId),
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
        if (ctx) {
          await logAction({
            userId: ctx.userId,
            userName: ctx.userName,
            role: ctx.role,
            action: "Update Towing Company",
            description: `Towing company "${formData.name}" (Email: ${formData.email}) was updated successfully.`,
          });
        }
      } else {
        // Create
        if (!formData.password) {
          toast.error("Password is required for new towing company");
          return false;
        }
        const { user } = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          formData.password
        );
        await sendEmailVerification(user);
        const createdAt = Timestamp.now();
        await setDoc(doc(db, "users", user.uid), {
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
        await setDoc(doc(db, "towing_companies", user.uid), {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          address: formData.address || "",
          region: formData.region,
          createdAt,
          adminId: user.uid,
        });
        setTowingCompanies((prev) => [
          ...prev,
          {
            id: user.uid,
            ...formData,
            createdAt,
            isVerified: false,
            adminId: user.uid,
          },
        ]);
        toast.success("Towing company added. Verification email sent.");
        if (ctx) {
          await logAction({
            userId: ctx.userId,
            userName: ctx.userName,
            role: ctx.role,
            action: "Add Towing Company",
            description: `A new towing company "${formData.name}" was created with email ${formData.email}.`,
          });
        }
      }
      return true;
    } catch (e) {
      console.error("🔥 Error in handleSubmit:", e);
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
        collection(db, "towing_companies")
      );
      const companies = insuranceCompaniesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("companies----->>", companies);

      if (companies.length === 0) return {};

      // 2. Get all insurer users
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((doc) => doc.data());

      // 3. Build a map of companyId → staff count
      const staffCounts: Record<string, number> = {};
      companies.forEach((c) => {
        const count = users.filter(
          (u) => u.role === "tow_operator" && u.companyId === c.id
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
    towingCompanies,
    loading,
    error,
    formLoading,
    handleDelete,
    handleSubmit,
    getStaffCounts,
  };
};
