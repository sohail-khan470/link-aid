import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc as updateCompanyDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import AddOperatorModal from "./AddOperatorModal";
import LoadingSpinner from "../ui/LoadingSpinner";

interface Operator {
  id: string;
  name: string;
  plateNumber: string;
  location: [string, string] | null;
  status: boolean;
  etaToCurrentJob: string;
  isVerified: boolean;
  vehicleTypes: string[];
  companyId: string;
  createdAt: Timestamp;
}

interface Company {
  id: string;
  name: string;
  adminId: string;
  operatorIds: string[];
  vehicleIds: string[];
  email: string;
  phone: string;
  location: [string, string];
  region: string;
  isActive: boolean;
  createdAt: any;
}

export default function TowingStaffManagement() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Find company by adminId
        const q = query(
          collection(db, "towing_companies"),
          where("adminId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const companyDoc = snapshot.docs[0];
          const companyData = {
            id: companyDoc.id,
            ...companyDoc.data(),
          } as Company;

          setCompany(companyData);
          fetchOperators(companyData.operatorIds || []);
        } else {
          console.log("No company found for user");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchOperators = async (operatorIds: string[]) => {
    setLoading(true);

    if (operatorIds.length === 0) {
      setOperators([]);
      setLoading(false);
      return;
    }

    try {
      const operatorPromises = operatorIds.map(async (id) => {
        const operatorDoc = await getDoc(doc(db, "towing_operators", id));
        if (operatorDoc.exists()) {
          const data = operatorDoc.data();
          return {
            id: operatorDoc.id,
            name: data.name || "",
            plateNumber: data.plateNumber || "",
            location: data.location || null,
            status: data.status || false,
            etaToCurrentJob: data.etaToCurrentJob || "",
            isVerified: data.isVerified || false,
            vehicleTypes: data.vehicleTypes || [],
            companyId: data.companyId || "",
            createdAt: data.createdAt || "",
          } as Operator;
        }
        return null;
      });

      const resolved = await Promise.all(operatorPromises);
      const validOperators = resolved.filter(
        (op): op is Operator => op !== null
      );
      setOperators(validOperators);
    } catch (error) {
      console.error("Error fetching operators:", error);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (operatorId: string) => {
    if (!company) return;

    try {
      // Delete operator document
      await deleteDoc(doc(db, "towing_operators", operatorId));

      // Update company's operatorIds array
      const updatedOperatorIds = company.operatorIds.filter(
        (id) => id !== operatorId
      );
      const companyRef = doc(db, "towing_companies", company.id);
      await updateCompanyDoc(companyRef, { operatorIds: updatedOperatorIds });

      // Update local state
      setCompany((prev) =>
        prev ? { ...prev, operatorIds: updatedOperatorIds } : null
      );
      fetchOperators(updatedOperatorIds);
    } catch (error) {
      console.error("Error deleting operator:", error);
      alert("Failed to delete operator. Please try again.");
    }
  };

  const handleOperatorAdded = (updatedOperatorIds: string[]) => {
    setCompany((prev) =>
      prev ? { ...prev, operatorIds: updatedOperatorIds } : null
    );
    fetchOperators(updatedOperatorIds);
  };

  // Helper function to format location display
  const formatLocation = (location: [string, string] | null) => {
    if (!location || !Array.isArray(location)) return "Location not set";
    return `${location[0] || "-"}, ${location[1] || "-"}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Tow Operators</h1>
          {company && (
            <p className="text-gray-600 mt-1">
              Company: {company.name} ({company.region})
            </p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={!company}
        >
          Add New Operator
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">
            Operators ({operators.length})
          </h2>
          {operators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No operators found. Add your first operator to get started.
            </p>
          ) : (
            <ul className="space-y-4">
              {operators.map((operator) => (
                <li
                  key={operator.id}
                  className="flex justify-between items-start border-b py-3 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{operator.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Plate: {operator.plateNumber}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Location: {formatLocation(operator.location)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ETA: {operator.etaToCurrentJob || "-"} mins
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          operator.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {operator.status ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          operator.isVerified
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {operator.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    {operator.vehicleTypes?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Vehicle Types:</span>{" "}
                        {operator.vehicleTypes.join(", ")}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(operator.id)}
                    className="text-red-500 hover:text-red-700 hover:underline ml-4 px-2 py-1"
                    aria-label={`Delete operator ${operator.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <AddOperatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={company}
        onOperatorAdded={handleOperatorAdded}
      />
    </div>
  );
}
