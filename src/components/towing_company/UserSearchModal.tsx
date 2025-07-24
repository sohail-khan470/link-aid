import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Company } from "../../pages/types/Company";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  companyId?: string;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUserAssigned: () => Promise<void>;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  company,
  onUserAssigned,
}: UserSearchModalProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"tow_operator" | "civilian">(
    "tow_operator"
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      alert("Please enter an email to search");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setNotFound(false);

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef,
        where("email", "==", searchEmail.trim()),
        where("role", "==", "civilian")
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setNotFound(true);
      } else {
        const userData = userSnapshot.docs[0].data() as User;
        userData.id = userSnapshot.docs[0].id;
        setSearchResult(userData);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      alert("Failed to search user. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignRole = async () => {
    if (!searchResult || !company) {
      alert("Missing user or company information");
      return;
    }

    setIsAssigning(true);
    try {
      const updateData: Partial<User> = {
        role: selectedRole,
      };

      if (selectedRole === "tow_operator") {
        updateData.companyId = company.id;
      } else {
        updateData.companyId = "";
      }

      const userRef = doc(db, "users", searchResult.id);
      await updateDoc(userRef, updateData);

      await onUserAssigned();
      resetSearch();
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Failed to assign role. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const resetSearch = () => {
    setSearchEmail("");
    setSearchResult(null);
    setNotFound(false);
    setSelectedRole("tow_operator");
  };

  const handleClose = () => {
    resetSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent px-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
      >
        <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
          Search & Assign User
        </h2>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
              Search by Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter user email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400"
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                {isSearching ? <LoadingSpinner /> : "Search"}
              </button>
            </div>
          </div>

          {/* Spinner */}
          {isSearching && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}

          {/* Not Found */}
          {notFound && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">
                No user found with email: {searchEmail}
              </p>
            </div>
          )}

          {/* User Result */}
          {searchResult && (
            <div className="p-4 bg-green-50 dark:bg-gray-900 border border-green-200 dark:border-gray-950 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-400">
                User Found
              </h3>
              <div className="space-y-1 text-sm  dark:text-gray-400">
                <p>
                  <strong>Email:</strong> {searchResult.email}
                </p>
                <p>
                  <strong>Name:</strong> {searchResult.name || "Not provided"}
                </p>
                <p>
                  <strong>Current Role:</strong> {searchResult.role || "None"}
                </p>
                {searchResult.companyId && (
                  <p>
                    <strong>Company ID:</strong> {searchResult.companyId}
                  </p>
                )}
              </div>

              <div className="pt-2 border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-1  dark:text-gray-400">
                  Assign Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value as "tow_operator" | "civilian"
                    )
                  }
                  className="w-full border border-blue-500 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500  dark:text-gray-400   dark:bg-gray-900"
                >
                  <option value="tow_operator">Tow Operator</option>
                  <option value="civilian">Civilian</option>
                </select>

                {selectedRole === "tow_operator" && company && (
                  <p className="text-xs text-blue-600 mt-1">
                    Will be assigned to: {company.name} ({company.region})
                  </p>
                )}

                <button
                  onClick={handleAssignRole}
                  disabled={isAssigning}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {isAssigning ? (
                    <LoadingSpinner />
                  ) : (
                    `Assign as ${selectedRole.replace("_", " ")}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={resetSearch}
              className="flex-1 bg-gray-300 text-gray-700 rounded py-2 hover:bg-gray-400 transition-colors"
              disabled={isSearching || isAssigning}
            >
              Reset Search
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 text-white rounded py-2 hover:bg-gray-600 transition-colors"
              disabled={isSearching || isAssigning}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
