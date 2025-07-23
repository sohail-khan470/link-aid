import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function MonthlyTarget() {
  const [series, setSeries] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const labels = ["Civilians", "Insurer", "Tow Company", "Responders"];
  const roles = ["civilian", "insurer", "towing_company", "responder"];
  const colors = ["#465FFF", "#465FFFCC", "#465FFFAA", "#465FFF88"];

  useEffect(() => {
    const fetchRoleData = async () => {
      setLoading(true);

      // Step 1: Count users for specific roles
      const roleCounts = await Promise.all(
        roles.map(async (role) => {
          const q = query(collection(db, "users"), where("role", "==", role));
          const snap = await getDocs(q);
          return snap.size;
        })
      );

      const totalRelevantUsers = roleCounts.reduce(
        (sum, count) => sum + count,
        0
      );

      const percentages = roleCounts.map((count) =>
        totalRelevantUsers > 0
          ? Number(((count / totalRelevantUsers) * 100).toFixed(2))
          : 0
      );

      setSeries(percentages);
      setLoading(false);
    };

    fetchRoleData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 330,
      fontFamily: "Outfit, sans-serif",
    },
    colors,
    labels,
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: "14px" },
          value: {
            fontSize: "16px",
            formatter: (val) => `${val}%`,
          },
          total: {
            show: true,
            label: "Total",
            formatter: () => `${series.reduce((a, b) => a + b, 0).toFixed(0)}%`,
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "14px",
      labels: { colors: "#6B7280" },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              User Role Distribution
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              How users are distributed by roles
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size={48} />
            </div>
          ) : (
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          )}
        </div>
      </div>
    </div>
  );
}
