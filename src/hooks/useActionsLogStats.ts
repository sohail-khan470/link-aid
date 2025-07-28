import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
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

    const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
    const endOfYear = Timestamp.fromDate(new Date(year + 1, 0, 1));

    const q = query(
      logsRef,
      where("timestamp", ">=", startOfYear),
      where("timestamp", "<", endOfYear)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roleBuckets: Record<string, number[]> = {};
        const bucketCount =
          mode === "monthly" ? 12 : mode === "weekly" ? 4 : 24; // ✅ 24 for hourly
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
            index = date.getMonth(); // 0-11
          } else if (mode === "weekly") {
            const week = Math.ceil(date.getDate() / 7);
            index = Math.min(week - 1, 3); // ensure 0–3
          } else if (mode === "hourly") {
            index = date.getHours(); // ✅ full 24-hour range
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
