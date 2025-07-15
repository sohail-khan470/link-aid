import { useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageMeta from "../common/PageMeta";
import { useInsuranceCompany } from "../../hooks/useInsuranceCompany";

const COLORS = {
  light: {
    background: "bg-white",
    card: "bg-white border-gray-100",
    textPrimary: "text-gray-800",
    textSecondary: "text-gray-500",
    hover: "hover:bg-gray-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  dark: {
    background: "dark:bg-gray-900",
    card: "dark:bg-gray-800 dark:border-gray-700",
    textPrimary: "dark:text-white",
    textSecondary: "dark:text-gray-400",
    hover: "dark:hover:bg-gray-700/50",
    iconBg: "dark:bg-blue-900/30",
    iconColor: "dark:text-blue-400",
  },
};

const InsuranceCompanyManagement = () => {
  const {
    insuranceCompanies,
    loading,
    formLoading,
    handleDelete,
    handleSubmit,
  } = useInsuranceCompany();

  const [showForm, setShowForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: "",
    region: "",
  });

  const handleEdit = (company: any) => {
    setCurrentCompany(company);
    setFormData({
      companyName: company.companyName,
      contactEmail: company.contactEmail,
      region: company.region,
    });
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(formData, currentCompany);
    if (success) {
      setShowForm(false);
    }
  };

  const handleAddNew = () => {
    setCurrentCompany(null);
    setFormData({ companyName: "", contactEmail: "", region: "" });
    setShowForm(true);
  };

  if (loading && !insuranceCompanies.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${COLORS.light.background} ${COLORS.dark.background}`}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${COLORS.light.background} ${COLORS.dark.background}`}
    >
      <PageMeta
        title="Insurance Companies"
        description="Manage insurance companies in the system"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-light mb-2 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
            >
              Insurance Companies
            </h1>
            <p
              className={
                COLORS.light.textSecondary + " " + COLORS.dark.textSecondary
              }
            >
              {insuranceCompanies.length} companies registered
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${COLORS.light.iconBg} ${COLORS.dark.iconBg} ${COLORS.light.iconColor} ${COLORS.dark.iconColor}`}
          >
            <FiPlus className="w-5 h-5" />
            Add New Company
          </button>
        </div>

        {/* Company List */}
        <div
          className={`rounded-xl shadow-sm border ${COLORS.light.card} ${COLORS.dark.card}`}
        >
          {loading && insuranceCompanies.length > 0 && (
            <div className="p-4 flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={COLORS.light.card}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Active Claims
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {insuranceCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className={`${COLORS.light.hover} ${COLORS.dark.hover}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`font-medium ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                      >
                        {company.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                      >
                        {company.contactEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                      >
                        {company.region}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.activeClaims?.length > 0
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {company.activeClaims?.length || 0} active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(company)}
                        className={`mr-3 ${COLORS.light.iconColor} ${COLORS.dark.iconColor} hover:opacity-80`}
                        disabled={loading}
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-500 dark:text-red-400 hover:opacity-80"
                        disabled={loading}
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`w-full max-w-md p-6 rounded-xl shadow-lg ${COLORS.light.card} ${COLORS.dark.card}`}
            >
              <h2
                className={`text-xl font-light mb-6 ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
              >
                {currentCompany ? "Edit Company" : "Add New Company"}
              </h2>

              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-1 ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${COLORS.light.card} ${COLORS.dark.card} ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-1 ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${COLORS.light.card} ${COLORS.dark.card} ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-1 ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary}`}
                  >
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${COLORS.light.card} ${COLORS.dark.card} ${COLORS.light.textPrimary} ${COLORS.dark.textPrimary}`}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={formLoading}
                    className={`px-4 py-2 rounded-lg ${COLORS.light.textSecondary} ${COLORS.dark.textSecondary} hover:opacity-80`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2`}
                  >
                    {formLoading && <LoadingSpinner />}
                    {currentCompany ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceCompanyManagement;
