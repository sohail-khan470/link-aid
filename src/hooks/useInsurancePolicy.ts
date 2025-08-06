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
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { logAction } from "../utils/logAction";

const db = getFirestore();

export const useInsurancePolicy = () => {
  const [loading, setLoading] = useState(false);
  const [policyList, setPolicyList] = useState<any[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);

  // --> Fetch policies belonging to current insurance provider
  useEffect(() => {
    const fetchPolicies = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        setLoading(true);
        const q = query(
          collection(db, "insurancePolicies"),
          where("insuranceProviderId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setPolicyList([]);
          return;
        }

        const policies = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          userId: docSnap.data().userId,
        }));

        setPolicyList(policies);
      } catch (error) {
        console.error("Error fetching policies:", error);
        toast.error("Failed to fetch insurance policies.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // --> Update a policy’s status or coverage
  const updatePolicy = async (policyId: string, updates: any) => {
    try {
      const policyRef = doc(db, "insurancePolicies", policyId);
      await updateDoc(policyRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const updatedPolicySnap = await getDoc(policyRef);
      const updatedPolicy = updatedPolicySnap.data();

      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName =
        currentUserData?.fullName ??
        currentUser.displayName ??
        currentUser.email ??
        "Unknown User";

      // --> Log update action
      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserData?.role || "insurer",
        action: "Update Insurance Policy",
        description: `Updated Policy #${
          updatedPolicy?.policyNumber || "Unknown"
        } for ${updatedPolicy?.userEmail || "Unknown User"}. New Status: ${
          updates?.status || updatedPolicy?.status || "Unchanged"
        }`,
      });

      toast.success("Policy updated successfully.");

      setPolicyList((prev) =>
        prev.map((p) =>
          p.id === policyId ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      );
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update policy.");
    }
  };

  // --> Delete a policy
  const deletePolicy = async (policyId: string) => {
    try {
      const policyRef = doc(db, "insurancePolicies", policyId);
      const deletedPolicySnap = await getDoc(policyRef);

      if (!deletedPolicySnap.exists()) {
        toast.error("Policy not found.");
        return;
      }

      const deletedPolicy = deletedPolicySnap.data();

      // --> Delete the policy
      await deleteDoc(policyRef);

      // --> Update related user (remove from company & unverify)
      if (deletedPolicy?.userId) {
        const userRef = doc(db, "users", deletedPolicy.userId);
        await updateDoc(userRef, {
          companyId: null,
          isVerified: false,
          updatedAt: serverTimestamp(),
        });
      }

      // --> Get current user info
      const currentUser = auth.currentUser;
      if (!currentUser) return toast.error("Not authenticated.");

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName =
        currentUserData?.fullName ??
        currentUser.displayName ??
        currentUser.email ??
        "Unknown User";

      // --> Log delete action
      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserData?.role || "insurer",
        action: "Delete Insurance Policy",
        description: `Deleted Policy #${
          deletedPolicy?.policyNumber || "Unknown"
        } for ${deletedPolicy?.userEmail || "Unknown User"}.`,
      });

      // --> Update local state
      setPolicyList((prev) => prev.filter((p) => p.id !== policyId));

      toast.success("Policy deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete policy.");
    }
  };

  return {
    loading,
    policyList,
    updatePolicy,
    deletePolicy,
    editingPolicy,
    setEditingPolicy,
  };
};
