
// import { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   Timestamp,
// } from "firebase/firestore";
// import { db, auth } from "../../firebase";
// import { logAction } from "../utils/logAction";

// type TowRequestWithNames = {
//   id: string;
//   userId: string;
//   vehicleType: string;
//   location: {
//     latitude: number;
//     longitude: number;
//   };
//   status: "requested" | "accepted" | "pending" | "resolved";
//   matchedOperatorId?: string | null;
//   etaMinutes?: number | null;
//   priorityScore?: number | null;
//   notes?: string;
//   companyId?: string | null;
//   requestedAt: Timestamp | null;
//   civilianName: string;
//   operatorName: string;
//   role: string;
// };

// export function useTowRequests() {
//   const [requests, setRequests] = useState<TowRequestWithNames[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const currentUser = auth.currentUser;
//       if (!currentUser) return;

//       const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
//       const currentUserData = currentUserSnap.data();
//       const currentUserRole = currentUserData?.role;

//       // 🔒 Log view if not super admin
//       if (currentUserRole !== "super_admin") {
//         await logAction({
//           userId: currentUser.uid,
//           userName: currentUserData?.fullName ?? "Unknown",
//           role: currentUserRole,
//           action: "View Tow Requests",
//           description: `${currentUserData?.fullName ?? "User"} viewed tow requests list`,
//         });
//       }

//       const snapshot = await getDocs(collection(db, "tow_requests"));
//       const data = await Promise.all(
//         snapshot.docs.map(async (docSnap) => {
//           const tow = docSnap.data();

//           // 👤 Get civilian info
//           const userSnap = await getDoc(doc(db, "users", tow.userId));
//           const user = userSnap.exists() ? userSnap.data() : null;
//           const civilianName = user?.fullName || "Unknown";
//           const civilianRole = user?.role || "unknown";

//           // 👷 Get matched operator info
//           let operatorName = "Not Assigned";
//           if (tow.matchedOperatorId) {
//             const opSnap = await getDoc(doc(db, "users", tow.matchedOperatorId));
//             if (opSnap.exists()) {
//               const opData = opSnap.data();
//               operatorName = opData?.fullName || "Unknown";
//             }
//           }

//           return {
//             id: docSnap.id,
//             userId: tow.userId,
//             vehicleType: tow.vehicleType || "Unknown",
//             location: tow.location || { latitude: 0, longitude: 0 },
//             status: tow.status,
//             matchedOperatorId: tow.matchedOperatorId || null,
//             etaMinutes: tow.etaMinutes ?? null,
//             priorityScore: tow.priorityScore ?? null,
//             notes: tow.notes || "",
//             companyId: tow.companyId || null,
//             requestedAt:
//               tow.requestedAt instanceof Timestamp ? tow.requestedAt : null,
//             civilianName,
//             operatorName,
//             role: civilianRole, // ✅ Injected role
//           } as TowRequestWithNames;
//         })
//       );

//       setRequests(data);
//     } catch (err) {
//       console.error("Error loading tow requests:", err);
//       setError("Failed to load tow requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return {
//     requests,
//     loading,
//     error,
//     refetch: fetchData,
//   };
// }


import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { logAction } from "../utils/logAction";

type TowRequestWithNames = {
  id: string;
  userId: string;
  vehicleType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: "requested" | "accepted" | "pending" | "resolved";
  matchedOperatorId?: string | null;
  etaMinutes?: number | null;
  priorityScore?: number | null;
  notes?: string;
  companyId?: string | null;
  requestedAt: Timestamp | null;
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

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserRole = currentUserData?.role;

      // 🔒 Log view if not super admin
      if (currentUserRole !== "super_admin") {
        await logAction({
          userId: currentUser.uid,
          userName: currentUserData?.fullName ?? "Unknown",
          role: currentUserRole,
          action: "View Tow Requests",
          description: `${currentUserData?.fullName ?? "User"} viewed tow requests list`,
        });
      }

      const snapshot = await getDocs(collection(db, "tow_requests"));
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const tow = docSnap.data();

          // 👤 Get civilian/responder info
          const userSnap = await getDoc(doc(db, "users", tow.userId));
          if (!userSnap.exists()) return null;

          const user = userSnap.data();
          const civilianRole = user?.role || "unknown";

          // ✅ Only allow civilian or responder roles
          if (civilianRole !== "civilian" && civilianRole !== "responder") {
            return null;
          }

          const civilianName = user?.fullName || "Unknown";

          // 👷 Get matched operator info
          let operatorName = "Not Assigned";
          if (tow.matchedOperatorId) {
            const opSnap = await getDoc(doc(db, "users", tow.matchedOperatorId));
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
            requestedAt:
              tow.requestedAt instanceof Timestamp ? tow.requestedAt : null,
            civilianName,
            operatorName,
            role: civilianRole, // ✅ Injected role
          } as TowRequestWithNames;
        })
      );

      // Remove any nulls from the map (filtered requests)
      const filteredData = data.filter(Boolean) as TowRequestWithNames[];
      setRequests(filteredData);
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
