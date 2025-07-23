import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export interface Claim {
  id: string;
  aiSuggestion: string | null;
  assignedInsurerId: string | null;
  category: string;
  description: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  status: string;
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  fullName: string;
  role: string;
}

export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimsWithUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "claims"));
        const rawClaims = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Claim, "id" | "fullName" | "role">),
        }));

        const userIds = Array.from(new Set(rawClaims.map((c) => c.userId)));

        const userMap: Record<
          string,
          { fullName: string; role: string }
        > = {};

        await Promise.all(
          userIds.map(async (userId) => {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const role = userData.role;
              if (role === "civilian" || role === "responder") {
                userMap[userId] = {
                  fullName: userData.fullName || "Unknown User",
                  role: role,
                };
              }
            }
          })
        );

        const filteredClaims: Claim[] = rawClaims
          .filter((claim) => userMap[claim.userId]) // Only if user exists & role is valid
          .map((claim) => ({
            ...claim,
            fullName: userMap[claim.userId].fullName,
            role: userMap[claim.userId].role,
          }));

        setClaims(filteredClaims);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaimsWithUsers();
  }, []);

  return { claims, loading, error };
};
