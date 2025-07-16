import { useEffect, useState } from "react";

import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase";

type Mode = "hourly" | "weekly" | "monthly";

export function useRegistrationStatsByRole(mode: Mode, selectedYear: number) {
  const [data, setData] = useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      query(collection(db, "users")),
      (snapshot) => {
        const users = snapshot.docs.map((doc) => doc.data());
        handleData(users, insuranceCompanies);
      }
    );

    let insuranceCompanies: any[] = [];
    const unsubscribeInsurance = onSnapshot(
      query(collection(db, "insurance_company")),
      (snapshot) => {
        insuranceCompanies = snapshot.docs.map((doc) => doc.data());
        handleData(userDocs, insuranceCompanies);
      }
    );

    let userDocs: any[] = [];
    function handleData(users: any[], insuranceCompanies: any[]) {
      userDocs = users;

      const civilians = users.filter((u) => u.role === "civilian");
      const towing = users.filter((u) => u.role === "towing_company");

      const groupedCivilians = groupByTime(civilians, mode, selectedYear);
      const groupedTowing = groupByTime(towing, mode, selectedYear);
      const groupedInsurance = groupByTime(
        insuranceCompanies,
        mode,
        selectedYear
      );

      setData([
        { name: "Civilian", data: groupedCivilians },
        { name: "Towing Company", data: groupedTowing },
        { name: "Insurance Company", data: groupedInsurance },
      ]);
      setLoading(false);
    }

    return () => {
      unsubscribeUsers();
      unsubscribeInsurance();
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
        date.getFullYear() !== year || // ✅ fixed here
        date.toDateString() !== today.toDateString()
      )
        return;

      index = Math.floor(date.getHours() / 2); // 2-hour buckets (0-2, ..., 22-24)
    }

    buckets[index]++;
  });

  return buckets;
}
