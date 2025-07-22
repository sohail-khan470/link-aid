import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

export type ActionLog = {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  description: string;
  timestampFormatted: string;
};

export function useActionsLog() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, "actions_log"),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const formattedLogs: ActionLog[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            userId: data.userId ?? "unknown",
            userName: data.userName ?? "Unknown",
            role: data.role ?? "unknown",
            action: data.action ?? "-",
            description: data.description ?? "-",
            timestampFormatted: data.timestamp?.toDate
              ? format(data.timestamp.toDate(), "dd MMM yyyy, hh:mm a")
              : "-",
          };
        });
        setLogs(formattedLogs);
      } catch (err) {
        console.error("❌ Error fetching actions log:", err);
        setError("Failed to fetch actions log");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return { logs, loading, error };
}
