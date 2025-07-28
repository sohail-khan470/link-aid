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
  claimNumber: string; // always generated
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
        const rawClaims = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<
            Claim,
            "id" | "fullName" | "role" | "claimNumber"
          >;

          // fallback claim number
          const date = data.submittedAt?.toDate
            ? data.submittedAt
                .toDate()
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "")
            : "unknown";
          const fallbackNumber = `C-${date}-${doc.id.slice(0, 5)}`;

          return {
            id: doc.id,
            ...data,
            claimNumber: fallbackNumber,
          };
        });

        const userIds = Array.from(new Set(rawClaims.map((c) => c.userId)));

        const userMap: Record<string, { fullName: string; role: string }> = {};

        await Promise.all(
          userIds.map(async (userId) => {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const role = userData.role;
              if (["civilian", "responder", "insurer"].includes(role)) {
                userMap[userId] = {
                  fullName: userData.fullName || "Unknown User",
                  role,
                };
              }
            }
          })
        );

        const filteredClaims: Claim[] = rawClaims
          .filter((claim) => userMap[claim.userId])
          .map((claim) => {
            const formattedDate = claim.submittedAt?.toDate
              ? claim.submittedAt
                  .toDate()
                  .toISOString()
                  .slice(0, 10)
                  .replace(/-/g, "")
              : "NA";
            const shortId = claim.id.slice(0, 5);
            return {
              ...claim,
              fullName: userMap[claim.userId].fullName,
              role: userMap[claim.userId].role,
              claimNumber: `C-${formattedDate}-${shortId}`,
            };
          });

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
