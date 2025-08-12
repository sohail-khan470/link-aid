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
import {
  AlertTriangle,
  Loader,
  Pencil,
  Save,
  ShieldCheck,
  Trash,
  X,
} from "lucide-react";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import CustomAlert from "../ui/alert/CustomAlert";

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
    setUserData,
    updateStaffRole,
    companyId,
  } = useStaffAssignment();

  const [selectedRole, setSelectedRole] = useState("insurer");
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("insurer");
  const [editVerified, setEditVerified] = useState<boolean>(false);

  //  Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Assignment condition helpers
  const isSameCompany = userData?.companyId === companyId;
  const isOtherCompany =
    userData?.companyId && userData.companyId !== companyId;
  const canAssign = !userData?.companyId || userData.companyId === "";

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
        {userData && (
          <div className="border rounded-xl bg-white dark:bg-white/5 dark:border-white/10 p-6 mb-6 shadow-sm transition-all">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} />
              Civilian Details
              <button
                onClick={() => setUserData(null)}
                className="ml-auto bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 transition"
              >
                <X size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Full Name:</span>{" "}
                {userData.fullName || "N/A"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {userData.phone || "N/A"}
              </p>
              <p>
                <span className="font-medium">Current Role:</span>{" "}
                {userData.role}
              </p>
              <p>
                <span className="font-medium">Verified:</span>{" "}
                {userData.isVerified ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">No</span>
                )}
              </p>
            </div>

            {/* Assignment section */}
            {isSameCompany && (
              <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-300 text-green-800 px-4 py-2 rounded-lg dark:bg-green-900/10 dark:text-green-300/80">
                Already assigned to your company.
              </div>
            )}

            {isOtherCompany && (
              <div className="mt-5 flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg  dark:bg-yellow-900/10 dark:text-yellow-300/80">
                <AlertTriangle size={18} />
                Already assigned to another company. Assignment disabled.
              </div>
            )}

            {canAssign && (
              <div className="mt-5">
                <label className="block mb-1 font-medium">Assign Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-white/10 dark:border-white/20 dark:text-white"
                >
                  <option value="insurer">Insurer</option>
                  <option value="unassigned">Unassigned</option>
                </select>
                <button
                  onClick={() => assignRoleAndCompany(selectedRole)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                >
                  Assign to Company
                </button>
              </div>
            )}
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
                      className="px-5 py-4 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {staffList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7} // spans across all columns
                      className="py-12"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <Loader
                            className=" animate-[spin_3s_linear_infinite] mb-4"
                            size={24}
                          />
                          <h3 className="text-lg font-semibold">
                            No Staff Members Found
                          </h3>
                          <p className="text-sm mt-1 text-center max-w-sm">
                            Try searching for a civilian by email to assign them
                            as a staff member.
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                    >
                      <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400 text-">
                        {staff.fullName}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {editRowId === staff.id ? (
                          <select
                            className="border p-1 rounded dark:border-gray-600"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option
                              value="insurer"
                              className="dark:bg-gray-800"
                            >
                              Insurer
                            </option>
                            <option
                              value="unassigned"
                              className="dark:bg-gray-800"
                            >
                              Unassigned
                            </option>
                          </select>
                        ) : (
                          <Badge
                            color={
                              staff?.role == "insurer" ? "info" : "warning"
                            }
                          >
                            {staff?.role}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {editRowId === staff.id ? (
                          <select
                            className="border p-1 rounded dark:border-gray-600"
                            value={editVerified ? "true" : "false"}
                            onChange={(e) =>
                              setEditVerified(e.target.value === "true")
                            }
                          >
                            <option value="true" className="dark:bg-gray-800">
                              Verified
                            </option>
                            <option value="false" className="dark:bg-gray-800">
                              Unverified
                            </option>
                          </select>
                        ) : (
                          <Badge
                            color={staff.isVerified ? "success" : "warning"}
                          >
                            {staff.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.email}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.createdAt?.toDate
                          ? staff.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {staff.updatedAt?.toDate
                          ? staff.updatedAt.toDate().toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : staff.createdAt?.toDate
                          ? staff.createdAt.toDate().toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "N/A"}
                      </TableCell>

                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-3 items-center">
                          {editRowId === staff.id ? (
                            <>
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

                          <button
                            onClick={() => {
                              setDeleteTargetId(staff.id);
                              setAlertOpen(true);
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

      {/* 🔔 Confirm Delete Modal */}
      <CustomAlert
        isOpen={alertOpen}
        title="Are you sure?"
        text="You won't be able to revert this!"
        icon="warning"
        confirmText="Yes, delete it!"
        cancelText="Cancel"
        showCancel
        onConfirm={() => {
          if (deleteTargetId) deleteStaff(deleteTargetId);
          setAlertOpen(false);
          setSuccessOpen(true);
        }}
        onCancel={() => setAlertOpen(false)}
      />

      {/*   Deleted Success Modal */}
      <CustomAlert
        isOpen={successOpen}
        title="Deleted!"
        text="User has been removed."
        icon="success"
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setSuccessOpen(false)}
      />
    </ComponentCard>
  );
}
