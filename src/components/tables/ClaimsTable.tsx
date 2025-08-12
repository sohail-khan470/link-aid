import { useState, useMemo, useEffect } from "react";
import { useClaims } from "../../hooks/useClaims";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import ComponentCard from "../common/ComponentCard";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import Pagination from "../ui/Pagination";
import type { BadgeColor } from "../ui/badge/Badge";
import {
  Search,
  Eye,
  User,
  FileText,
  Calendar,
  Hash,
  Bot,
  X,
  Pencil,
} from "lucide-react";
import { Modal } from "../ui/modal";
import { db } from "../../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logAction } from "../../utils/logAction";

const ROWS_PER_PAGE = 10;

export default function ClaimsTable() {
  const { claims, loading, error } = useClaims();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [editClaim, setEditClaim] = useState<any | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [insurerOptions, setInsurerOptions] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [assignedInsurerId, setAssignedInsurerId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "resolved":
        return "success";
      case "submitted":
        return "warning";
      case "pending":
        return "info";
      default:
        return "error";
    }
  };

  useEffect(() => {
    if (!authUser) {
      setCurrentUserRole(null);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserRole(data.role || null);
        } else {
          setCurrentUserRole(null);
        }
      } catch (err) {
        console.error("Failed to fetch current user role:", err);
        toast.error("Failed to fetch current user role");
        setCurrentUserRole(null);
      }
    };

    fetchUserRole();
  }, [authUser]);

  // Watch auth user
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Load insurer dropdown options if applicable
  useEffect(() => {
    const loadInsurers = async () => {
      if (!authUser) return;
      try {
        const userDoc = await getDocs(
          query(
            collection(db, "users"),
            where("role", "==", "insurer"),
            where("companyId", "==", authUser.uid)
          )
        );
        const list = userDoc.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setInsurerOptions(list);
      } catch (err) {
        console.error("Error loading insurers:", err);
        toast.error("Error loading insurer options");
      }
    };
    loadInsurers();
  }, [authUser]);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const searchMatch = search
        ? claim.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          claim.category?.toLowerCase().includes(search.toLowerCase()) ||
          claim.status?.toLowerCase().includes(search.toLowerCase())
        : true;
      return searchMatch;
    });
  }, [claims, search]);

  const paginatedClaims = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredClaims.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredClaims, page]);

  const totalPages = Math.ceil(filteredClaims.length / ROWS_PER_PAGE);

  const openEditModal = (claim: any) => {
    setEditClaim(claim);
    setStatus(claim.status || "");
    setAssignedInsurerId(claim.assignedInsurerId || "");
  };

  //handle claim update

  const handleUpdateClaim = async () => {
    if (!editClaim) return;
    try {
      await updateDoc(doc(db, "claims", editClaim.id), {
        status,
        assignedInsurerId: assignedInsurerId || null,
      });
      console.log("Claim updated:", {
        id: editClaim.id,
        status,
        assignedInsurerId,
      });
      toast.success("Claim updated successfully!");

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const currentUserData = userDoc.data();

          await logAction({
            userId: currentUser.uid,
            userName: currentUserData.fullName || "Unknown User",
            role: currentUserData.role || "unknown",
            action: "Update Claim",
            description: `${
              currentUserData.fullName || "Someone"
            } updated claim ${
              editClaim.claimNumber || editClaim.id
            }: set status to "${status}" and assigned to ${
              assignedInsurerId
                ? insurerOptions.find((i) => i.id === assignedInsurerId)
                    ?.fullName || assignedInsurerId
                : "no insurer"
            }.`,
          });
        }
      }

      setEditClaim(null);
    } catch (err) {
      console.error("Failed to update claim:", err);
      toast.error("Failed to update claim. Please try again.");
    }
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer position="bottom-center" autoClose={3000} />

      <ComponentCard title="Claims List">
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, category, or status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No Claims Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or check back later for updates.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table className="w-full text-sm">
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    {[
                      "Claim #",
                      "Name",
                      "Category",
                      "Status",
                      "Assigned Staff",
                      "Action",
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
                  {paginatedClaims.map((claim) => (
                    <TableRow
                      key={claim.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                    >
                      <TableCell className="px-6 py-4 text-gray-900 dark:text-gray-100">
                        {claim.claimNumber || `C-${claim.id.slice(0, 5)}`}
                      </TableCell>

                      <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                        {claim?.fullName
                          ? claim.fullName.toLocaleUpperCase()
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                        {claim?.category || "N/A"}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Badge
                          color={getStatusColor(claim.status || "unknown")}
                        >
                          {claim.status || "Unknown"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4  text-gray-900 dark:text-gray-100">
                        {claim?.assignedInsurerName || "N/A"}
                      </TableCell>

                      <TableCell className="px-6 py-4 flex gap-2">
                        <button
                          aria-label="view"
                          onClick={() => setSelectedClaim(claim)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                        >
                          <Eye size={18} />
                        </button>
                        {currentUserRole !== "super_admin" && (
                          <button
                            aria-label="edit"
                            onClick={() => openEditModal(claim)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}

        {error && (
          <p className="mt-4 text-center text-red-500 dark:text-red-400 text-sm font-medium">
            {error}
          </p>
        )}

        {/* Modal for claim edit */}
        <Modal isOpen={!!editClaim} onClose={() => setEditClaim(null)}>
          {editClaim && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                Edit Claim
              </h2>
              <div className="mb-4">
                <label className="block mb-1 font-medium dark:text-gray-300">
                  Status
                </label>
                <select
                  className="w-full border p-2 rounded dark:text-gray-300 "
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option
                    className="dark:bg-gray-800 dark:text-gray-300"
                    value="pending"
                  >
                    Pending
                  </option>
                  <option
                    className="dark:bg-gray-800 dark:text-gray-300"
                    value="submitted"
                  >
                    Submitted
                  </option>
                  <option
                    className="dark:bg-gray-800 dark:text-gray-300"
                    value="resolved"
                  >
                    Resolved
                  </option>
                </select>
              </div>

              {insurerOptions.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium dark:text-gray-300">
                    Assign to Insurer
                  </label>
                  <select
                    className="w-full border p-2 dark:bg-gray-800 rounded dark:text-gray-300"
                    value={assignedInsurerId}
                    onChange={(e) => setAssignedInsurerId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {insurerOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditClaim(null)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClaim}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal for claim details */}
        <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)}>
          {selectedClaim && (
            <div
              className="relative bg-white dark:bg-gray-800 
                    w-full h-full sm:max-w-lg sm:h-auto sm:rounded-2xl
                    shadow-xl p-6 sm:p-8 overflow-y-auto max-h-[100vh] sm:max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                aria-label="c"
                onClick={() => setSelectedClaim(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                <X size={22} />
              </button>

              {/* Header */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    Claim Details
                  </h2>
                </div>
                {/* Status Badge */}
                <Badge
                  color={
                    selectedClaim.status === "resolved"
                      ? "success"
                      : selectedClaim.status === "pending"
                      ? "info"
                      : selectedClaim.status === "submitted"
                      ? "warning"
                      : "error"
                  }
                >
                  {selectedClaim.status || "Unknown"}
                </Badge>
              </div>

              {/* Claim Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-3">
                  <Hash size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Claim Number
                    </p>
                    <p className="font-medium break-words">
                      {selectedClaim.claimNumber ||
                        `C-${selectedClaim.id.slice(0, 6)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted By
                    </p>
                    <p className="font-medium">
                      {selectedClaim.fullName || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="font-medium">
                      {selectedClaim.category || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Bot size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI Suggestion
                    </p>
                    <p className="font-medium break-words">
                      {selectedClaim.aiSuggestion || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted At
                    </p>
                    <p className="font-medium">
                      {selectedClaim.submittedAt?.toDate
                        ? selectedClaim.submittedAt
                            .toDate()
                            .toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {selectedClaim.updatedAt?.toDate
                        ? selectedClaim.updatedAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedClaim.role === "civilian"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                          : selectedClaim.role === "insurer"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                      }`}
                    >
                      {selectedClaim.role || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ">
                  <User size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Assigned To
                    </p>
                    <p className="font-medium">
                      {selectedClaim.assignedInsurerName || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Description
                    </p>
                    <p className="font-medium break-words">
                      {selectedClaim.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </ComponentCard>
    </>
  );
}
