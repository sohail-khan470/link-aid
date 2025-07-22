// src/components/tables/TowRequestsTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../common/ComponentCard";
import { useTowRequests } from "../../hooks/useTowRequests";

export default function TowRequestsTable() {
  const { requests, loading, error } = useTowRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "warning";
      case "matched":
        return "info";
      case "en_route":
        return "primary";
      case "completed":
        return "success";
      default:
        return "error";
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading tow requests...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ComponentCard title="Tow Requests">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Civilian
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Vehicle Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Tow Operator
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  ETA (min)
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Requested At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {r.civilianName}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        Civilian
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {r.vehicleType}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    <Badge size="sm" color={getStatusColor(r.status)}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {r.operatorName}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {r.etaMinutes ?? "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {r.createdAtFormatted ?? "-"}
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
