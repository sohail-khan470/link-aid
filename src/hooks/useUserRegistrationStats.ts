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
  const buckets = Array(
    mode === "weekly" ? 4 : mode === "hourly" ? 12 : 12
  ).fill(0);

  docs.forEach((doc) => {
    const date = doc.createdAt?.toDate?.();
    if (!date) return;

    let index = -1;

    if (mode === "monthly") {
      if (date.getFullYear() !== year) return;
      index = date.getMonth();
    } 
    
    else if (mode === "weekly") {
      const today = new Date();
      if (
        date.getFullYear() !== today.getFullYear() ||
        date.getMonth() !== today.getMonth()
      )
        return;

      // dayOfMonth: 1–31
      const dayOfMonth = date.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      // Split days into 4 buckets evenly
      const weekSize = Math.ceil(daysInMonth / 4);
      index = Math.min(3, Math.floor((dayOfMonth - 1) / weekSize));
    } 
    
    else if (mode === "hourly") {
      const today = new Date();
      if (
        date.getFullYear() !== today.getFullYear() ||
        date.getMonth() !== today.getMonth() ||
        date.getDate() !== today.getDate()
      )
        return;

      index = Math.floor(date.getHours() / 2); // 12 buckets for 24 hours
    }

    if (index >= 0 && index < buckets.length) {
      buckets[index]++;
    }
  });

  return buckets;
}
