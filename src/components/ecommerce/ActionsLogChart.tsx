import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ActivityIcon } from "lucide-react";
import { useActionsLogStats } from "../../hooks/useActionsLogStats";

type Mode = "hourly" | "weekly" | "monthly";

export default function ActionsLogChart() {
  const [mode, setMode] = useState<Mode>("hourly");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears] = useState<number[]>([2022, 2023, 2024, 2025]);

  const { data: chartData, loading } = useActionsLogStats(mode, selectedYear);

  // ✅ Generate categories dynamically based on mode
  const now = new Date();
  let categories: string[] = [];

  if (mode === "hourly") {
    // 24 hours for today
    categories = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
  } else if (mode === "weekly") {
    // Current week days (Sun → Sat)
    categories = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  } else if (mode === "monthly") {
    // Days of current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    categories = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  }

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
    colors: ["#465FFF", "#00B8D9", "#925FE2", "#E48A2C", "#DB2777", "#10B981"],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.6,
        opacityFrom: 0.55,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
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
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
        rotate: -45,
      },
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
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg flex gap-2 font-semibold text-gray-800 dark:text-white/90">
            Actions Log
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

      {/* Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {hasData ? (
            <Chart
              options={options}
              series={chartData}
              type="area"
              height={310}
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-[310px] text-center text-gray-400 dark:text-gray-500">
              <ActivityIcon className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
              <h4 className="text-base font-semibold">No actions log data</h4>
              <p className="text-sm mt-1 max-w-xs">
                There's no data available for the selected filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
