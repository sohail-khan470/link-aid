import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
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
  sumittedAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const snapshot = await getDocs(collection(db, "claims"));
        const claimsList: Claim[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Claim, "id">),
          id: doc.id,
        }));
        setClaims(claimsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return { claims, loading, error };
};
