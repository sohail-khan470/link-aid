import { useState } from "react";
import { useHoldersWithPolicies } from "../../hooks/useHoldersWithPolicies";
import ComponentCard from "../common/ComponentCard";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import CustomAlert from "../ui/alert/CustomAlert";
import {
  Users,
  FileText,
  Calendar,
  Search,
  ShieldCheck,
  Mail,
  AlertTriangle,
  X,
} from "lucide-react";

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
};

export default function InsuranceHolderManagement() {
  const {
    holdersWithPolicies,
    loading,
    searchEmail,
    setSearchEmail,
    userData,
    setUserData,
    actionLoading,
    fetchUserByEmail,
    assignHolderToCompany,
  } = useHoldersWithPolicies();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const onConfirmAssign = () => {
    assignHolderToCompany();
    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  return (
    <ComponentCard
      title="Insurance Holders"
      button={
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter civilian email"
            className="border px-3 py-2 rounded-lg flex-1 text-sm dark:text-white dark:border-gray-600"
          />
          <button
            onClick={fetchUserByEmail}
            disabled={actionLoading}
            className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition"
          >
            <Search size={16} />
            {actionLoading ? "Searching..." : "Search"}
          </button>
        </div>
      }
    >
      <div className="p-4">
        {userData && (
          <div className="border rounded-xl bg-white dark:bg-white/5 dark:border-white/10 p-6 mb-6 transition">
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
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Full Name:
                </span>{" "}
                {userData.fullName || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                {userData.email}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Role:
                </span>{" "}
                {userData.role}
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Verified:
                </span>{" "}
                <Badge color={userData.isVerified ? "success" : "warning"}>
                  {userData.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </p>
            </div>

            {userData.companyId ? (
              <div className="mt-5 flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-lg">
                {" "}
                <AlertTriangle size={18} />
                <span>Already assigned to a company. Assignment disabled.</span>
              </div>
            ) : (
              <button
                onClick={() => setConfirmOpen(true)}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition font-medium"
              >
                Assign to Company
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : holdersWithPolicies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
            <Users size={40} className="mb-4 opacity-70" />
            <h3 className="text-lg font-semibold">No Insurance Holders</h3>
            <p className="mt-2 text-sm">
              Search above to assign a new insurance holder.
            </p>
          </div>
        ) : (
          <aside className="space-y-6">
            {holdersWithPolicies.map((holder) => (
              <div
                key={holder.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-200">
                      {holder.fullName}
                    </h3>
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]"
                      title={holder.email}
                    >
                      {holder.email}
                    </p>
                  </div>
                  <Badge color={holder.isVerified ? "success" : "error"}>
                    {holder.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <div className="mt-4">
                  {holder.policies.length > 0 ? (
                    <ul className="space-y-3">
                      {holder.policies.map((p: any) => (
                        <li
                          key={p.id}
                          className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              #{p.policyNumber}
                            </span>
                            <div className="relative inline-block">
                              <Badge color={getStatusBadgeColor(p.status)}>
                                {" "}
                                {p.status.charAt(0).toUpperCase() +
                                  p.status.slice(1)}
                              </Badge>

                              {p.status === "active" && (
                                <span className="absolute -top-1 -right-1 flex h-1 w-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={14} />
                            {p.regDate?.toDate
                              ? p.regDate.toDate().toLocaleDateString("en-GB", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Date N/A"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No policies assigned yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </aside>
        )}
      </div>

      {/* Confirm Assignment */}
      <CustomAlert
        isOpen={confirmOpen}
        title="Assign User?"
        text="Do you want to assign this civilian as a policyholder?"
        confirmText="Yes, Assign"
        cancelText="Cancel"
        showCancel
        onConfirm={onConfirmAssign}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Success */}
      <CustomAlert
        isOpen={successOpen}
        title="Assigned!"
        text="User has been successfully added."
        icon="success"
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setSuccessOpen(false)}
      />
    </ComponentCard>
  );
}
