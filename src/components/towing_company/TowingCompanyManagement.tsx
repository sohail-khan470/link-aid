import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import LoadingSpinner from "../ui/LoadingSpinner";
import ComponentCard from "../common/ComponentCard";
import useTowingCompanyManagement from "../../hooks/useTowingCompanyManagement";
import { confirm } from "../../utils/confirm";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Modal } from "../ui/modal";

export default function TowingCompanyManagement() {
  const {
    companies = [],
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useTowingCompanyManagement();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    region: "",
    description: "",
  });

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || "",
      email: company.email || "",
      phoneNumber: company.phoneNumber || "",
      address: company.address || "",
      region: company.region || "",
      description: company.description || "",
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedCompany(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      region: "",
      description: "",
    });
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany.id, formData);
      } else {
        await createCompany(formData);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Are you sure you want to delete this company?"
    );
    if (!confirmed) return;
    try {
      await deleteCompany(id);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <>
      <ComponentCard
        title="Towing Companies"
        button={
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FiPlus /> Add
          </button>
        }
      >
        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            No towing companies found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Region",
                      "Address",
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
                  {companies.map((company) => (
                    <TableRow
                      key={company.id}
                      className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                    >
                      <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                        {company.name}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {company.email}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {company.phoneNumber}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {company.region}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {company.address}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(company)}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400"
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

      {/* Portal-based Modal */}
      {showForm && (
        <Modal isOpen onClose={() => setShowForm(false)}>
          <div className="relative w-full">
            <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300 scale-100">
              <ComponentCard
                title={
                  selectedCompany ? "Edit Towing Company" : "Add Towing Company"
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
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fast Tow Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@fasttow.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder="East Region"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      {isSubmitting
                        ? selectedCompany
                          ? "Updating..."
                          : "Creating..."
                        : selectedCompany
                        ? "Update Company"
                        : "Create Company"}
                    </button>
                  </div>
                </form>
              </ComponentCard>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
