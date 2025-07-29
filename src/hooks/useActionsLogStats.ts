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

    let startDate: Date;
    let endDate: Date;

    const today = new Date();

    if (mode === "hourly") {
      // Current day
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);
    } else if (mode === "weekly") {
      // Current month only
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Monthly → Current year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
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
          mode === "monthly" ? 12 : mode === "weekly" ? 4 : 24;
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
            index = date.getMonth(); // Jan = 0 → Dec = 11
          } else if (mode === "weekly") {
            // Calculate week number within current month
            const week = Math.ceil(date.getDate() / 7);
            index = Math.min(week - 1, 3); // ensure 0–3
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
