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
import type { BadgeColor } from "../ui/badge/Badge";
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  User,
  FileText,
  Calendar,
  Hash,
  Bot,
  X,
} from "lucide-react";
import { Modal } from "../ui/modal";

const ROWS_PER_PAGE = 10;

export default function ClaimsTable() {
  const { claims, loading, error } = useClaims();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "resolved":
        return "success";
      case "submitted":
        return "warning";
      case "pending":
        return "info";
      default:
        return "error";
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
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, category, or status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            aria-label="filter through status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            aria-label="filter through role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="civilian">Civilian</option>
            <option value="insurer">Insurer</option>
            <option value="responder">Responder</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No Claims Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting filters or check back later for updates.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <RotateCcw size={16} /> Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  {[
                    "Claim #",
                    "Name",
                    "Category",
                    "Status",
                    "Assigned Staff",
                    "Action",
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
                    <TableCell className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {claim.claimNumber || `C-${claim.id.slice(0, 5)}`}
                    </TableCell>

                    <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                      {claim?.fullName.toLocaleUpperCase() || "Unknown"}
                    </TableCell>
                    <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                      {claim?.category || "N/A"}
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <Badge color={getStatusColor(claim.status || "unknown")}>
                        {claim.status || "Unknown"}
                      </Badge>
                    </TableCell>

                                        <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                      {claim?.assignedInsurerId || "N/A"}
                    </TableCell>

                    {/* <TableCell className="px-6 py-4">
                      <Badge
                        color={
                          claim?.role === "civilian"
                            ? "success"
                            : claim?.role === "insurer"
                            ? "warning"
                            : "info"
                        }
                      >
                        {claim?.role || "N/A"}
                      </Badge>
                    </TableCell> */}

                    <TableCell className="px-6 py-4">
                      <button
                        aria-label="f"
                        onClick={() => setSelectedClaim(claim)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                      >
                        <Eye size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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

      {/* Modal for claim details */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)}>
        {selectedClaim && (
          <div
            className="relative bg-white dark:bg-gray-800 
                    w-full h-full sm:max-w-lg sm:h-auto sm:rounded-2xl
                    shadow-xl p-6 sm:p-8 overflow-y-auto max-h-[100vh] sm:max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              aria-label="c"
              onClick={() => setSelectedClaim(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X size={22} />
            </button>

            {/* Header */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  Claim Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive view of this claim record
                </p>
              </div>
              {/* Status Badge */}
              <Badge
                color={
                  selectedClaim.status === "resolved"
                    ? "success"
                    : selectedClaim.status === "pending"
                    ? "info"
                    : selectedClaim.status === "submitted"
                    ? "warning"
                    : "error"
                }
              >
                {selectedClaim.status || "Unknown"}
              </Badge>
            </div>

            {/* Claim Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-3">
                <Hash size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Claim Number
                  </p>
                  <p className="font-medium break-words">
                    {selectedClaim.claimNumber ||
                      `C-${selectedClaim.id.slice(0, 6)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted By
                  </p>
                  <p className="font-medium">
                    {selectedClaim.fullName || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <p className="font-medium">
                    {selectedClaim.category || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bot size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI Suggestion
                  </p>
                  <p className="font-medium break-words">
                    {selectedClaim.aiSuggestion || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted At
                  </p>
                  <p className="font-medium">
                    {selectedClaim.submittedAt?.toDate
                      ? selectedClaim.submittedAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last Updated
                  </p>
                  <p className="font-medium">
                    {selectedClaim.updatedAt?.toDate
                      ? selectedClaim.updatedAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedClaim.role === "civilian"
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                        : selectedClaim.role === "insurer"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                    }`}
                  >
                    {selectedClaim.role || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 ">
                <User size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assigned To
                  </p>
                  <p className="font-medium">
                    {selectedClaim.assignedInsurerId || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Description
                  </p>
                  <p className="font-medium break-words">
                    {selectedClaim.description || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ComponentCard>
  );
}
