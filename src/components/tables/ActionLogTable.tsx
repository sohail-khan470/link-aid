import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../common/ComponentCard";
import { useActionsLog } from "../../hooks/useActionsLogs";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ActionsLogTable() {
  const { logs, loading, error } = useActionsLog();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "civilian":
        return "info";
      case "insurer":
        return "warning";
      case "responder":
        return "primary";
      case "towing_company":
        return "success";
      case "super_admin":
        return "error";
      default:
        return "dark";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <ComponentCard title="Activity Log (Actions)">
      {loading ? (
        <p className="text-center py-6 text-gray-500 dark:text-gray-400">
          Loading logs...
        </p>
      ) : error ? (
        <p className="text-center py-6 text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      User
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      Role
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      Action
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      Time
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.05] transition"
                    >
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.userName || "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <Badge size="sm" color={getRoleColor(log.role)}>
                          {log.role || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.action}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.description || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.timestamp.toDate().toLocaleString() || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 px-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded disabled:opacity-50 dark:text-white"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded disabled:opacity-50 dark:text-white"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </ComponentCard>
  );
}
