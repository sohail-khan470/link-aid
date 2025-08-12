import { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  DocumentData,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

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

  // Track the last seen log ID to detect new entries
  const lastSeenLogId = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    let currentUserUnsub: () => void;

    const init = async () => {
      currentUserUnsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            //  Fetch the current logged-in user's Firestore record
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const currentUser = userDoc.data();
              const currentRole = currentUser.role;
              const currentUserId = user.uid;

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

                    // super_admin can see all actions, others only their own role + userId
                    const filteredLogs =
                      currentRole === "super_admin"
                        ? data
                        : data.filter(
                            (log) =>
                              log.role === currentRole &&
                              log.userId === currentUserId
                          );

                    setLogs(filteredLogs);

                    //   Detect if there's a truly new log
                    if (
                      filteredLogs.length > 0 &&
                      filteredLogs[0].id !== lastSeenLogId.current
                    ) {
                      // Mark new notification only when the newest log changes
                      if (lastSeenLogId.current !== null) {
                        setNewNotification(true);
                      }
                      lastSeenLogId.current = filteredLogs[0].id;
                    }

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
