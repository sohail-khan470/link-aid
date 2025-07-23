import { useState } from "react";
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
        where("role", "==", "civilian") // ✅ Enforce civilian role
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

      // If assigning tow_operator role, add companyId
      if (selectedRole === "tow_operator") {
        updateData.companyId = company.id;
      } else {
        // If assigning civilian role, remove companyId
        updateData.companyId = "";
      }

      const userRef = doc(db, "users", searchResult.id);
      await updateDoc(userRef, updateData);

      console.log(`User ${searchResult.email} assigned role: ${selectedRole}`);

      // Refresh the parent component data
      await onUserAssigned();

      // Reset form
      setSearchEmail("");
      setSearchResult(null);
      setNotFound(false);
      setSelectedRole("tow_operator");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search & Assign User</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter user email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Search Results Section */}
          {isSearching && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}

          {notFound && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">
                No user found with email: {searchEmail}
              </p>
            </div>
          )}

          {searchResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">User Found:</h3>
              <div className="space-y-1 text-sm">
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

              {/* Role Assignment */}
              <div className="pt-2 border-t border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value as "tow_operator" | "civilian"
                    )
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
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
