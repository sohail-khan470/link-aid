import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface Incident {
  id: string;
  aiSuggestion?: {
    damageType: string;
    estimatedCost: string;
  };
  category: string;
  description: string;
  images: [];
  location: {
    lat: number;
    lng: number;
  };
  responderEmail: string;
  responderId: string;
  responderLoction: {
    lat: number;
    lng: number;
  };
  status: string;
  sumittedAt: Timestamp;
  updatedAt: Timestamp;
  userEmail: string;
  userId: string;
  [key: string]: any; // fallback for optional properties
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "incidentReports"));
        const incidentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incident[];

        setIncidents(incidentsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch incidents");
        console.error("Error fetching incidents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return { incidents, loading, error };
};
