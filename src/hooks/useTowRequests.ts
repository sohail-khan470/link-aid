import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { toast } from "react-toastify";
import { logAction } from "../utils/logAction"; //   action logger

type TowRequestWithNames = {
  id: string;
  userId: string;
  vehicleType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: "requested" | "accepted" | "pending" | "resolved" | "cancelled";
  matchedOperatorId?: string | null;
  etaMinutes?: number | null;
  priorityScore?: number | null;
  notes?: string;
  companyId?: string | null;
  timestamp: Timestamp | null;
  civilianName: string;
  operatorName: string;
  role: string;
};

export function useTowRequests() {
  const [requests, setRequests] = useState<TowRequestWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const snapshot = await getDocs(collection(db, "tow_requests"));
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const tow = docSnap.data();

          // 👤 Get civilian info
          const userSnap = await getDoc(doc(db, "users", tow.userId));
          if (!userSnap.exists()) return null;

          const user = userSnap.data();
          const civilianRole = user?.role || "unknown";
          if (civilianRole !== "civilian" && civilianRole !== "responder") {
            return null;
          }

          const civilianName = user?.fullName || "Unknown";

          // 👷 Get matched operator info
          let operatorName = "Not Assigned";
          if (tow.matchedOperatorId) {
            const opSnap = await getDoc(
              doc(db, "users", tow.matchedOperatorId)
            );
            if (opSnap.exists()) {
              const opData = opSnap.data();
              operatorName = opData?.fullName || "Unknown";
            }
          }

          return {
            id: docSnap.id,
            userId: tow.userId,
            vehicleType: tow.vehicleType || "Unknown",
            location: tow.location || { latitude: 0, longitude: 0 },
            status: tow.status,
            matchedOperatorId: tow.matchedOperatorId || null,
            etaMinutes: tow.etaMinutes ?? null,
            priorityScore: tow.priorityScore ?? null,
            notes: tow.notes || "",
            companyId: tow.companyId || null,
            timestamp:
              tow.timestamp instanceof Timestamp ? tow.timestamp : null,
            civilianName,
            operatorName,
            role: civilianRole,
          } as TowRequestWithNames;
        })
      );

      setRequests(data.filter(Boolean) as TowRequestWithNames[]);
    } catch (err) {
      console.error("Error loading tow requests:", err);
      setError("Failed to load tow requests");
    } finally {
      setLoading(false);
    }
  };

  //   Helper to get current user info
  const getCurrentUserInfo = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const currentUserRef = doc(db, "users", currentUser.uid);
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data();

    return {
      uid: currentUser.uid,
      name: currentUserData?.fullName ?? "Unknown",
      role: currentUserData?.role ?? "unknown",
    };
  };

  //   Update tow request status
  const updateTowRequestStatus = async (
    requestId: string,
    newStatus: TowRequestWithNames["status"]
  ) => {
    try {
      const { uid, name, role } = await getCurrentUserInfo();

      const requestRef = doc(db, "tow_requests", requestId);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      await logAction({
        userId: uid,
        userName: name,
        role,
        action: "Update Tow Request Status",
        description: `Changed status of tow request to ${newStatus}`,
      });

      toast.success(`Tow request marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update tow request status.");
    }
  };

  //   Assign operator
  const assignOperatorToRequest = async (
    requestId: string,
    operatorId: string
  ) => {
    try {
      const { uid, name, role } = await getCurrentUserInfo();

      const requestRef = doc(db, "tow_requests", requestId);
      await updateDoc(requestRef, {
        matchedOperatorId: operatorId,
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      const opSnap = await getDoc(doc(db, "users", operatorId));
      const opName = opSnap.exists() ? opSnap.data()?.fullName ?? "Unknown" : "Unknown";

      await logAction({
        userId: uid,
        userName: name,
        role,
        action: "Assign Operator",
        description: `Assigned operator ${opName} to tow request`,
      });

      toast.success("Operator assigned successfully.");
      fetchData();
    } catch (error) {
      console.error("Operator assignment failed:", error);
      toast.error("Failed to assign operator.");
    }
  };

  //   Cancel tow request
  const cancelTowRequest = async (requestId: string) => {
    try {
      const { uid, name, role } = await getCurrentUserInfo();

      const requestRef = doc(db, "tow_requests", requestId);
      await updateDoc(requestRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      await logAction({
        userId: uid,
        userName: name,
        role,
        action: "Cancel Tow Request",
        description: `Cancelled tow request ${requestId}`,
      });

      toast.success("Tow request cancelled.");
      fetchData();
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error("Failed to cancel tow request.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchData,
    updateTowRequestStatus,
    assignOperatorToRequest,
    cancelTowRequest,
  };
}
