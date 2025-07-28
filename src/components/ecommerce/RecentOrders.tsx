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
import { useNavigate } from "react-router-dom";

interface Claim {
  id: string;
  category?: string;
  description?: string;
  status?: "submitted" | "pending" | "resolved" | "rejected";
  submittedAt?: Timestamp;
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
  | "gray";

export default function RecentClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "claims"),
          orderBy("submittedAt", "desc"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const fetched: Claim[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            category: data.category || "N/A",
            description: data.description || "N/A",
            status: data.status || "submitted",
            submittedAt: data.submittedAt || null,
          } as Claim;
        });
        setClaims(fetched);
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError("Failed to load recent claims.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getStatusColor = (status?: string): BadgeColor => {
    switch (status) {
      case "submitted":
        return "warning";
      case "pending":
        return "info";
      case "resolved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "gray";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Claims
        </h3>
        <button
          onClick={() => navigate("/admin/insurance-claims")}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size={40} />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400 text-sm font-medium py-6">
          {error}
        </p>
      ) : claims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 dark:text-gray-500"
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
            No Claims Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try checking back later for updates.
          </p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                {["Category", "Description", "Status", "Submitted At"].map(
                  (heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400 uppercase"
                    >
                      {heading}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {claims.map((claim) => (
                <TableRow
                  key={claim.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.05] transition"
                >
                  <TableCell className="py-3 text-gray-800 dark:text-white/90">
                    {claim.category}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[240px]">
                    <div className="truncate" title={claim.description}>
                      {claim.description}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(claim.status)}>
                      {claim.status
                        ? claim.status.charAt(0).toUpperCase() +
                          claim.status.slice(1)
                        : "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {claim.submittedAt?.toDate
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
