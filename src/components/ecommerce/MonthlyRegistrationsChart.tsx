import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import ChartTab from "../common/ChartTab";
import LoadingSpinner from "../ui/LoadingSpinner";
import { db } from "../../../firebase";
import { useEffect, useState } from "react";

type Mode = "hourly" | "weekly" | "monthly";

export default function MonthlyRegistrationsChart() {
  const currentYear = new Date().getFullYear();
  const [mode, setMode] = useState<Mode>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dataCounts, setDataCounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const yearsSet = new Set<number>();

      const counts: number[] = Array(mode === "weekly" ? 7 : 12).fill(0);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const role = data.role;
        const createdAt: Timestamp | undefined = data.createdAt;

        // ✅ Skip if no createdAt or if role is super_admin
        if (!createdAt?.toDate || role === "super_admin") return;

        const date = createdAt.toDate();
        const year = date.getFullYear();
        yearsSet.add(year);

        if (mode === "monthly" && year === selectedYear) {
          const month = date.getMonth(); // 0 = Jan
          counts[month]++;
        }

        if (mode === "weekly" && year === selectedYear) {
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          if (date >= startOfWeek && date <= endOfWeek) {
            const day = date.getDay(); // 0 = Sun
            counts[day]++;
          }
        }

        if (
          mode === "hourly" &&
          year === selectedYear &&
          date.toDateString() === now.toDateString()
        ) {
          const hour = date.getHours();
          const index = Math.floor(hour / 2);
          if (index < 12) counts[index]++;
        }
      });

      const years = Array.from(yearsSet).sort((a, b) => b - a);
      setAvailableYears(years);

      if (!years.includes(selectedYear)) {
        setSelectedYear(years[0] || currentYear);
      }

      setDataCounts(counts);
      setLoading(false);
    };

    fetchData();
  }, [mode, selectedYear]);

  const getXAxisCategories = () => {
    if (mode === "monthly") {
      return [
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
      ];
    } else if (mode === "weekly") {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else {
      return [
        "12AM",
        "2AM",
        "4AM",
        "6AM",
        "8AM",
        "10AM",
        "12PM",
        "2PM",
        "4PM",
        "6PM",
        "8PM",
        "10PM",
      ];
    }
  };

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: getXAxisCategories(),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    yaxis: {
      labels: { formatter: (val) => Math.floor(val).toString() },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: true },
      y: {
        formatter: (val: number) => `${val} user${val !== 1 ? "s" : ""}`,
      },
    },
  };

  const series = [
    {
      name: "Registrations",
      data: dataCounts,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg flex gap-2 font-semibold text-gray-800 dark:text-white/90">
            Users Registration
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              ({mode.charAt(0).toUpperCase() + mode.slice(1)} Data)
            </p>
          </h3>
        </div>
        <ChartTab
          value={mode}
          onChange={setMode}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      <div className="">
        {loading ? (
          <div className="flex justify-center items-center h-44">
            <LoadingSpinner size={48} />
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
              <Chart
                options={options}
                series={series}
                type="bar"
                height={180}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
