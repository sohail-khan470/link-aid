import { useState, useEffect, useMemo } from "react";
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
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { useOperators } from "../../hooks/useOperators";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Save, X, Pencil, Search, Filter, RotateCcw } from "lucide-react";
import Pagination from "../ui/Pagination";

const ROWS_PER_PAGE = 6;

export default function TowRequestsTable() {
  const { requests, loading, error, refetch } = useTowRequests();

  console.log("object", requests);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [role, setRole] = useState<string>("");
  const allowedRoles = ["towing_company", "insurer"];

  // Filters
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      const user = getAuth().currentUser;
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setRole(snap.data().role);
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "warning";
      case "accepted":
        return "info";
      case "pending":
        return "primary";
      case "resolved":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "error";
    }
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setEditData({
      status: r.status,
      vehicleType: r.vehicleType,
      etaMinutes: r.etaMinutes ?? "",
      notes: r.notes ?? "",
      assignedOperatorId: r.matchedOperatorId ?? "",
    });
  };

  const handleSave = async (id: string) => {
    const updates: any = {
      status: editData.status,
      vehicleType: editData.vehicleType,
      etaMinutes: editData.etaMinutes ? Number(editData.etaMinutes) : null,
      notes: editData.notes,
      matchedOperatorId: editData.assignedOperatorId || null,
    };
    if (currentUser?.uid) updates.companyId = currentUser.uid;
    await updateDoc(doc(db, "tow_requests", id), updates);

    if (currentUser) {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const userData = snap.exists() ? snap.data() : null;
      if (userData && userData.role !== "super_admin") {
        await addDoc(collection(db, "actions_log"), {
          userId: currentUser.uid,
          userName: userData.fullName ?? "Unknown",
          role: userData.role,
          action: "Update Tow Request",
          description: `${
            userData.fullName ?? "User"
          } updated tow request (ID: ${id})`,
          timestamp: serverTimestamp(),
        });
      }
    }
    setEditingId(null);
    refetch();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

const filtered = useMemo(() => {
  // Sort requests by timestamp descending (latest first)
  const sortedRequests = [...requests].sort((a, b) => {
    const timeA = a.timestamp?.toDate()?.getTime() || 0;
    const timeB = b.timestamp?.toDate()?.getTime() || 0;
    return timeB - timeA;
  });

  return sortedRequests.filter(
    (r) =>
      r.civilianName.toLowerCase().includes(searchName.toLowerCase()) &&
      (searchRole ? r.role === searchRole : true) &&
      (searchStatus ? r.status === searchStatus : true)
  );
}, [requests, searchName, searchRole, searchStatus]);


  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

  const resetFilters = () => {
    setSearchName("");
    setSearchRole("");
    setSearchStatus("");
    setCurrentPage(1);
  };

  return (
    <ComponentCard title="Tow Requests">
      {/* 🔎 Filters */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by civilian name"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <select
            value={searchRole}
            onChange={(e) => {
              setSearchRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
          >
            <option value="">All Roles</option>
            {Array.from(new Set(requests.map((r) => r.role))).map((rl) => (
              <option key={rl} value={rl}>
                {rl}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <select
            value={searchStatus}
            onChange={(e) => {
              setSearchStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring focus:ring-blue-300/40 transition"
          >
            <option value="">All Statuses</option>
            {Array.from(new Set(requests.map((r) => r.status))).map((st) => (
              <option key={st} value={st}>
                {st.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-lg shadow transition"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
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
            No Tow Requests Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting filters or check back later for updates.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  {[
                    "Civilian",
                    "Vehicle Type",
                    "Status",
                    "Tow Operator",
                    "ETA (min)",
                    "Notes",
                    "Requested At",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                    >
                      {h}
                    </TableCell>
                  ))}
                  {allowedRoles.includes(role) && (
                    <TableCell
                      isHeader
                      className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.map((r) => {
                  const isEditing = editingId === r.id;
                  return (
                    <TableRow
                      key={r.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
                    >
                      {/* Civilian & Role */}
                      <TableCell className="px-6 py-4">
                        <div>
                          <span className="block font-medium text-gray-900 dark:text-gray-100">
                            {r.civilianName}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {r.role}
                          </span>
                        </div>
                      </TableCell>

                      {/* Vehicle Type */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.vehicleType}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                vehicleType: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {r.vehicleType}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editData.status}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                          >
                            {[
                              "requested",
                              "accepted",
                              "pending",
                              "resolved",
                              "cancelled",
                            ].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge color={getStatusColor(r.status)}>
                            {r.status.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Operator */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <OperatorDropdown
                            value={editData.assignedOperatorId}
                            onChange={(id) =>
                              setEditData({
                                ...editData,
                                assignedOperatorId: id,
                              })
                            }
                            companyId={currentUser?.uid}
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {r.operatorName || "-"}
                          </span>
                        )}
                      </TableCell>

                      {/* ETA */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.etaMinutes}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                etaMinutes: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {r.etaMinutes || "-"}
                          </span>
                        )}
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <textarea
                            value={editData.notes}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                notes: e.target.value,
                              })
                            }
                            rows={1}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">
                            {r.notes || "-"}
                          </span>
                        )}
                      </TableCell>

                      {/* Requested At */}
                      <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {r.timestamp?.toDate().toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) || "-"}
                      </TableCell>

                      {/* Actions */}
                      {allowedRoles.includes(role) && (
                        <TableCell className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(r.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            r.status !== "accepted" &&
                            r.status !== "resolved" && (
                              <button
                                onClick={() => handleEdit(r)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={16} />
                              </button>
                            )
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 text-center text-red-500 dark:text-red-400 text-sm font-medium">
          {error}
        </p>
      )}
    </ComponentCard>
  );
}

function OperatorDropdown({
  value,
  onChange,
  companyId,
}: {
  value: string;
  onChange: (id: string) => void;
  companyId?: string;
}) {
  const { operators, loading } = useOperators(companyId);
  if (loading)
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Loading operators...
      </span>
    );
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
    >
      <option value="">Not Assigned</option>
      {operators.map((op) => (
        <option key={op.id} value={op.id}>
          {op.fullName}
        </option>
      ))}
    </select>
  );
}
