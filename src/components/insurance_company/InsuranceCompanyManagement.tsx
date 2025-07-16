import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";
import ComponentCard from "../common/ComponentCard";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useInsuranceCompany } from "../../hooks/useInsuranceCompany";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Timestamp } from "firebase/firestore";

interface Company {
  id: string;
  companyName: string;
  contactEmail: string;
  region: string;
  createdAt?: Timestamp;
  activeClaims?: any[];
}

export default function InsuranceCompanyManagement() {
  const {
    insuranceCompanies = [],
    loading,
    formLoading,
    handleDelete,
    handleSubmit,
  } = useInsuranceCompany();

  const [showForm, setShowForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<{
    companyName: string;
    contactEmail: string;
    region: string;
    createdAt?: Timestamp;
  }>({
    companyName: "",
    contactEmail: "",
    region: "",
    createdAt: undefined,
  });

  const handleEdit = (company: Company) => {
    setCurrentCompany(company);
    setFormData({
      companyName: company.companyName || "",
      contactEmail: company.contactEmail || "",
      region: company.region || "",
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setCurrentCompany(null);
    setFormData({
      companyName: "",
      contactEmail: "",
      region: "",
      createdAt: Timestamp.now(),
    });
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await handleSubmit(formData, currentCompany);
    if (ok) setShowForm(false);
  };
  

  return (
    <>
      <ComponentCard
        title={"Insurance Companies"}
        button={
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FiPlus /> Add
          </button>
        }
      >
        {loading && insuranceCompanies.length > 0 ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : insuranceCompanies.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            <LoadingSpinner/>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      "Company",
                      "Contact",
                      "CreatedAt",
                      "Region",
                      "Active Claims",
                      "Actions",
                    ].map((heading) => (
                      <TableCell
                        key={heading}
                        isHeader
                        className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {insuranceCompanies.map((c: Company) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                    >
                      <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                        {c.companyName}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {c.contactEmail}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {c?.createdAt?.toDate
                          ? c.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {c.region}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            Array.isArray(c.activeClaims) &&
                            c.activeClaims.length > 0
                              ? "success"
                              : "warning"
                          }
                        >
                          {c.activeClaims?.length || 0} Active
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>

      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            {/* Modal content card */}
            <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300 scale-100">
              <ComponentCard
                title={
                  currentCompany
                    ? "Edit Insurance Company"
                    : "Add Insurance Company"
                }
                button={
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Cancel
                  </button>
                }
              >
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="ABC Insurance Ltd."
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      placeholder="contact@abcinsurance.com"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      type="text"
                      id="region"
                      name="region"
                      placeholder="North Region"
                      value={formData.region}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      {formLoading
                        ? currentCompany
                          ? "Updating..."
                          : "Creating..."
                        : currentCompany
                        ? "Update Company"
                        : "Create Company"}
                    </button>
                  </div>
                </form>
              </ComponentCard>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
