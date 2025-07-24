import { useState, useEffect } from "react";
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

export default function TowRequestsTable() {
  const { requests, loading, error, refetch } = useTowRequests();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [role, setRole] = useState<string>("");
  const allowedRoles = ["towing_company", "insurer"];

  console.log(role);


  useEffect(() => {
    const fetchUserRole = async () => {
      const currentUser = getAuth().currentUser;

      if (!currentUser?.uid) return;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userRole = userData.role; // assuming 'role' exists
        setRole(userRole);
      } else {
        console.log("No user found");
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
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
      default:
        return "error";
    }
  };

  const handleEdit = (request: any) => {
    setEditingId(request.id);
    setEditData({
      status: request.status,
      vehicleType: request.vehicleType,
      etaMinutes: request.etaMinutes || "",
      notes: request.notes || "",
      assignedOperatorId: request.matchedOperatorId || "",
    });
  };

  const handleSave = async (requestId: string) => {
    try {
      const updates: any = {
        status: editData.status,
        vehicleType: editData.vehicleType,
        etaMinutes: editData.etaMinutes ? Number(editData.etaMinutes) : null,
        notes: editData.notes,
        matchedOperatorId: editData.assignedOperatorId || null,
      };

      if (currentUser?.uid) {
        updates.companyId = currentUser.uid;
      }

      await updateDoc(doc(db, "tow_requests", requestId), updates);

      // ✅ Log action
      if (currentUser) {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (userData && userData.role !== "super_admin") {
          await addDoc(collection(db, "actions_log"), {
            userId: currentUser.uid,
            userName: userData.fullName ?? "Unknown",
            role: userData.role ?? "unknown",
            action: "Update Tow Request",
            description: `${
              userData.fullName ?? "User"
            } updated a tow request (ID: ${requestId}).`,
            timestamp: serverTimestamp(),
          });
        }
      }

      setEditingId(null);
      refetch();
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <ComponentCard title="Tow Requests">
      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center text-gray-600 dark:text-gray-300 text-lg">
          No tow requests found.
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    isHeader
                    className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                  >
                    {heading}
                  </TableCell>
                ))}

                {/* ✅ Conditionally render the "Actions" column header */}
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
              {requests.map((r) => {
                const isEditing = editingId === r.id;
                return (
                  <TableRow
                    key={r.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                  >
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {r.vehicleType}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="status"
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({ ...editData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <OperatorDropdown
                          value={editData.assignedOperatorId}
                          onChange={(operatorId) =>
                            setEditData({
                              ...editData,
                              assignedOperatorId: operatorId,
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ETA"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {r.etaMinutes || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <textarea
                          name="notes"
                          value={editData.notes}
                          onChange={(e) =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          className="resize-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={1}
                          placeholder="Notes"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {r.notes || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-900 dark:text-gray-100">
                        {r.requestedAt?.toDate().toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) || "-"}
                      </span>
                    </TableCell>
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
  onChange: (operatorId: string) => void;
  companyId?: string;
}) {
  const { operators, loading } = useOperators(companyId);

  if (loading) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Loading operators...
      </span>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
