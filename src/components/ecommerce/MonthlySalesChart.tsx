import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";

type Mode = "hourly" | "weekly" | "monthly";

export default function MonthlyRegistrationsChart() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [dataCounts, setDataCounts] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      let counts: number[] = [];

      if (mode === "monthly") {
        counts = Array(12).fill(0); // Jan–Dec
      } else if (mode === "weekly") {
        counts = Array(7).fill(0); // Sun–Sat
      } else if (mode === "hourly") {
        counts = Array(12).fill(0); // 12 slots: 12AM, 2AM, ..., 10PM
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt: Timestamp = data.createdAt;

        if (createdAt?.toDate) {
          const date = createdAt.toDate();

          if (mode === "monthly") {
            const month = date.getMonth();
            counts[month]++;
          } else if (mode === "weekly") {
            const day = date.getDay(); // 0-6
            counts[day]++;
          } else if (mode === "hourly") {
            const hour = date.getHours(); // 0-23
            const index = Math.floor(hour / 2); // 12 slots
            if (index < 12) counts[index]++;
          }
        }
      });

      setDataCounts(counts);
    };

    fetchData();
  }, [mode]);

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
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val} users` },
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          User Registrations
        </h3>
        <div className="relative inline-block">
          {["hourly", "weekly", "monthly"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as Mode)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
