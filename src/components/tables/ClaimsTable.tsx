import { useState, useMemo } from "react";
import { useClaims } from "../../hooks/useClaims";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import ComponentCard from "../common/ComponentCard";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import Pagination from "../ui/Pagination";
import type { BadgeColor } from "../ui/badge/Badge"; // adjust if needed

const ROWS_PER_PAGE = 10;

export default function ClaimsTable() {
  const { claims, loading, error } = useClaims();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "resolved":
        return "success";
      case "submitted":
        return "warning";
      case "pending":
        return "info";
      default:
        return "gray";
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const searchMatch = search
        ? claim.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          claim.category?.toLowerCase().includes(search.toLowerCase()) ||
          claim.status?.toLowerCase().includes(search.toLowerCase())
        : true;

      const statusMatch = statusFilter
        ? claim.status?.toLowerCase() === statusFilter.toLowerCase()
        : true;

      const roleMatch = roleFilter
        ? claim.role?.toLowerCase() === roleFilter.toLowerCase()
        : true;

      return searchMatch && statusMatch && roleMatch;
    });
  }, [claims, search, statusFilter, roleFilter]);

  const paginatedClaims = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredClaims.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredClaims, page]);

  const totalPages = Math.ceil(filteredClaims.length / ROWS_PER_PAGE);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRoleFilter("");
    setPage(1);
  };

  return (
    <ComponentCard title="Claims List">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search by name, category, or status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white flex-1"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white flex-1"
          >
            <option value="">All Roles</option>
            <option value="civilian">Civilian</option>
            <option value="insurer">Insurer</option>
            <option value="responder">Responder</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : filteredClaims.length === 0 ? (
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
            No Claims Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting filters or check back later for updates.
          </p>
          <button
            onClick={resetFilters}
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
                    "Claim #",
                    "Name",
                    "Category",
                    "Description",
                    "Status",
                    "Assigned To",
                    "AI Suggestion",
                    "Submitted At",
                    "Updated At",
                    "Role",
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
                {paginatedClaims.map((claim) => (
                  <TableRow
                    key={claim.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                  >
                    {/* Claim # */}
                    <TableCell className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {claim.claimNumber ||
                        `C-${claim.submittedAt
                          ?.toDate()
                          .toISOString()
                          .slice(0, 10)
                          .replace(/-/g, "")}-${claim.id.slice(0, 5)}`}
                    </TableCell>

                    {/* User Name */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {claim?.fullName
                        ? claim.fullName.charAt(0).toUpperCase() +
                          claim.fullName.slice(1)
                        : "Unknown"}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {claim?.category || "N/A"}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {claim?.description || "N/A"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      <Badge color={getStatusColor(claim.status || "unknown")}>
                        {claim.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {claim.assignedInsurerId || "Unassigned"}
                    </TableCell>

                    {/* AI Suggestion */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200 truncate max-w-xs">
                      {claim.aiSuggestion || "N/A"}
                    </TableCell>

                    {/* Submitted At */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {claim.submittedAt?.toDate
                        ? claim.submittedAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    {/* Updated At */}
                    <TableCell className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {claim.updatedAt?.toDate
                        ? claim.updatedAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={
                          claim?.role === "civilian"
                            ? "success"
                            : claim?.role === "insurer"
                            ? "warning"
                            : "gray"
                        }
                      >
                        {claim?.role || "N/A"}
                      </Badge>
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
