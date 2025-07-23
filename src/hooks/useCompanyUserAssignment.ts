import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../../firebase";

const db = getFirestore();

export const useStaffAssignment = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Load current company info on mount
  useEffect(() => {
    const fetchCompany = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const q = query(
        collection(db, "insurance_company"),
        where("adminId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error("No insurer company found for current admin.");
        return;
      }

      const companyDocId = snapshot.docs[0].id;
      setCompanyId(companyDocId);
      fetchStaffList(companyDocId);
    };

    fetchCompany();
  }, []);

  // Search user by email
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

      // Check if already in staff list
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

  // Assign role & link to company
  const assignRoleAndCompany = async (newRole: string) => {
    if (!userData || !companyId) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return toast.error("Not authenticated.");

    try {
      await updateDoc(doc(db, "users", userData.id), {
        role: newRole,
        companyId,
        isVerified: true,
        updatedAt: new Date(),
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

  // Delete staff
  const deleteStaff = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), {
        companyId: null,
        role: "civilian", // revert role if needed
        isVerified: false,
      });
      toast.success("Staff removed from your company.");
      if (companyId) fetchStaffList(companyId);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove staff.");
    }
  };

  // Edit staff role
  const updateStaffRole = async (
    userId: string,
    newRole: string,
    newIsVerified: boolean
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        isVerified: newIsVerified,
        updatedAt: serverTimestamp(),
      });
      toast.success("User updated successfully.");
      fetchStaffList(companyId!);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.");
    }
  };

  // Fetch company staff
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
