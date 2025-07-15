import React, { useState } from "react";
import { FiUser, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import TowingCompanyModal from "./TowingCompanyModal";
import useTowingCompanyManagement from "../../hooks/useTowingCompanyManagement";
import { confirm } from "../../utils/confirm";

const TowingCompanyManagement: React.FC = () => {
  const {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useTowingCompanyManagement();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  console.log(companies[0], "CCCCCCCCCCCCCCC");

  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await createCompany(formData);
      setCreateSuccess("Company created successfully!");
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
      }, 1500);
    } catch (err) {
      setCreateError("Failed to create company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      await updateCompany(formData.id, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        description: formData.description,
      });
      setEditSuccess("Company updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(null);
      }, 1500);
    } catch (err) {
      setEditError("Failed to update company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this company?"
    );
    if (!isConfirmed) return;

    try {
      await deleteCompany(id);
    } catch (err) {
      console.log(err);
    }
  };

  const openEditModal = (company: any) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Towing Company Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" />
          Create Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500">{company.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(company)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Phone: {company.phoneNumber}
              </p>
              <p className="text-sm text-gray-600">
                Address: {company.address || "N/A"}
              </p>
              <p className="text-sm text-gray-600">Region: {company.region}</p>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No companies found.</p>
          </div>
        )}
      </div>

      <TowingCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        title="Create New Towing Company"
        isSubmitting={isSubmitting}
        error={createError}
        success={createSuccess}
      />

      <TowingCompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        title="Edit Towing Company"
        initialData={selectedCompany}
        isSubmitting={isSubmitting}
        error={editError}
        success={editSuccess}
      />
    </div>
  );
};

export default TowingCompanyManagement;
