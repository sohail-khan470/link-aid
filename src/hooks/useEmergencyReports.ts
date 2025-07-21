import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

export interface EmergencyReport {
  id: string;
  claimId: string;
  createdAt: Timestamp;
  incidentText: string;
  location: {
    lat: number;
    lng: number;
  };
  priority: string;
  responderId: string;
  summary: string;
  towRequested: boolean;
  images?: string[];
}

export interface Responder {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  status: string;
  lastUpdated: Timestamp;
}

const useEmergencyReports = () => {
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>(
    []
  );
  const [responders, setResponders] = useState<Record<string, Responder>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmergencyReports = async () => {
      try {
        const q = query(collection(db, "emergency_reports"));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const reports: EmergencyReport[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              reports.push({
                id: doc.id,
                claimId: data.claimId,
                createdAt: data.createdAt,
                incidentText: data.incidentText,
                location: data.location,
                priority: data.priority,
                responderId: data.responderId,
                summary: data.summary,
                towRequested: data.towRequested,
                images: data.images || [],
              });
            });
            setEmergencyReports(reports);

            // Fetch responder details for each report
            reports.forEach(async (report) => {
              const responderRef = doc(db, "responders", report.responderId);
              const responderSnap = await getDoc(responderRef);
              if (responderSnap.exists()) {
                setResponders((prev) => ({
                  ...prev,
                  [report.responderId]: {
                    id: responderSnap.id,
                    fullName: responderSnap.data().fullName,
                    phone: responderSnap.data().phone,
                    region: responderSnap.data().region,
                    status: responderSnap.data().status,
                    lastUpdated: responderSnap.data().lastUpdated,
                  },
                }));
              }
            });
          },
          (error) => {
            setError(error.message);
          }
        );

        setLoading(false);
        return () => unsubscribe();
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchEmergencyReports();
  }, []);

  return { emergencyReports, responders, loading, error };
};

export default useEmergencyReports;
