import { useState } from "react";
import { useStaffAssignment } from "../../hooks/useCompanyUserAssignment";
import ComponentCard from "../common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pencil, Save, Trash, X } from "lucide-react";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import Swal from "sweetalert2";

export default function InsuranceStaffManagement() {
  const {
    searchEmail,
    setSearchEmail,
    loading,
    userData,
    fetchUserByEmail,
    assignRoleAndCompany,
    staffList,
    deleteStaff,
    updateStaffRole,
  } = useStaffAssignment();

  const [selectedRole, setSelectedRole] = useState("driver");
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("driver");
  const [editVerified, setEditVerified] = useState<boolean>(false);

  return (
    <ComponentCard
      title="Staff List"
      button={
        <div className="flex gap-2 items-center ">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter civilian email"
            className="border p-2 flex-1 rounded dark:text-white  dark:border-gray-600"
          />
          <button
            onClick={fetchUserByEmail}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      }
    >
      <div className="p-4">
        {/* 👤 Found User Details */}
        {userData && (
          <div className="border rounded-xl bg-white dark:bg-white/5 dark:border-white/10 p-6 mb-6 shadow-sm transition-all">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Civilian Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Full Name:
                </span>{" "}
                {userData.fullName || "N/A"}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Email:
                </span>{" "}
                {userData.email}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Phone:
                </span>{" "}
                {userData.phone || "N/A"}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Current Role:
                </span>{" "}
                {userData.role}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Verified:
                </span>{" "}
                {userData.isVerified ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">No</span>
                )}
              </p>
            </div>

            <div className="mt-5">
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Assign New Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border rounded dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                <option value="driver" className="dark:bg-gray-700">
                  Driver
                </option>
                <option value="dispatcher" className="dark:bg-gray-700">
                  Dispatcher
                </option>
              </select>

              <button
                onClick={() => assignRoleAndCompany(selectedRole)}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
              >
                Assign to Company
              </button>
            </div>
          </div>
        )}

        {/* 📋 Staff Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Name",
                    "Role",
                    "Verified",
                    "Email",
                    "Created At",
                    "Updated At",
                    "Actions",
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
                {staffList.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-4 text-gray-500">
                      {loading ? <LoadingSpinner /> : <p>No data found</p>}
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                    >
                      <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                        {staff.fullName}
                      </TableCell>

                      {/* Role column (editable) */}
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {editRowId === staff.id ? (
                          <select
                            className="border p-1 rounded  dark:border-gray-600"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option
                              value="driver"
                              className="dark:bg-gray-800 "
                            >
                              Driver
                            </option>
                            <option
                              value="dispatcher"
                              className="dark:bg-gray-800 "
                            >
                              Dispatcher
                            </option>
                          </select>
                        ) : (
                          staff.role
                        )}
                      </TableCell>

                      {/* Verified */}

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {editRowId === staff.id ? (
                          <select
                            className="border p-1 rounded  dark:border-gray-600"
                            value={editVerified ? "true" : "false"}
                            onChange={(e) =>
                              setEditVerified(e.target.value === "true")
                            }
                          >
                            <option value="true" className="dark:bg-gray-800">
                              Verified
                            </option>
                            <option value="false" className="dark:bg-gray-800">
                              Not Verified
                            </option>
                          </select>
                        ) : (
                          <Badge
                            color={staff.isVerified ? "success" : "warning"}
                          >
                            {staff.isVerified ? "Verified" : "Not Verified"}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.email}
                      </TableCell>

                      {/* CreatedAt */}
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.createdAt?.toDate
                          ? staff.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </TableCell>

                      {/* UpdatedAt */}
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.updatedAt?.toDate
                          ? staff.updatedAt.toDate().toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true, // 24-hour format
                            })
                          : staff.createdAt}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-3 items-center">
                          {editRowId === staff.id ? (
                            <>
                              {/* ✅ Save */}
                              <button
                                title="Save"
                                onClick={() => {
                                  updateStaffRole(
                                    staff.id,
                                    editRole,
                                    editVerified
                                  );
                                  setEditRowId(null);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save size={16} />
                              </button>

                              {/* Cancel */}
                              <button
                                title="Cancel"
                                onClick={() => setEditRowId(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditRowId(staff.id);
                                  setEditRole(staff.role);
                                  setEditVerified(staff.isVerified);
                                }}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={16} />
                              </button>
                            </>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "You won't be able to revert this!",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Yes, delete it!",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteStaff(staff.id);
                                  Swal.fire(
                                    "Deleted!",
                                    "User has been removed.",
                                    "success"
                                  );
                                }
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
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
      </div>
    </ComponentCard>
  );
}
