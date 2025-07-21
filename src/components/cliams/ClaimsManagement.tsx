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

export default function ClaimsManagement() {
  const { claims, loading, error } = useClaims();

  return (
    <ComponentCard title="Claims">
      {loading ? (
        <div className="p-4 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : claims.length === 0 ? (
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          No claims found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "S:No",
                    "User ID",
                    "Category",
                    "Description",
                    "Status",
                    "Submitted At",
                    "Images",
                    "Assigned Insurer",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {claims.map((claim, index) => (
                  <TableRow
                    key={claim.id}
                    className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                  >
                    <TableCell className="py-3 px-5">{index + 1}</TableCell>
                    <TableCell className="py-3 px-5">{claim.userId}</TableCell>
                    <TableCell className="py-3 px-5">
                      {claim.category}
                    </TableCell>
                    <TableCell className="py-3 px-5 truncate max-w-xs">
                      {claim.description}
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <Badge
                        color={claim.status === "open" ? "success" : "warning"}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      {claim.updatedAt?.toDate()?.toLocaleString() ?? "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      {claim.images.length} image(s)
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      {claim.assignedInsurerId ?? "Unassigned"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {error && (
        <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
      )}
    </ComponentCard>
  );
}
