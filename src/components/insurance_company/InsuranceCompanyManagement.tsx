import { useState, useMemo } from "react";
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
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { useInsuranceCompany } from "../../hooks/useInsuranceCompany";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Timestamp } from "firebase/firestore";
import { Modal } from "../ui/modal";
import Pagination from "../ui/Pagination";

interface Company {
  id: string;
  companyName: string;
  contactEmail: string;
  region: string;
  createdAt?: Timestamp;
  activeClaims?: any[];
  isVerified?: boolean; // ✅ Added field
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
    phone?: string;
    location?: string;
    language?: string;
    password?: string;
    createdAt?: Timestamp;
  }>({
    companyName: "",
    contactEmail: "",
    region: "",
    phone: "",
    location: "",
    language: "en",
    password: "",
    createdAt: undefined,
  });

  // ✅ Region Filter
  const [regionFilter, setRegionFilter] = useState("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredCompanies = useMemo(() => {
    return insuranceCompanies.filter((company) =>
      company.region?.toLowerCase().includes(regionFilter.toLowerCase())
    );
  }, [insuranceCompanies, regionFilter]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    return filteredCompanies.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredCompanies, currentPage]);

  // ✅ Handlers
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
      password: "",
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
        title="Insurance Companies"
        button={
          <div className="flex items-center gap-3">
            {/* 🔎 Region Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by region..."
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-lg pl-10 pr-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <FiPlus /> Add
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <FiSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No Companies Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting the region filter or add a new insurance company.
            </p>
            <button
              onClick={() => {
                setRegionFilter("");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
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
                        "Verified", // ✅ Added column
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
                    {paginatedCompanies.map((c: Company) => (
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
                        {/* ✅ Verified Badge */}
                        <TableCell className="py-3 px-5">
                          <Badge
                            size="sm"
                            color={c.isVerified ? "success" : "danger"}
                          >
                            {c.isVerified ? "Verified" : "Unverified"}
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

            {/* ✅ Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </ComponentCard>

      {/* ✅ Modal */}
      {showForm && (
        <Modal isOpen onClose={() => setShowForm(false)}>
          <div className="relative w-full">
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
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+92 300 1234567"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="Islamabad, PK"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Input
                      type="text"
                      id="language"
                      name="language"
                      placeholder="en"
                      value={formData.language || "en"}
                      onChange={handleInputChange}
                    />
                  </div>

                  {!currentCompany && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter a password"
                        value={formData.password || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

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
        </Modal>
      )}
    </>
  );
}
