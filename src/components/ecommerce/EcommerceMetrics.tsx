import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaShieldAlt, FaTruck, FaUserAlt, FaUserTie } from "react-icons/fa";
import { db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";

type RoleCounts = {
  civilian: number | null;
  tow_operator: number | null;
  totalInsurer: number | null;
  totalTowCompanies: number | null;
};

export default function EcommerceMetrics() {
  const [counts, setCounts] = useState<RoleCounts>({
    civilian: null,
    tow_operator: null,
    totalInsurer: null,
    totalTowCompanies: null,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const results: Partial<RoleCounts> = {};

        // Civilian count
        const civilianQuery = query(
          collection(db, "users"),
          where("role", "==", "civilian")
        );
        const civilianSnap = await getDocs(civilianQuery);
        results.civilian = civilianSnap.size;

        // Tow Operator count
        const towOperatorQuery = query(
          collection(db, "users"),
          where("role", "==", "tow_operator")
        );
        const towOperatorSnap = await getDocs(towOperatorQuery);
        results.tow_operator = towOperatorSnap.size;

        // Total Insurer Companies
        const insurersSnap = await getDocs(collection(db, "insurance_company"));
        results.totalInsurer = insurersSnap.size;

        // Total Towing Companies
        const towCompaniesSnap = await getDocs(
          collection(db, "towing_companies")
        );
        results.totalTowCompanies = towCompaniesSnap.size;

        setCounts((prev) => ({ ...prev, ...results }));
      } catch (error) {
        console.error("Dashboard role count error:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <MetricCard
        icon={<FaUserAlt className="text-gray-800 size-6 dark:text-white/90" />}
        label="Civilians"
        value={counts.civilian}
        pingColor="bg-blue-500"
      />
      <MetricCard
        icon={<FaUserTie className="text-gray-800 size-6 dark:text-white/90" />}
        label="Tow Operators"
        value={counts.tow_operator}
        pingColor="bg-purple-500"
      />
      <MetricCard
        icon={
          <FaShieldAlt className="text-gray-800 size-6 dark:text-white/90" />
        }
        label="Insurer Companies"
        value={counts.totalInsurer}
        pingColor="bg-yellow-500"
      />
      <MetricCard
        icon={<FaTruck className="text-gray-800 size-6 dark:text-white/90" />}
        label="Towing Companies"
        value={counts.totalTowCompanies}
        pingColor="bg-purple-500"
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  pingColor = "bg-red-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  pingColor?: string;
}) {
  return (
    <div className="relative group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Ping indicator */}
      <span
        className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full opacity-0 group-hover:opacity-75 group-hover:animate-ping ${pingColor}`}
      ></span>
      <span
        className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full opacity-0 group-hover:opacity-50 ${pingColor}`}
      ></span>

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
