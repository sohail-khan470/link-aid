import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase";

type Mode = "hourly" | "weekly" | "monthly";

export function useRegistrationStatsByRole(mode: Mode, selectedYear: number) {
  const [data, setData] = useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userDocs: any[] = [];
    let insurerDocs: any[] = [];

    const unsubscribeUsers = onSnapshot(
      query(collection(db, "users")),
      (snapshot) => {
        userDocs = snapshot.docs.map((doc) => doc.data());
        updateChart();
      }
    );

    const unsubscribeInsurers = onSnapshot(
      query(collection(db, "insurance_company")),
      (snapshot) => {
        insurerDocs = snapshot.docs.map((doc) => doc.data());
        updateChart();
      }
    );

    const updateChart = () => {
      const roles = ["civilian", "responder", "towing_company"];
      const grouped: { name: string; data: number[] }[] = [];

      for (const role of roles) {
        const roleUsers = userDocs.filter((u) => u.role === role);
        grouped.push({
          name: role,
          data: groupByTime(roleUsers, mode, selectedYear),
        });
      }

      // Insurers are stored in a separate collection
      grouped.push({
        name: "insurer",
        data: groupByTime(insurerDocs, mode, selectedYear),
      });

      setData(grouped);
      setLoading(false);
    };

    return () => {
      unsubscribeUsers();
      unsubscribeInsurers();
    };
  }, [mode, selectedYear]);

  return { data, loading };
}

function groupByTime(docs: any[], mode: Mode, year: number): number[] {
  const buckets = Array(mode === "weekly" ? 4 : 12).fill(0);

  docs.forEach((doc) => {
    const date = doc.createdAt?.toDate?.();
    if (!date) return;

    let index = 0;

    if (mode === "monthly") {
      if (date.getFullYear() !== year) return;
      index = date.getMonth();
    } else if (mode === "weekly") {
      if (date.getFullYear() !== year) return;
      index = Math.floor(date.getDate() / 7);
    } else if (mode === "hourly") {
      const today = new Date();
      if (
        date.getFullYear() !== today.getFullYear() ||
        date.getMonth() !== today.getMonth() ||
        date.getDate() !== today.getDate()
      )
        return;

      index = Math.floor(date.getHours() / 2); // 2-hour buckets (0–2, 2–4, ..., 22–24)
    }

    if (index >= 0 && index < buckets.length) {
      buckets[index]++;
    }
  });

  return buckets;
}
