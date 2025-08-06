import { useState, useMemo } from "react";
import ComponentCard from "../common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Loader, Pencil, Save, Trash, X, Search } from "lucide-react";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import CustomAlert from "../ui/alert/CustomAlert";
import { useInsurancePolicy } from "../../hooks/useInsurancePolicy";
import Pagination from "../ui/Pagination";

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
    <ComponentCard title="Insurance Policies">
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-200"
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

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by email..."
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/*  Policies Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white  dark:border-white/[0.05] dark:bg-gray-900">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  {[
                    "Policy Number",
                    "User Email",
                    "Coverages",
                    "Status",
                    "Registered Date",
                    "Actions",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-6 py-4 text-start text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                    >
                      {heading}
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
                            Try adjusting filters or add new policies.
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((policy, index) => (
                    <TableRow
                      key={policy.id}
                      className={`transition ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                        {policy.policyNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {policy.userEmail}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {policy.coverage?.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {policy.coverage.map((c: any, idx: number) => (
                              <li key={idx} className="leading-5">
                                <span className="font-semibold">{c.title}</span>{" "}
                                – {c.amount}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-gray-400">N/A</span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {editRowId === policy.id ? (
                          <select
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm 
                 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {policy.regDate?.toDate
                          ? policy.regDate
                              .toDate()
                              .toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                          : "N/A"}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          {editRowId === policy.id ? (
                            <>
                              <button
                                onClick={() => {
                                  updatePolicy(policy.id, {
                                    status: editStatus,
                                  });
                                  setEditRowId(null);
                                }}
                                className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 transition"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditRowId(null)}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditRowId(policy.id);
                                setEditStatus(policy.status);
                              }}
                              className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setDeleteTargetId(policy.id);
                              setAlertOpen(true);
                            }}
                            className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                            title="Delete"
                          >
                            <Trash size={16} />
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

        {/*  Pagination */}
        {filteredPolicies.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <CustomAlert
        isOpen={alertOpen}
        title="Are you sure?"
        text="You won't be able to revert this!"
        icon="warning"
        confirmText="Yes, delete it!"
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
