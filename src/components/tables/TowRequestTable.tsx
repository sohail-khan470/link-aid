// src/components/tables/TowRequestsTable.tsx

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
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { useOperators } from "../../hooks/useOperators";

export default function TowRequestsTable() {
  const { requests, loading, error, refetch } = useTowRequests();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  console.log("Requests:", requests);

  // Get current user from Firebase Auth
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

      // Add companyId if not already present
      if (currentUser?.uid) {
        updates.companyId = currentUser.uid;
      }

      await updateDoc(doc(db, "tow_requests", requestId), updates);
      setEditingId(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading tow requests...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ComponentCard title="Tow Requests">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Civilian
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Vehicle Type
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
                  Tow Operator
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  ETA (min)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Notes
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Requested At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  Actions
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
                    {editingId === r.id ? (
                      <input
                        type="text"
                        value={editData.vehicleType}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            vehicleType: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      r.vehicleType
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {editingId === r.id ? (
                      <select
                        value={editData.status}
                        onChange={(e) =>
                          setEditData({ ...editData, status: e.target.value })
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="requested">Requested</option>
                        <option value="accepted">Accepted</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    ) : (
                      <Badge size="sm" color={getStatusColor(r.status)}>
                        {r.status.replace("_", " ")}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    {editingId === r.id ? (
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
                      r.operatorName
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {editingId === r.id ? (
                      <input
                        type="number"
                        value={editData.etaMinutes}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            etaMinutes: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 border rounded text-sm"
                        placeholder="ETA"
                      />
                    ) : (
                      r.etaMinutes ?? "-"
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {editingId === r.id ? (
                      <textarea
                        value={editData.notes}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={2}
                        placeholder="Notes"
                      />
                    ) : (
                      r.notes || "-"
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {r.createdAtFormatted ?? "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    {editingId === r.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(r.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    )}
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

// Operator Dropdown Component
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
    return <span className="text-sm text-gray-500">Loading operators...</span>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 border rounded text-sm min-w-32"
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
