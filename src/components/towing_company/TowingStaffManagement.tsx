import { useState } from "react";
import { useTowingStaffManagement } from "../../hooks/useTowingStaffManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import ComponentCard from "../common/ComponentCard";
import Badge from "../ui/badge/Badge";
import { Operator } from "../../pages/types/Company";
import LoadingSpinner from "../ui/LoadingSpinner";
import UserSearchModal from "./UserSearchModal";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { logAction } from "../../utils/logAction";
import { auth, db } from "../../../firebase";
import { Modal } from "../ui/modal";

export default function TowingStaffManagement() {
  const { company, operators, loading, error, updateOperator, refreshData } =
    useTowingStaffManagement();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(
    null
  );
  const [editData, setEditData] = useState<Partial<Operator>>({});

  const handleUserAssigned = async () => {
    await refreshData();
    setIsSearchModalOpen(false);
  };

  const handleOperatorUpdate = async () => {
    if (!editingOperatorId) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const currentUserName = currentUserData?.fullName ?? "Unknown";
      const currentUserRole = currentUserData?.role ?? "unknown";

      let companyName = "Unknown Company";
      if (company?.id) {
        const companySnap = await getDoc(doc(db, "towing_company", company.id));
        if (companySnap.exists()) {
          companyName = companySnap.data()?.companyName ?? "Unknown Company";
        }
      }

      const operator = operators.find((op) => op.id === editingOperatorId);

      await updateOperator(editingOperatorId, editData);
      await refreshData();
      setEditingOperatorId(null);
      setEditData({});

      // Log action after update
      await logAction({
        userId: currentUser.uid,
        userName: currentUserName,
        role: currentUserRole,
        action: "Update Tow Operator",
        description: `Updated ${operator?.fullName ?? "operator"}'s role to ${
          editData.role
        } and verification to ${editData.isVerified} in company`,
      });
    } catch (err: any) {
      console.error("Error updating operator:", err);
      alert(err.message || "Failed to update operator. Please try again.");
    }
  };

  const formatLocation = (location?: [string, string] | null): string => {
    if (!location || !Array.isArray(location)) return "Location not set";
    return `${location[0] || "-"}, ${location[1] || "-"}`;
  };

  const handleEditClick = (operator: Operator) => {
    setEditingOperatorId(operator.id!);
    setEditData({
      fullName: operator.fullName || "",
      email: operator.email || "",
      location: operator.location || ["", ""],
      status: operator.status ?? true,
      isVerified: operator.isVerified ?? false,
      role: operator.role || "tow_operator",
    });
  };

  const handleCancelEdit = () => {
    setEditingOperatorId(null);
    setEditData({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "locationLat" || name === "locationLng") {
      const index = name === "locationLat" ? 0 : 1;
      const updatedLocation = [...(editData.location || ["", ""])];
      updatedLocation[index] = value;
      setEditData((prev) => ({
        ...prev,
        location: updatedLocation as [string, string],
      }));
    } else if (name === "status") {
      setEditData((prev) => ({ ...prev, status: value === "true" }));
    } else if (name === "isVerified") {
      setEditData((prev) => ({ ...prev, isVerified: value === "true" }));
    } else if (name === "role") {
      setEditData((prev) => ({ ...prev, role: value }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <ComponentCard
      title={`Manage Tow Operators`}
      button={
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!company}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Search
        </button>
      }
      className="shadow-xl rounded-2xl bg-white dark:bg-gray-800"
    >
      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : operators.length === 0 ? (
        <div className="p-8 text-center text-gray-600 dark:text-gray-300 text-lg">
          No operators found. Search for users to assign as operators.
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <Table className="w-full text-sm">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                {[
                  "S.No",
                  "Name",
                  "Email",
                  "Location",
                  "Status",
                  "Verified",
                  "Role",
                  "Actions",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    isHeader
                    className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {operators.map((operator, index) => {
                const isEditing = editingOperatorId === operator.id;
                return (
                  <TableRow
                    key={operator.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                  >
                    <TableCell className="px-6 py-4">{index + 1}</TableCell>

                    {/* Name */}
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <input
                          name="fullName"
                          value={editData.fullName || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter name"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {operator.fullName}
                        </span>
                      )}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <input
                          name="email"
                          value={editData.email || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter email"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {operator.email || "-"}
                        </span>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="px-6 py-4 space-y-2">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <input
                            name="locationLat"
                            value={(editData.location?.[0] || "").toString()}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Latitude"
                          />
                          <input
                            name="locationLng"
                            value={(editData.location?.[1] || "").toString()}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Longitude"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {formatLocation(operator.location)}
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="status"
                          value={editData.status ? "true" : "false"}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <Badge color={operator.status ? "success" : "warning"}>
                          {operator.status ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Verified */}
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="isVerified"
                          value={editData.isVerified ? "true" : "false"}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="true">Verified</option>
                          <option value="false">Not Verified</option>
                        </select>
                      ) : (
                        <Badge
                          color={operator.isVerified ? "success" : "warning"}
                        >
                          {operator.isVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="role"
                          value={editData.role || "tow_operator"}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="tow_operator">Tow Operator</option>
                          <option value="civilian">Civilian</option>
                        </select>
                      ) : (
                        <Badge
                          color={
                            operator.role === "tow_operator"
                              ? "info"
                              : "secondary"
                          }
                        >
                          {operator.role === "tow_operator"
                            ? "Tow Operator"
                            : "Civilian"}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 items-center justify-center flex">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleOperatorUpdate}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-center ">
                          <button
                            onClick={() => handleEditClick(operator)}
                            className="text-blue-600 hover:text-blue-800 pr-1"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            // onClick={() => handleEditClick(operator)}
                            className="text-red-600 hover:text-red-800 pl-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </TableCell>
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
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      >
        <UserSearchModal
          isOpen
          company={company}
          onUserAssigned={handleUserAssigned}
          onClose={() => setIsSearchModalOpen(false)}
        />
      </Modal>
    </ComponentCard>
  );
}
