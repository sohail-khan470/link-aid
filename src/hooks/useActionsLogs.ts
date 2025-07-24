import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../../firebase"; // include auth
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
    let unsubscribe: () => void;
    let currentUserUnsub: () => void;

    const init = async () => {
      currentUserUnsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const currentUser = userDoc.data();
              const currentRole = currentUser.role;

              const q = query(
                collection(db, "actions_log"),
                orderBy("timestamp", "desc")
              );

              unsubscribe = onSnapshot(
                q,
                (snapshot: QuerySnapshot<DocumentData>) => {
                  try {
                    const data = snapshot.docs.map((doc) => ({
                      id: doc.id,
                      ...doc.data(),
                    })) as ActionLog[];

                    // 🔐 Filter logs based on current user role
                    const filteredLogs =
                      currentRole === "super_admin"
                        ? data
                        : data.filter((log) => log.role === currentRole);

                    setLogs(filteredLogs);
                    setNewNotification(true);
                    setLoading(false);
                  } catch (err) {
                    console.error("Error parsing logs:", err);
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
            } else {
              setError("User not found");
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to fetch user info");
            setLoading(false);
          }
        } else {
          setLogs([]);
          setLoading(false);
        }
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
      if (currentUserUnsub) currentUserUnsub();
    };
  }, []);

  return {
    logs,
    newNotification,
    clearNotification: () => setNewNotification(false),
    loading,
    error,
  };
}
