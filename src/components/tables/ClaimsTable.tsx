import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { useClaims } from "../../hooks/useClaims";
import ComponentCard from "../common/ComponentCard";

export default function ClaimsTable() {
  const { claims, loading, error } = useClaims();

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "warning";
      case "under_review":
        return "info";
      case "resolved":
        return "success";
      default:
        return "error";
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading claims...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ComponentCard title="List of Claims">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  AI Suggestion
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Insurer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Submitted
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {claim.userName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          Civilian
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {claim.category}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {claim.aiSuggestion}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {claim.insurerName}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    <Badge size="sm" color={getBadgeColor(claim.status)}>
                      {claim.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {claim.submittedAt?.toDate
                      ? claim.submittedAt.toDate().toLocaleDateString()
                      : "-"}
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
