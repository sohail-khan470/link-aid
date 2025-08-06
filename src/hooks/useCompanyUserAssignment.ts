import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { logAction } from "../utils/logAction"; // adjust path if needed

const db = getFirestore();

export const useStaffAssignment = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("Unknown Company");

  // ✅ Step 1: Find current user's company
  useEffect(() => {
    const fetchCompany = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const q = query(
        collection(db, "insurance_company"),
        where("adminId", "==", currentUser.uid)
      );

      try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          toast.error("No insurer company found for current admin.");
          return;
        }

        const companyDoc = snapshot.docs[0];
        const companyData = companyDoc.data();
        const name = companyData?.companyName || "Unknown Company";

        setCompanyId(companyDoc.id);
        setCompanyName(name);

        subscribeStaff(companyDoc.id); // 🔥 Real-time staff updates
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast.error("Error fetching company info.");
      }
    };

    fetchCompany();
  }, []);

  // ✅ Step 2: Real-time staff fetch
  const subscribeStaff = (companyId: string) => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "insurer"),
      where("companyId", "==", companyId)
    );

    return onSnapshot(q, (snapshot) => {
      const staff = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStaffList(staff);
    });
  };

  // ✅ Search civilian by email
  const fetchUserByEmail = async () => {
    setLoading(true);
    setUserData(null);

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", searchEmail)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error("No user found. Please register first.");
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      if (data.role !== "civilian") {
        toast.error("User is not a civilian. Please register them first.");
        return;
      }

      const isAlreadyStaff = staffList.some(
        (staff) => staff.email === searchEmail
      );
      if (isAlreadyStaff) {
        toast.warning("User is already part of your staff.");
        return;
      }

      setUserData({ id: docSnap.id, ...data });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to fetch user.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Assign a civilian as insurer in this company
  const assignRoleAndCompany = async (newRole: string) => {
    if (!userData || !companyId) {
      toast.error("Missing user or company info.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return toast.error("Not authenticated.");

    try {
      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      await updateDoc(doc(db, "users", userData.id), {
        role: newRole,
        companyId,
        isVerified: true,
        updatedAt: serverTimestamp(),
      });

      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserRole,
        action: "Assign Staff",
        description: `Assigned ${
          userData.fullName ?? "User"
        } to company ${companyName} as ${newRole}`,
      });

      toast.success("User added to your company.");
      setUserData(null);
      setSearchEmail("");
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to update user.");
    }
  };

  // ✅ Delete staff (revert to civilian)
  const deleteStaff = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);
      const targetUser = userSnap.data();

      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      await updateDoc(userRef, {
        companyId: null,
        role: "civilian",
        isVerified: false,
        updatedAt: serverTimestamp(),
      });

      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserRole,
        action: "Remove Staff",
        description: `Removed ${
          targetUser?.fullName ?? "User"
        } from company ${companyName}`,
      });

      toast.success("Staff removed from your company.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove staff.");
    }
  };

  // ✅ Update staff role or verification status
  const updateStaffRole = async (
    targetUserId: string,
    newRole: string,
    newIsVerified: boolean
  ) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      await updateDoc(doc(db, "users", targetUserId), {
        role: newRole,
        isVerified: newIsVerified,
        updatedAt: serverTimestamp(),
      });

      const targetUserSnap = await getDoc(doc(db, "users", targetUserId));
      const targetUser = targetUserSnap.data();

      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserRole,
        action: "Update Staff Role",
        description: `Updated role of ${
          targetUser?.fullName ?? "user"
        } to ${newRole} (Verified: ${newIsVerified}) in company ${companyName}`,
      });

      toast.success("User updated successfully.");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.");
    }
  };

  return {
    searchEmail,
    setSearchEmail,
    loading,
    userData,
    fetchUserByEmail,
    assignRoleAndCompany,
    staffList,
    deleteStaff,
    updateStaffRole,
    companyId,
    companyName,
  };
};
