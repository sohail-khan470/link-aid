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
import { useState, useMemo } from "react";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Search, Filter, RotateCcw } from "lucide-react";

export default function ActionsLogTable() {
  const { logs, loading, error } = useActionsLog();
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

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
      default:
        return "dark";
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesRole = roleFilter ? log.role === roleFilter : true;
      const matchesUser = userFilter
        ? log.userName?.toLowerCase().includes(userFilter.toLowerCase())
        : true;
      const matchesAction = actionFilter
        ? log.action?.toLowerCase().includes(actionFilter.toLowerCase())
        : true;

      return matchesRole && matchesUser && matchesAction;
    });
  }, [logs, roleFilter, userFilter, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setRoleFilter("");
    setActionFilter("");
    setUserFilter("");
  };

  return (
    <ComponentCard title="Action Logs">
      {/* 🔎 Filters Section */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user name"
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="insurer">Insurer</option>
            <option value="towing_company">Towing Company</option>
            <option value="responder">Responder</option>
            <option value="civilian">Civilian</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            {[...new Set(logs.map((log) => log.action))].map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-lg shadow transition"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* 🔄 Table Rendering */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size={40} />
        </div>
      ) : error ? (
        <p className="text-center py-6 text-red-500">{error}</p>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
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
            No Actions Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting filters or check back later for updates.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">
                        {log.userName || "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={getRoleColor(log.role)}>
                          {log.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.action}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.description || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {log.timestamp.toDate().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 📌 Pagination */}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </ComponentCard>
  );
}
