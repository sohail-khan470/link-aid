import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaAddressCard, FaShieldAlt, FaTruck, FaUserAlt } from "react-icons/fa";
import { db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";
type RoleCounts = {
  totalUsers: number | null;
  totalInsurer: number | null;
  civilian: number | null;
  insurer: number | null;
  towing_company: number | null;
};

export default function EcommerceMetrics() {
  const [counts, setCounts] = useState<RoleCounts>({
    totalUsers: null,
    totalInsurer: null,
    civilian: null,
    insurer: null,
    towing_company: null,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const roles = ["civilian", "towing_company"];
      const results: Partial<RoleCounts> = {};

      // Total users
      const allUsersSnap = await getDocs(collection(db, "users"));
      results.totalUsers = allUsersSnap.size;

      // Total Insurers
      const insurerCounts = await getDocs(collection(db, "insurance_company"));
      results.totalInsurer = insurerCounts.size;

      // Role-specific counts
      for (const role of roles) {
        const q = query(collection(db, "users"), where("role", "==", role));
        const snapshot = await getDocs(q);
        results[role as keyof RoleCounts] = snapshot.size;
      }

      setCounts((prev) => ({
        ...prev,
        ...results,
      }));
    };

    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      <MetricCard
        icon={
          <FaAddressCard className="text-gray-800 size-6 dark:text-white/90" />
        }
        label="Total"
        value={
          counts.totalUsers !== null && counts.totalInsurer !== null
            ? counts.totalUsers + counts.totalInsurer
            : null
        }
      />
      <MetricCard
        icon={<FaUserAlt className="text-gray-800 size-6 dark:text-white/90" />}
        label="Total Civilians"
        value={counts.civilian}
      />
      <MetricCard
        icon={
          <FaShieldAlt className="text-gray-800 size-6 dark:text-white/90" />
        }
        label="Total Insurers"
        value={counts.totalInsurer}
      />
      <MetricCard
        icon={<FaTruck className="text-gray-800 size-6 dark:text-white/90" />}
        label="Towing Companies"
        value={counts.towing_company}
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
