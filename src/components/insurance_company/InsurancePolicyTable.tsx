import { useState, useMemo } from "react";
import ComponentCard from "../common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Loader,
  Pencil,
  Save,
  Trash,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import CustomAlert from "../ui/alert/CustomAlert";
import { useInsurancePolicy } from "../../hooks/useInsurancePolicy";
import Pagination from "../ui/Pagination";
import { format } from "date-fns";

export default function InsurancePolicyTable() {
  const { loading, policyList, updatePolicy, deletePolicy } =
    useInsurancePolicy();

  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("pending");

  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchEmail, setSearchEmail] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Apply filters & sorting
  const filteredPolicies = useMemo(() => {
    let data = [...policyList];

    // Always sort newest first
    data.sort((a, b) => {
      const dateA = a.updatedAt?.toDate
        ? a.updatedAt.toDate()
        : a.regDate?.toDate?.() ?? new Date(0);
      const dateB = b.updatedAt?.toDate
        ? b.updatedAt.toDate()
        : b.regDate?.toDate?.() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    if (statusFilter !== "all") {
      data = data.filter((p) => p.status === statusFilter);
    }

    if (searchEmail.trim()) {
      data = data.filter((p) =>
        p.userEmail.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    return data;
  }, [policyList, statusFilter, searchEmail]);

  const totalPages = Math.ceil(filteredPolicies.length / pageSize);
  const paginatedData = filteredPolicies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <ComponentCard
      title="Insurance Policy Management"
      button={
        <div className="flex gap-2">
          {/* Status Filter */}
          <div className="relative w-full sm:w-48">
            <select
              className="block w-full pl-3 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-fit">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              className="block w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-100 dark:border-green-900">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Active Policies
            </div>
            <div className="text-2xl font-semibold text-green-900 dark:text-green-100">
              {policyList.filter((p) => p.status === "active").length}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Pending Review
            </div>
            <div className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
              {policyList.filter((p) => p.status === "pending").length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-100 dark:border-red-900">
            <div className="text-sm font-medium text-red-800 dark:text-red-200">
              Rejected
            </div>
            <div className="text-2xl font-semibold text-red-900 dark:text-red-100">
              {policyList.filter((p) => p.status === "rejected").length}
            </div>
          </div>
        </div>

        {/* Policies Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  {[
                    { label: "Policy Number", width: "w-32" },
                    { label: "User Email", width: "w-64" },
                    { label: "Coverages", width: "w-48" },
                    { label: "Status", width: "w-28" },
                    { label: "Registered Date", width: "w-36" },
                    { label: "Actions", width: "w-24" },
                  ].map(({ label, width }) => (
                    <TableCell
                      key={label}
                      isHeader
                      className={`px-6 py-4 text-start text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide ${width}`}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16">
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <Loader className="animate-spin mb-3" size={28} />
                          <h3 className="text-lg font-semibold">
                            No Policies Found
                          </h3>
                          <p className="text-sm mt-2 text-center max-w-sm">
                            Try adjusting your filters or add new policies.
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((policy) => (
                    <TableRow
                      key={policy.id}
                      className="transition hover:bg-blue-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                        <div className="font-mono font-semibold">
                          {policy.policyNumber}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {policy.userEmail}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {policy.coverage?.length > 0 ? (
                          <ul className="space-y-1">
                            {policy.coverage.map((c: any, idx: number) => (
                              <li key={idx} className="text-sm leading-5">
                                <span className="font-medium">{c.title}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(Number(c.amount))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm italic text-gray-400">
                            No coverages
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {editRowId === policy.id ? (
                          <select
                            className="block w-full pl-3 pr-8 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <div className="relative inline-block">
                            <Badge
                              color={
                                policy.status === "active"
                                  ? "success"
                                  : policy.status === "pending"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {policy.status.charAt(0).toUpperCase() +
                                policy.status.slice(1)}
                            </Badge>

                            {policy.status === "active" && (
                              <span className="absolute -top-1 -right-1 flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-90"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {policy.regDate?.toDate ? (
                          <span className="cursor-default">
                            {format(policy.regDate.toDate(), "MMM d, yyyy")}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          {editRowId === policy.id ? (
                            <>
                              <button
                                onClick={() => {
                                  updatePolicy(policy.id, {
                                    status: editStatus,
                                  });
                                  setEditRowId(null);
                                }}
                                className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 transition hover:scale-105"
                              >
                                <Save size={18} />
                              </button>

                              <button
                                onClick={() => setEditRowId(null)}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition hover:scale-105"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditRowId(policy.id);
                                setEditStatus(policy.status);
                              }}
                              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 transition hover:scale-105"
                            >
                              <Pencil size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setDeleteTargetId(policy.id);
                              setAlertOpen(true);
                            }}
                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 transition hover:scale-105"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination and Summary */}
        {filteredPolicies.length > 0 && pageSize > 5 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Confirm Delete Modal */}
      <CustomAlert
        isOpen={alertOpen}
        title="Delete Policy Confirmation"
        text="This action will permanently delete the policy. Are you sure you want to proceed?"
        icon="warning"
        confirmText="Delete Policy"
        cancelText="Cancel"
        showCancel
        onConfirm={() => {
          if (deleteTargetId) deletePolicy(deleteTargetId);
          setAlertOpen(false);
        }}
        onCancel={() => setAlertOpen(false)}
      />
    </ComponentCard>
  );
}
