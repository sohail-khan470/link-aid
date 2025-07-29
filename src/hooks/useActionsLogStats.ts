import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

type Mode = "hourly" | "weekly" | "monthly";

interface SeriesData {
  name: string;
  data: number[];
}

export function useActionsLogStats(mode: Mode, year: number) {
  const [data, setData] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsRef = collection(db, "actions_log");

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (mode === "hourly") {
      // Current day (00:00 → 23:59)
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    } else if (mode === "weekly") {
      // Start of current week (Sunday) → end of week (next Sunday)
      const day = now.getDay(); // 0 = Sunday
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const q = query(
      logsRef,
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<", Timestamp.fromDate(endDate))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roleBuckets: Record<string, number[]> = {};
        const bucketCount =
          mode === "monthly" ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() // days in month
          : mode === "weekly" ? 7
          : 24; // hourly

        const initArray = Array(bucketCount).fill(0);

        snapshot.forEach((doc) => {
          const log = doc.data();
          const role = log.role || "unknown";
          const ts: Timestamp = log.timestamp;
          const date = ts.toDate();

          if (!roleBuckets[role]) {
            roleBuckets[role] = [...initArray];
          }

          let index = 0;
          if (mode === "monthly") {
            index = date.getDate() - 1; // day of month (0-based)
          } else if (mode === "weekly") {
            index = date.getDay(); // 0 = Sunday
          } else if (mode === "hourly") {
            index = date.getHours(); // 0–23
          }

          roleBuckets[role][index] += 1;
        });

        const formattedData: SeriesData[] = Object.entries(roleBuckets).map(
          ([role, counts]) => ({
            name: role,
            data: counts,
          })
        );

        setData(formattedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to actions log:", error);
        setData([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mode, year]);

  return { data, loading };
}
