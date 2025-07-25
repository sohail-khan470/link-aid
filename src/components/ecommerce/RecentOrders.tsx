import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import { format } from "date-fns";

interface Claim {
  id: string;
  category: string;
  description: string;
  status: "submitted" | "assigned" | "resolved" | "rejected";
  submittedAt: Timestamp;
}

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "secondary"
  | "danger"
  | "gray"; // custom fallback color

export default function RecentClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "claims"),
          orderBy("submittedAt", "desc"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const fetched: Claim[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Claim[];
        setClaims(fetched);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "resolved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "gray"; // defined fallback in your BadgeProps
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Claims
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Submitted At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="py-3 text-gray-800 dark:text-white/90">
                    {claim.category}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[240px] truncate">
                    {claim.description}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(claim.status)}>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {claim.submittedAt
                      ? format(claim.submittedAt.toDate(), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
