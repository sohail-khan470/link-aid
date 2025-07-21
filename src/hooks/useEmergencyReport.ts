// hooks/useEmergencyReport.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { EmergencyReport, Responder } from "./useEmergencyReports";
import { db } from "../../firebase";

const useEmergencyReport = (id: string) => {
  const [report, setReport] = useState<EmergencyReport | null>(null);
  const [responder, setResponder] = useState<Responder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);

        // Fetch the emergency report
        const reportRef = doc(db, "emergency_reports", id);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
          throw new Error("Report not found");
        }

        const reportData = reportSnap.data() as EmergencyReport;
        setReport({
          ...reportData,
          id: reportSnap.id,
          // Convert Firebase Timestamp to Date if needed
          createdAt: reportData.createdAt || new Date(),
        });

        // Fetch responder if exists
        if (reportData.responderId) {
          const responderRef = doc(db, "responders", reportData.responderId);
          const responderSnap = await getDoc(responderRef);

          if (responderSnap.exists()) {
            const responderData = responderSnap.data() as Responder;
            setResponder({
              ...responderData,
              id: responderSnap.id,
              // Convert Firebase Timestamp if needed
              lastUpdated: responderData.lastUpdated || new Date(),
            });
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  return { report, responder, loading, error };
};

export default useEmergencyReport;
