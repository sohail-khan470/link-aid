import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { useRegistrationStatsByRole } from "../../hooks/useUserRegistrationStats";
import LoadingSpinner from "../ui/LoadingSpinner";
import { LucideAreaChart } from "lucide-react";

type Mode = "hourly" | "weekly" | "monthly";

export default function StatisticsChart() {
  const [mode, setMode] = useState<Mode>("monthly");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears] = useState<number[]>([2022, 2023, 2024, 2025]);

  const { data: chartData, loading } = useRegistrationStatsByRole(
    mode,
    selectedYear
  );

  const categories =
    mode === "monthly"
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
      : mode === "weekly"
      ? ["Week 1", "Week 2", "Week 3", "Week 4"]
      : Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);

  const hasData = chartData.some((series) =>
    series.data.some((val) => val > 0)
  );

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    colors: ["#465FFF", "#00B8D9", "#925FE2", "#E48A2C", "#DB2777", "#10B981"], // Add colors for more roles
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    legend: {
      show: false,
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val) => Math.floor(val).toString(),
      },
      forceNiceScale: true,
      decimalsInFloat: 0,
    },
    tooltip: { x: { show: true } },
  };

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg flex gap-2 font-semibold text-gray-800 dark:text-white/90">
            Registration by Role
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              ({mode.charAt(0).toUpperCase() + mode.slice(1)} Data)
            </p>
          </h3>
        </div>

        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab
            value={mode}
            onChange={(val) => setMode(val)}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={(val) => setSelectedYear(val)}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {hasData ? (
            <Chart
              options={options}
              series={chartData} // ✅ Show all roles
              type="area"
              height={310}
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-[310px] text-center text-gray-400 dark:text-gray-500">
              <LucideAreaChart className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600 animate-bounce" />
              <h4 className="text-base font-semibold">No registration data</h4>
              <p className="text-sm mt-1 max-w-xs">
                There's no data available for the selected role, time range, or
                year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
