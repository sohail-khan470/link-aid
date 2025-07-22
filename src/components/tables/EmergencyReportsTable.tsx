// src/components/tables/EmergencyReportsTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../common/ComponentCard";
import useEmergencyReports from "../../hooks/useEmergencyReports";

export default function EmergencyReportsTable() {
  const { reports, loading, error } = useEmergencyReports();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "info";
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading reports...</p>;
  if (error)
    return <p className="text-center text-red-500">{error}</p>;

  return (
    <ComponentCard title="Emergency Reports">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Responder
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Priority
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Summary
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Location
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Reported At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {report.responderName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          Responder
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    <Badge size="sm" color={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {report.summary || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {report.location
                      ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`
                      : "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {report.createdAtFormatted || "-"}
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
