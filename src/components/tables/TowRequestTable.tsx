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
import {
  doc,
  updateDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { useOperators } from "../../hooks/useOperators";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Save, X, Pencil } from "lucide-react";
import Pagination from "../ui/Pagination";

const ROWS_PER_PAGE = 6;

export default function TowRequestsTable() {
  const { requests, loading, error, refetch } = useTowRequests();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [role, setRole] = useState<string>("");
  const allowedRoles = ["towing_company", "insurer"];

  // Filters and pagination state
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Load auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load current user role
  useEffect(() => {
    (async () => {
      const user = getAuth().currentUser;
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setRole(snap.data().role);
    })();
  }, []);

  // Map status to badge color
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
      default:
        return "error";
    }
  };

  // Handlers for editing
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

    // Log action
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

  // Apply filters
  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.civilianName.toLowerCase().includes(searchName.toLowerCase()) &&
          (searchRole ? r.role === searchRole : true) &&
          (searchStatus ? r.status === searchStatus : true)
      ),
    [requests, searchName, searchRole, searchStatus]
  );

  // Pagination slice
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

  return (
    <ComponentCard title="Tow Requests">
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search name..."
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
        />
        <select
          value={searchRole}
          onChange={(e) => {
            setSearchRole(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Roles</option>
          {Array.from(new Set(requests.map((r) => r.role))).map((rl) => (
            <option key={rl} value={rl}>
              {rl}
            </option>
          ))}
        </select>
        <select
          value={searchStatus}
          onChange={(e) => {
            setSearchStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Statuses</option>
          {Array.from(new Set(requests.map((r) => r.status))).map((st) => (
            <option key={st} value={st}>
              {st.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-600 dark:text-gray-300 text-lg">
          No tow requests found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table className="w-full text-sm">
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

              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map((r) => {
                  const isEditing = editingId === r.id;
                  return (
                    <TableRow
                      key={r.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                    >
                      {/* Civilian & role */}
                      <TableCell className="px-6 py-4">
                        <div>
                          <span className="block font-medium text-gray-900 dark:text-gray-100">
                            {r.civilianName}
                          </span>
                          <span className="block text-gray-500 dark:text-gray-400 text-xs">
                            {r.role}
                          </span>
                        </div>
                      </TableCell>
                      {/* Vehicle Type */}
                      <TableCell className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            name="vehicleType"
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
                            name="status"
                            value={editData.status}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
                          >
                            <option value="requested">Requested</option>
                            <option value="accepted">Accepted</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
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
                            name="etaMinutes"
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
                            name="notes"
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
                      <TableCell className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-100">
                          {r.requestedAt
                            ?.toDate()
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }) || "-"}
                        </span>
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
                            <button
                              onClick={() => handleEdit(r)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
