// import { useState, useEffect } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   updateDoc,
//   doc,
//   serverTimestamp,
//   onSnapshot,
// } from "firebase/firestore";
// import { useInsurancePolicy } from "./useInsurancePolicy";
// import { toast } from "react-toastify";
// import { auth, db } from "../../firebase";

// export function useHoldersWithPolicies() {
//   const [insuranceHolders, setInsuranceHolders] = useState<any[]>([]);
//   const [holdersLoading, setHoldersLoading] = useState(true);
//   useEffect(() => {
//     if (!auth.currentUser) return;
//     const q = query(
//       collection(db, "users"),
//       where("role", "==", "civilian"),
//       where("companyId", "==", auth.currentUser.uid)
//     );
//     const unsubscribe = onSnapshot(q, (snap) => {
//       setInsuranceHolders(
//         snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
//       );
//       setHoldersLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   const { policyList, loading: policiesLoading } = useInsurancePolicy();

//   // Combine holders + their policies ---
//   const holdersWithPolicies = insuranceHolders.map((holder) => ({
//     ...holder,
//     policies: policyList.filter((p) => p.userId === holder.id),
//   }));

//   // Search & assign logic ---
//   const [searchEmail, setSearchEmail] = useState("");
//   const [userData, setUserData] = useState<any | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const fetchUserByEmail = async () => {
//     if (!searchEmail) return toast.error("Enter an email to search.");
//     setActionLoading(true);
//     try {
//       const q = query(
//         collection(db, "users"),
//         where("email", "==", searchEmail.trim())
//       );
//       const snap = await getDocs(q);
//       if (snap.empty) {
//         setUserData(null);
//         toast.error("No user found with that email.");
//       } else {
//         const docSnap = snap.docs[0];
//         setUserData({ id: docSnap.id, ...(docSnap.data() as any) });
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error searching user.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const assignHolderToCompany = async () => {
//     if (!userData || !auth.currentUser) return;
//     if (userData.companyId) {
//       toast.warning("User is already assigned to a company.");
//       return;
//     }
//     setActionLoading(true);
//     try {
//       const userRef = doc(db, "users", userData.id);
//       await updateDoc(userRef, {
//         companyId: auth.currentUser.uid,
//         updatedAt: serverTimestamp(),
//         isVerified: true,
//       });
//       toast.success("User assigned as a policyholder.");
//       // clear out detail card and input
//       setUserData(null);
//       setSearchEmail("");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to assign user.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return {
//     holdersWithPolicies,
//     loading: holdersLoading || policiesLoading,
//     searchEmail,
//     setSearchEmail,
//     userData,
//     setUserData,
//     actionLoading,
//     fetchUserByEmail,
//     assignHolderToCompany,
//   };
// }

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { useInsurancePolicy } from "./useInsurancePolicy";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";
import { logAction } from "../utils/logAction";

// 🔹 Helper to fetch current user context
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

export function useHoldersWithPolicies() {
  const [insuranceHolders, setInsuranceHolders] = useState<any[]>([]);
  const [holdersLoading, setHoldersLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "users"),
      where("role", "==", "civilian"),
      where("companyId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setInsuranceHolders(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
      setHoldersLoading(false);
    });
    return unsubscribe;
  }, []);

  const { policyList, loading: policiesLoading } = useInsurancePolicy();

  // Combine holders + their policies ---
  const holdersWithPolicies = insuranceHolders.map((holder) => ({
    ...holder,
    policies: policyList.filter((p) => p.userId === holder.id),
  }));

  // Search & assign logic ---
  const [searchEmail, setSearchEmail] = useState("");
  const [userData, setUserData] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserByEmail = async () => {
    if (!searchEmail) return toast.error("Enter an email to search.");
    setActionLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", searchEmail.trim())
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setUserData(null);
        toast.error("No user found with that email.");
      } else {
        const docSnap = snap.docs[0];
        setUserData({ id: docSnap.id, ...(docSnap.data() as any) });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error searching user.");
    } finally {
      setActionLoading(false);
    }
  };

  const assignHolderToCompany = async () => {
    if (!userData || !auth.currentUser) return;
    if (userData.companyId) {
      toast.warning("User is already assigned to a company.");
      return;
    }
    setActionLoading(true);
    try {
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        companyId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        isVerified: true,
      });

      toast.success("User assigned as a policyholder.");

      // 🔹 Log the assignment action
      const ctx = await getCurrentUserContext();
      if (ctx) {
        await logAction({
          userId: ctx.userId,
          userName: ctx.userName,
          role: ctx.role,
          action: "Assign Policyholder",
          description: ` assign civilian "${
            userData.fullName || "Unknown"
          }" having email (${userData.email}) to company ${ctx.userName}.`,
        });
      }

      setUserData(null);
      setSearchEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign user.");
    } finally {
      setActionLoading(false);
    }
  };

  const unassignHolderFromCompany = async (
    holderId: string,
    holderData: any
  ) => {
    if (!auth.currentUser) return;
    if (
      !window.confirm(
        `Unassign ${holderData.fullName || "this user"} from company?`
      )
    )
      return;

    setActionLoading(true);
    try {
      const userRef = doc(db, "users", holderId);
      await updateDoc(userRef, {
        companyId: null,
        updatedAt: serverTimestamp(),
      });

      toast.success("User unassigned from the company.");

      // 🔹 Log the unassignment action
      const ctx = await getCurrentUserContext();
      if (ctx) {
        await logAction({
          userId: ctx.userId,
          userName: ctx.userName,
          role: ctx.role,
          action: "Unassign Policyholder",
          description: ` unassigned civilian "${
            holderData.fullName || "Unknown"
          }" having email (${holderData.email}) from company ${ctx.userName}.`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to unassign user.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    holdersWithPolicies,
    loading: holdersLoading || policiesLoading,
    searchEmail,
    setSearchEmail,
    userData,
    setUserData,
    actionLoading,
    fetchUserByEmail,
    assignHolderToCompany,
    unassignHolderFromCompany, // 🔹 Expose unassignment
  };
}
