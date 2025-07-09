import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { FiAlertCircle, FiClock, FiCalendar } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageMeta from "../../../components/common/PageMeta";
import CountryMap from "../../../components/ecommerce/CountryMap";

interface Incident {
  id: string;
  vehicle?: string;
  timestamp: Timestamp | Date;
  location?: {
    lat: number;
    lng: number;
  };
  // Add other incident properties as needed
}

const COLORS = {
  light: {
    background: "bg-white",
    card: "bg-white border-gray-100",
    textPrimary: "text-gray-800",
    textSecondary: "text-gray-500",
    hover: "hover:bg-gray-50",
    chartAxis: "#6b7280",
    barFill: "#3B82F6",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  dark: {
    background: "dark:bg-gray-900",
    card: "dark:bg-gray-800 dark:border-gray-700",
    textPrimary: "dark:text-white",
    textSecondary: "dark:text-gray-400",
    hover: "dark:hover:bg-gray-700/50",
    chartAxis: "#9CA3AF",
    barFill: "#60A5FA",
    iconBg: "dark:bg-blue-900/30",
    iconColor: "dark:text-blue-400",
  },
};

const IncidentsAnalytics = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = getFirestore();

  console.log(incidents);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "incidentReports"));
        const incidentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Incident[];
        setIncidents(incidentsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch incidents");
        console.error("Error fetching incidents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [db]);

  // Get incidents by time of day
  const getTimeOfDayData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      label: `${i}:00 - ${i + 1}:00`,
    }));

    incidents.forEach((incident) => {
      try {
        const timestamp =
          incident.timestamp instanceof Timestamp
            ? incident.timestamp.toDate()
            : new Date(incident.timestamp);

        if (!isNaN(timestamp.getTime())) {
          const hour = timestamp.getHours();
          if (hour >= 0 && hour <= 23) {
            hours[hour].count++;
          }
        }
      } catch (error) {
        console.error("Error processing timestamp:", error);
      }
    });

    return hours;
  };

  const incidentMarkers = incidents
    .filter((i) => i.location?.lat && i.location?.lng)
    .map((incident) => ({
      latLng: [incident.location?.lat, incident.location?.lng],
      name: incident.vehicle || "Unknown vehicle",
    }));

  // Get recent incidents
  const getRecentIncidents = (limit = 10) => {
    return [...incidents]
      .sort((a, b) => {
        const dateA =
          a.timestamp instanceof Timestamp
            ? a.timestamp.toDate()
            : new Date(a.timestamp);
        const dateB =
          b.timestamp instanceof Timestamp
            ? b.timestamp.toDate()
            : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  };

  if (loading && !incidents.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${COLORS.light.background} ${COLORS.dark.background}`}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-red-500 dark:text-red-400 ${COLORS.light.background} ${COLORS.dark.background}`}
      >
        {error}
      </div>
    );
  }

  const timeData = getTimeOfDayData();
  const recentIncidents = getRecentIncidents();

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${COLORS.light.background} ${COLORS.dark.background}`}
    >
      <PageMeta
        title="Incident Analytics"
        description="Overview of reported incidents"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1
            className={`text-3xl font-light mb-2 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
          >
            Incident Analytics
          </h1>
          <p
            className={
              COLORS.light.textSecondary + " " + COLORS.dark.textSecondary
            }
          >
            Overview of reported incidents
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div
            className={`p-6 rounded-xl shadow-sm border ${COLORS.light.card} ${COLORS.dark.card}`}
          >
            <div className="flex items-center mb-4">
              <div
                className={`p-3 rounded-full mr-4 ${COLORS.light.iconBg} ${COLORS.dark.iconBg}`}
              >
                <FiAlertCircle
                  className={`text-xl ${COLORS.light.iconColor} ${COLORS.dark.iconColor}`}
                />
              </div>
              <div>
                <h3
                  className={`text-sm font-medium ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                >
                  Total Incidents
                </h3>
                <p
                  className={`text-3xl font-light ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                >
                  {incidents.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl shadow-sm border ${COLORS.light.card} ${COLORS.dark.card}`}
          >
            <div className="flex items-center mb-4">
              <div
                className={`p-3 rounded-full mr-4 bg-green-100 dark:bg-green-900/30`}
              >
                <FiClock className="text-xl text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3
                  className={`text-sm font-medium ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                >
                  Today's Incidents
                </h3>
                <p
                  className={`text-3xl font-light ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                >
                  {
                    incidents.filter((incident) => {
                      const today = new Date();
                      const incidentDate =
                        incident.timestamp instanceof Timestamp
                          ? incident.timestamp.toDate()
                          : new Date(incident.timestamp);
                      return (
                        incidentDate.getDate() === today.getDate() &&
                        incidentDate.getMonth() === today.getMonth() &&
                        incidentDate.getFullYear() === today.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Distribution Chart */}
        <div
          className={`p-6 rounded-xl shadow-sm border mb-12 ${COLORS.light.card} ${COLORS.dark.card}`}
        >
          <h2
            className={`text-xl font-light mb-6 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
          >
            Incident Frequency by Hour
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                  tick={{ fill: COLORS.light.chartAxis }}
                />
                <YAxis tick={{ fill: COLORS.light.chartAxis }} />
                <Tooltip
                  formatter={(value) => [`${value} incidents`, "Count"]}
                  labelFormatter={(label) =>
                    `${label}:00 - ${Number(label) + 1}:00`
                  }
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={COLORS.light.barFill}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents */}
        <div
          className={`p-6 rounded-xl shadow-sm border ${COLORS.light.card} ${COLORS.dark.card}`}
        >
          <h2
            className={`text-xl font-light mb-6 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
          >
            Recent Incidents
          </h2>
          <div className="space-y-4">
            {recentIncidents.map((incident, index) => {
              const incidentDate =
                incident.timestamp instanceof Timestamp
                  ? incident.timestamp.toDate()
                  : new Date(incident.timestamp);

              return (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-lg transition-colors ${COLORS.light.hover} ${COLORS.dark.hover}`}
                >
                  <div
                    className={`p-2 rounded-full mr-4 mt-1 ${COLORS.light.iconBg} ${COLORS.dark.iconBg}`}
                  >
                    <FiCalendar
                      className={
                        COLORS.light.iconColor + " " + COLORS.dark.iconColor
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-medium ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                      >
                        {incident.vehicle || "Unknown vehicle"} incident
                      </h3>
                      <span
                        className={`text-sm ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                      >
                        {incidentDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                    >
                      {incidentDate.toLocaleDateString()}
                    </p>
                    {incident.location && (
                      <p
                        className={`text-sm mt-1 ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                      >
                        Location:{" "}
                        <a
                          href={`https://www.google.com/maps?q=${incident.location.lat},${incident.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline dark:text-blue-400"
                        >
                          {incident.location.lat}, {incident.location.lng}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Map View */}
            <div
              className={`p-6 rounded-xl shadow-sm border mb-12 ${COLORS.light.card} ${COLORS.dark.card}`}
            >
              <h2
                className={`text-xl font-light mb-6 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
              >
                Global Incident Map
              </h2>
              <div style={{ height: "500px", width: "100%" }}>
                <CountryMap mapColor="#E5E7EB" markers={incidentMarkers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentsAnalytics;
