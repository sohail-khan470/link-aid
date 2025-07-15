import { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc as updateCompanyDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import LoadingSpinner from "../ui/LoadingSpinner";

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

interface AddOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onOperatorAdded: (operatorIds: string[]) => void;
}

// Function to generate random coordinates within a reasonable range
const generateRandomLocation = (): [string, string] => {
  // Generate coordinates around Stockholm area (adjust for your service area)
  const lat = (Math.random() * 0.2 + 59.3).toFixed(6); // Stockholm area
  const lng = (Math.random() * 0.2 + 18.0).toFixed(6); // Stockholm area
  return [lat, lng];
};

export default function AddOperatorModal({
  isOpen,
  onClose,
  company,
  onOperatorAdded,
}: AddOperatorModalProps) {
  const [newOperator, setNewOperator] = useState({
    name: "",
    plateNumber: "",
    etaToCurrentJob: "",
    status: true,
    vehicleTypes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!company) {
      console.error("No company information available");
      alert("Company information is missing. Please try again.");
      return;
    }

    if (
      !newOperator.name ||
      !newOperator.plateNumber ||
      !newOperator.etaToCurrentJob ||
      !newOperator.vehicleTypes
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate random location
      const randomLocation = generateRandomLocation();

      console.log("Adding operator with data:", {
        ...newOperator,
        location: randomLocation,
        companyId: company.adminId,
      });

      // Create new operator document
      const operatorData = {
        name: newOperator.name,
        plateNumber: newOperator.plateNumber,
        location: randomLocation,
        status: newOperator.status,
        etaToCurrentJob: newOperator.etaToCurrentJob,
        isVerified: false,
        vehicleTypes: newOperator.vehicleTypes.split(",").map((v) => v.trim()),
        companyId: company.adminId, // Use adminId as companyId reference
      };

      const newOperatorDoc = await addDoc(
        collection(db, "towing_operators"),
        operatorData
      );
      console.log("New operator created with ID:", newOperatorDoc.id);

      // Update company's operatorIds array
      const companyRef = doc(db, "towing_companies", company.id);
      const updatedOperatorIds = [...company.operatorIds, newOperatorDoc.id];

      await updateCompanyDoc(companyRef, {
        operatorIds: updatedOperatorIds,
      });

      console.log("Company updated with new operator ID");

      // Reset form
      setNewOperator({
        name: "",
        plateNumber: "",
        etaToCurrentJob: "",
        status: true,
        vehicleTypes: "",
      });

      // Notify parent component
      onOperatorAdded(updatedOperatorIds);
      onClose();
    } catch (error) {
      console.error("Error adding operator:", error);
      alert("Failed to add operator. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewOperator((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Operator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              placeholder="Enter operator name"
              value={newOperator.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number *
            </label>
            <input
              name="plateNumber"
              placeholder="Enter plate number"
              value={newOperator.plateNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ETA to Current Job (minutes) *
            </label>
            <input
              name="etaToCurrentJob"
              type="number"
              placeholder="Enter ETA in minutes"
              value={newOperator.etaToCurrentJob}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Types *
            </label>
            <input
              name="vehicleTypes"
              placeholder="e.g., SUV, Sedan, Truck (comma-separated)"
              value={newOperator.vehicleTypes}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple vehicle types with commas
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="status"
              checked={newOperator.status}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active Status
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 rounded py-2 hover:bg-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner /> : "Add Operator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
