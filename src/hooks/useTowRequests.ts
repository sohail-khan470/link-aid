// src/hooks/useTowRequests.ts

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

// Define the type for a tow request with extra display fields
type TowRequestWithNames = {
  id: string;
  userId: string;
  vehicleType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: "requested" | "accepted" | "pending" | "resolved";
  matchedOperatorId?: string;
  etaMinutes?: number;
  priorityScore?: number;
  notes?: string;
  companyId?: string;
  createdAtFormatted: string;
  civilianName: string;
  operatorName: string;
};

export function useTowRequests() {
  const [requests, setRequests] = useState<TowRequestWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "tow_requests"));
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const tow = docSnap.data();

          const userRef = await getDoc(doc(db, "users", tow.userId));
          const user = userRef.exists() ? userRef.data() : null;

          let operator = null;
          if (tow.matchedOperatorId) {
            const opRef = await getDoc(doc(db, "users", tow.matchedOperatorId));
            operator = opRef.exists() ? opRef.data() : null;
          }

          return {
            id: docSnap.id,
            userId: tow.userId,
            vehicleType: tow.vehicleType || "Unknown",
            location: tow.location || { latitude: 0, longitude: 0 },
            status: tow.status,
            matchedOperatorId: tow.matchedOperatorId,
            etaMinutes: tow.etaMinutes,
            priorityScore: tow.priorityScore,
            notes: tow.notes,
            companyId: tow.companyId,
            createdAtFormatted: tow.createdAt?.toDate
              ? format(tow.createdAt.toDate(), "dd MMM yyyy, hh:mm a")
              : "-",
            civilianName: user?.fullName || "Unknown",
            operatorName: operator?.fullName || "Not Assigned",
          } as TowRequestWithNames;
        })
      );

      setRequests(data);
    } catch (err) {
      console.error("Error loading tow requests:", err);
      setError("Failed to load tow requests");
    } finally {
      setLoading(false);
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
  };
}
