import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
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

  useEffect(() => {
    const q = query(collection(db, "actions_log"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActionLog[];
      setLogs(data);
      setNewNotification(true); // show blinking on update
    });

    return () => unsubscribe();
  }, []);

  return { logs, newNotification, clearNotification: () => setNewNotification(false) };
}
