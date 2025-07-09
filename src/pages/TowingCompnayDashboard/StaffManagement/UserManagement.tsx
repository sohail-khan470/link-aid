import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../../../firebase";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUser,
  FiX,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { FaTruck } from "react-icons/fa";

interface TowingOperator {
  id?: string;
  companyId: string;
  name: string;
  plateNumber: string;
  status: boolean;
  isVerified: boolean;
  userId: string;
  etaToCurrentJob?: number;
  location?: [string, string];
  vehicleTypes?: string[];
}

const UserManagement = () => {
  const [company, setCompany] = useState<any>(null);
  const [operators, setOperators] = useState<TowingOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [currentOperator, setCurrentOperator] = useState<TowingOperator>({
    companyId: "",
    name: "",
    plateNumber: "",
    status: true,
    isVerified: false,
    userId: "",
    etaToCurrentJob: 0,
    location: ["59.3271N", "18.0643E"],
    vehicleTypes: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  const loggedInUserId = auth.currentUser?.uid;

  // Fetch company and operators
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get company for logged-in admin
        const companiesRef = collection(db, "towing_companies");
        const companyQuery = query(
          companiesRef,
          where("adminId", "==", loggedInUserId)
        );
        const companySnapshot = await getDocs(companyQuery);

        if (companySnapshot.empty)
          throw new Error("No company found for this admin");

        const companyData = companySnapshot.docs[0].data();
        companyData.id = companySnapshot.docs[0].id;
        setCompany(companyData);

        // Get operators for this company
        const operatorsRef = collection(db, "towing_operators");
        const operatorsQuery = query(
          operatorsRef,
          where("companyId", "==", companyData.id)
        );
        const operatorsSnapshot = await getDocs(operatorsQuery);

        const operatorsData = operatorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TowingOperator[];

        setOperators(operatorsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) fetchData();
  }, [loggedInUserId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentOperator((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle location changes
  const handleLocationChange = (index: number, value: string) => {
    setCurrentOperator((prev) => {
      const newLocation = [...prev.location!];
      newLocation[index] = value;
      return { ...prev, location: newLocation as [string, string] };
    });
  };

  // Submit operator form
  const handleSubmit = async () => {
    try {
      if (!company?.id) throw new Error("Company not found");

      const operatorData = {
        ...currentOperator,
        companyId: company.id,
      };

      if (isEditing && currentOperator.id) {
        await updateDoc(
          doc(db, "towing_operators", currentOperator.id),
          operatorData
        );
        setOperators(
          operators.map((op) =>
            op.id === currentOperator.id ? operatorData : op
          )
        );
        showSnackbar("Operator updated successfully", "success");
      } else {
        const docRef = await addDoc(
          collection(db, "towing_operators"),
          operatorData
        );
        setOperators([...operators, { ...operatorData, id: docRef.id }]);
        showSnackbar("Operator added successfully", "success");
      }

      handleCloseDialog();
    } catch (err: any) {
      showSnackbar(`Error: ${err.message}`, "error");
    }
  };

  // Delete operator
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "towing_operators", id));
      setOperators(operators.filter((op) => op.id !== id));
      showSnackbar("Operator deleted successfully", "success");
    } catch (err: any) {
      showSnackbar(`Error: ${err.message}`, "error");
    }
  };

  // Open dialog for editing or adding
  const openOperatorDialog = (operator?: TowingOperator) => {
    if (operator) {
      setCurrentOperator(operator);
      setIsEditing(true);
    } else {
      setCurrentOperator({
        companyId: company?.id || "",
        name: "",
        plateNumber: "",
        status: true,
        isVerified: false,
        userId: "",
        etaToCurrentJob: 0,
        location: ["59.3271N", "18.0643E"],
        vehicleTypes: [],
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Show snackbar notification
  const showSnackbar = (message: string, type: string) => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 3000);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>{error}</p>
      </div>
    );

  if (!company)
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p>No company found for this user</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {company.name} - Staff Management
        </h1>
        <button
          onClick={() => openOperatorDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Operator
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operators.map((operator) => (
              <tr key={operator.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {operator.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {operator.userId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaTruck className="text-gray-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      {operator.plateNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        operator.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {operator.status ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        operator.isVerified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {operator.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openOperatorDialog(operator)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => operator.id && handleDelete(operator.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operator Form Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isEditing ? "Edit Operator" : "Add New Operator"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    value={currentOperator.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number
                  </label>
                  <input
                    name="plateNumber"
                    value={currentOperator.plateNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    name="userId"
                    value={currentOperator.userId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ETA to Job (minutes)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      <FiClock />
                    </span>
                    <input
                      name="etaToCurrentJob"
                      type="number"
                      value={currentOperator.etaToCurrentJob}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      <FiMapPin />
                    </span>
                    <input
                      value={currentOperator.location?.[0]}
                      onChange={(e) => handleLocationChange(0, e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Latitude"
                    />
                    <input
                      value={currentOperator.location?.[1]}
                      onChange={(e) => handleLocationChange(1, e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Longitude"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    name="status"
                    type="checkbox"
                    checked={currentOperator.status}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active Status
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    name="isVerified"
                    type="checkbox"
                    checked={currentOperator.isVerified}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Verified Operator
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                onClick={handleSubmit}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isEditing ? "Update Operator" : "Add Operator"}
              </button>
              <button
                onClick={handleCloseDialog}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            snackbar.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <div>{snackbar.message}</div>
            <button
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              className="ml-4"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
