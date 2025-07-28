import { useState, useMemo } from "react";
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
import Pagination from "../ui/Pagination";
import type { BadgeColor } from "../ui/badge/Badge"; // ✅ Adjust path if needed

const ROWS_PER_PAGE = 8;

export default function IncidentsReportsTable() {
  const { incidents, loading, error } = useIncidents();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "submitted":
        return "info"; // Or "primary"
      case "request_tow":
      case "tow_requested":
        return "danger"; // Use this instead of "error"
      case "on_the_way":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "gray"; // Fallback color
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
    } catch {
      return "-";
    }
  };

  const renderLocation = (
    location?:
      | { latitude?: number; longitude?: number }
      | GeoPoint
      | { lat: number; lng: number }
  ) => {
    if (!location) return "N/A";
    try {
      let lat, lng;
      if ("lat" in location && "lng" in location) {
        lat = location.lat;
        lng = location.lng;
      } else {
        lat = location.latitude ?? (location as GeoPoint)?.latitude;
        lng = location.longitude ?? (location as GeoPoint)?.longitude;
      }
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
    } catch {
      return "N/A";
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const emailMatch = incident.userEmail
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const statusMatch = statusFilter
        ? incident.status?.toLowerCase() === statusFilter.toLowerCase()
        : true;
      const locationMatch = locationFilter
        ? JSON.stringify(incident.location)
            .toLowerCase()
            .includes(locationFilter.toLowerCase())
        : true;

      return emailMatch && statusMatch && locationMatch;
    });
  }, [incidents, search, statusFilter, locationFilter]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredIncidents.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredIncidents, page]);

  const totalPages = Math.ceil(filteredIncidents.length / ROWS_PER_PAGE);

  return (
    <ComponentCard title="Incident Reports">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="tow_requested">Tow Requested</option>
          <option value="request_tow">Request Tow</option>
          <option value="on_the_way">On The Way</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          type="text"
          placeholder="Search by location..."
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m2 8H7a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No Incident Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting filters or check back later for updates.
          </p>
          <button
            onClick={() => {
              setLocationFilter("");
              setStatusFilter("");
              setSearch("");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
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
                {paginatedIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {incident.userEmail || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {incident.category || "Uncategorized"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={getStatusColor(incident.status || "unknown")}
                      >
                        {incident.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {formatDate(incident.submittedAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 dark:text-gray-200">
                      {renderLocation(incident.location)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {error && (
        <p className="mt-4 text-center text-red-500 dark:text-red-400 text-sm font-medium">
          {error}
        </p>
      )}
    </ComponentCard>
  );
}
