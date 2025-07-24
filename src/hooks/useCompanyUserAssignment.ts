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
} from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { logAction } from "../utils/logAction"; // ✅ adjust path if needed

const db = getFirestore();

export const useStaffAssignment = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [_, setCompanyName] = useState<string>("Unknown Company");
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

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
        const companyName = companyData?.companyName || "Unknown Company";

        setCompanyId(companyDoc.id);
        setCompanyName(companyName);
        fetchStaffList(companyDoc.id);
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast.error("Error fetching company info.");
      }
    };

    fetchCompany();
  }, []);

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

  const assignRoleAndCompany = async (newRole: string) => {
    if (!userData || !companyId) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return toast.error("Not authenticated.");

    try {
      const currentUserRef = doc(db, "users", currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      const companyDoc = await getDoc(doc(db, "insurance_company", companyId));
      const companyName = companyDoc.exists()
        ? companyDoc.data()?.companyName ?? "Unknown Company"
        : "Unknown Company";

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
      fetchStaffList(companyId);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to update user.");
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);
      const targetUser = userSnap.data();

      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserRef = doc(db, "users", currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      let companyName = "Unknown Company";
      if (companyId) {
        const companyDoc = await getDoc(
          doc(db, "insurance_company", companyId)
        );
        if (companyDoc.exists()) {
          companyName = companyDoc.data()?.companyName ?? "Unknown Company";
        }
      }

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
      if (companyId) fetchStaffList(companyId);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove staff.");
    }
  };

  const updateStaffRole = async (
    targetUserId: string,
    newRole: string,
    newIsVerified: boolean
  ) => {
    try {
      // Step 1: Get current logged-in user info
      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserRef = doc(db, "users", currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      // Step 2: Get company name
      let companyName = "Unknown Company";
      if (companyId) {
        const companyDoc = await getDoc(
          doc(db, "insurance_company", companyId)
        );
        if (companyDoc.exists()) {
          companyName = companyDoc.data()?.companyName ?? "Unknown Company";
        }
      }

      // Step 3: Update target user
      await updateDoc(doc(db, "users", targetUserId), {
        role: newRole,
        isVerified: newIsVerified,
        updatedAt: serverTimestamp(),
      });

      // Step 4: Get updated target user info for logging
      const targetUserSnap = await getDoc(doc(db, "users", targetUserId));
      const targetUser = targetUserSnap.data();

      // Step 5: Log the action using current user's info
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
      if (companyId) fetchStaffList(companyId);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.");
    }
  };

  const fetchStaffList = async (companyId: string) => {
    try {
      const q = query(
        collection(db, "users"),
        where("companyId", "==", companyId)
      );
      const snapshot = await getDocs(q);
      const staff = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStaffList(staff);
    } catch (error) {
      console.error("Staff fetch error:", error);
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
    editingStaff,
    setEditingStaff,
  };
};
