import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";

export type ActionLog = {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  description: string;
  timestamp: { toDate: () => Date };
};

export function useActionsLog() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [newNotification, setNewNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "actions_log"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ActionLog[];
          setLogs(data);
          setNewNotification(true);
          setLoading(false);
        } catch (err) {
          console.error("Error parsing actions log:", err);
          setError("Failed to load logs");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Snapshot error:", err);
        setError("Failed to fetch logs");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    logs,
    newNotification,
    clearNotification: () => setNewNotification(false),
    loading,
    error,
  };
}
