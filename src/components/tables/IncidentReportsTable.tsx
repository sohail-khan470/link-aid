import { useIncidents } from "../../hooks/useIncidents";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ComponentCard from "../common/ComponentCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import Badge from "../ui/badge/Badge";
import { GeoPoint, Timestamp } from "firebase/firestore";

export default function IncidentsReportsTable() {
  const { incidents, loading, error } = useIncidents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "light";
      case "tow_requested":
      case "request_tow":
        return "error";
      case "on_the_way":
        return "info";
      case "resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDate = (timestamp?: Timestamp | Date | null): string => {
    if (!timestamp) return "-";

    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "-";
    }
  };

  const renderLocation = (
    location?: { latitude?: number; longitude?: number } | GeoPoint
  ) => {
    if (!location) return "N/A";

    try {
      const lat = location.latitude ?? (location as GeoPoint)?.latitude;
      const lng = location.longitude ?? (location as GeoPoint)?.longitude;

      if (lat == null || lng == null) return "N/A";

      return (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline dark:text-blue-400"
        >
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </a>
      );
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <>
      <ComponentCard title="Incident Reports">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-300 text-lg">
            No incidents found.
          </div>
        ) : (
          <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  {[
                    "User",
                    "Category",
                    "Status",
                    "Submitted At",
                    "Location",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {incidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                  >
                    <TableCell className="px-6 py-4">
                      <div>
                        <span className="block font-medium text-gray-900 dark:text-gray-100">
                          {incident.userEmail || "Unknown"}
                        </span>
                        {/* <span className="block text-gray-500 dark:text-gray-400 text-xs">
                          {incident?.userId || "Unknown ID"}
                        </span> */}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {incident.category || "Uncategorized"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={getStatusColor(incident.status || "unknown")}
                      >
                        {incident.status
                          ? String(incident.status).replace("_", " ")
                          : "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {formatDate(incident.submittedAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {renderLocation(incident.location)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-red-500 dark:text-red-400 text-sm font-medium">
            {error}
          </p>
        )}
      </ComponentCard>
    </>
  );
}
