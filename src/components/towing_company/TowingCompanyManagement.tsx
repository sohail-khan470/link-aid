import { useState, useMemo, useEffect } from "react";
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
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Timestamp } from "firebase/firestore";
import { Modal } from "../ui/modal";
import Pagination from "../ui/Pagination";
import { useTowingCompanyManagement } from "../../hooks/useTowingCompanyManagement";

export default function TowingCompanyManagement() {
  const {
    towingCompanies = [],
    loading,
    formLoading,
    handleDelete,
    handleSubmit,
    getStaffCounts,
  } = useTowingCompanyManagement();

  const [showForm, setShowForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<any | null>(null);
  const [staffCounts, setStaffCounts] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    region: string;
    password?: string;
    createdAt?: Timestamp;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    region: "",
    password: "",
    createdAt: undefined,
  });

  // Region filter & pagination
  const [regionFilter, setRegionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(
    () =>
      towingCompanies.filter((c) =>
        c.region?.toLowerCase().includes(regionFilter.toLowerCase())
      ),
    [towingCompanies, regionFilter]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filtered, currentPage]
  );

  // Handlers
  const handleAdd = () => {
    setCurrentCompany(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      region: "",
      password: "",
      createdAt: Timestamp.now(),
    });
    setShowForm(true);
  };

  const handleEdit = (company: any) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name || "",
      email: company.email || "",
      phoneNumber: company.phoneNumber,
      address: company.address,
      region: company.region,
      password: "",
      createdAt: company.createdAt,
    });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await handleSubmit(formData, currentCompany);
    if (ok) setShowForm(false);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = await getStaffCounts();
      setStaffCounts(counts);
    };
    fetchCounts();
  }, []);

  return (
    <>
      <ComponentCard
        title="Towing Companies"
        button={
          <div className="flex items-center gap-3">
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
              onClick={handleAdd}
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <FiSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No Companies Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting the region filter or add a new company.
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
                        "Name",
                        "Email",
                        "Tow Operators",
                        "Region",
                        "Verified",
                        "Actions",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          isHeader
                          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((c) => (
                      <TableRow
                        key={c.id}
                        className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                      >
                        <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                          {c.name}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                          {c.email}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                          {staffCounts[c.id] ?? 0}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                          {c.region}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={c.isVerified ? "success" : "danger"}
                          >
                            {c.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(c)}
                              aria-label="Edit company"
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              aria-label="Delete company"
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </ComponentCard>

      {showForm && (
        <Modal isOpen onClose={() => setShowForm(false)}>
          <div className="relative w-full">
            <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300">
              <ComponentCard
                title={
                  currentCompany ? "Edit Towing Company" : "Add Towing Company"
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
                <form onSubmit={onSubmit} className="space-y-6">
                  {[
                    { label: "Company Name", name: "name" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone Number", name: "phoneNumber" },
                    { label: "Address", name: "address" },
                    { label: "Region", name: "region" },
                  ].map(({ label, name, type = "text" }) => (
                    <div key={name}>
                      <Label htmlFor={name}>{label}</Label>
                      <Input
                        type={type}
                        id={name}
                        name={name}
                        placeholder={label}
                        value={(formData as any)[name] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  {!currentCompany && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Set a password"
                        value={formData.password || ""}
                        onChange={handleChange}
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
