import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { ShieldCheck, Truck } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

type RoleCounts = {
  tow_requests: number | null;
  tow_operator: number | null;
};

export default function TowCompanyMetrics() {
  const [counts, setCounts] = useState<RoleCounts>({
    tow_requests: null,
    tow_operator: null,
  });

  useEffect(() => {
    const fetchCompanyCounts = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is logged in.");
        return;
      }

      const companyId = user.uid;
      try {
        const towRequestQuery = query(
          collection(db, "tow_requests"),
          where("companyId", "==", companyId)
        );
        const towRequestSnap = await getDocs(towRequestQuery);

        const towOperatorQuery = query(
          collection(db, "towing_operators"),
          where("companyId", "==", companyId)
        );
        const towOperatorSnap = await getDocs(towOperatorQuery);

        setCounts({
          tow_requests: towRequestSnap.size,
          tow_operator: towOperatorSnap.size,
        });
      } catch (error) {
        console.error("Error fetching company-specific data:", error);
      }
    };

    fetchCompanyCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      <MetricCard
        icon={
          <ShieldCheck className="text-gray-800 size-6 dark:text-white/90" />
        }
        label="Tow Requests"
        value={counts.tow_requests}
      />
      <MetricCard
        icon={<Truck className="text-gray-800 size-6 dark:text-white/90" />}
        label="Tow Operator"
        value={counts.tow_operator}
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="truncate text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value !== null ? value : <LoadingSpinner size={24} />}
          </h4>
        </div>
      </div>
    </div>
  );
}
