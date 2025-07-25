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
      case "super_admin":
        return "error";
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

  return (
    <ComponentCard title="Action Logs List">
      {/* 🔎 Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search by user name"
          className="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="insurer">Insurer</option>
          <option value="towing_company">Towing Company</option>
          <option value="responder">Responder</option>
          <option value="civilian">Civilian</option>
        </select>

        <select
          className="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
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

      {/* 🔄 Table Rendering */}
      {loading ? (
        <p className="text-center py-6 text-gray-500 dark:text-gray-300">
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
                      className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 text-start"
                      isHeader
                    >
                      User
                    </TableCell>
                    <TableCell
                      className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 text-start"
                      isHeader
                    >
                      Role
                    </TableCell>
                    <TableCell
                      className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 text-start"
                      isHeader
                    >
                      Action
                    </TableCell>
                    <TableCell
                      className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 text-start"
                      isHeader
                    >
                      Description
                    </TableCell>
                    <TableCell
                      className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 text-start"
                      isHeader
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
                          {log.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.action}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.description || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {log.timestamp.toDate().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </ComponentCard>
  );
}
