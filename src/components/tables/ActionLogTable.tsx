// src/components/tables/ActionsLogTable.tsx

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

export default function ActionsLogTable() {
  const { logs, loading, error } = useActionsLog();

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
        return "error";
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 ">Loading logs...</p>;
  if (error) return <p className="text-center text-red-500 ">{error}</p>;

  return (
    <ComponentCard title="Activity Log (Actions)">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500  dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 "
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 "
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 "
                >
                  Time
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {log.userName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    <Badge size="sm" color={getRoleColor(log.role)}>
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {log.action}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {log.description}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300  ">
                    {log.timestampFormatted}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ComponentCard>
  );
}
