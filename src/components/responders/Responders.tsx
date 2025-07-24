import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FiEdit2 } from "react-icons/fi";
import { Timestamp } from "firebase/firestore";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useResponders } from "../../hooks/useResponders";
import ComponentCard from "../common/ComponentCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Modal } from "../ui/modal";

interface Responder {
  id: string;
  fullName: string;
  isVerified: boolean;
  language: string;
  location?: { _lat: number; _long: number } | string;
  phone?: string;
  role: string;
  createdAt?: any;
  verifiedAt?: any;
}

export default function Responders() {
  const { responders, loading, updateIsVerified, updateLanguage } =
    useResponders();

  console.log(responders);

  const [showForm, setShowForm] = useState(false);
  const [currentResponder, setCurrentResponder] = useState<Responder | null>(
    null
  );
  const [formData, setFormData] = useState<{
    fullName: string;
    isVerified: boolean;
    language: string;
    location?: string;
    phone?: string;
    role: string;
    createdAt?: Timestamp;
    verifiedAt?: Timestamp;
  }>({
    fullName: "",
    isVerified: false,
    language: "en",
    location: undefined,
    phone: undefined,
    role: "responder",
    createdAt: undefined,
    verifiedAt: undefined,
  });

  const handleEdit = (responder: Responder) => {
    setCurrentResponder(responder);
    setFormData({
      fullName: responder.fullName || "",
      isVerified: responder.isVerified || false,
      language: responder.language || "en",
      location:
        typeof responder.location === "object"
          ? `${responder.location?._lat || 0}° N, ${
              responder.location?._long || 0
            }° E`
          : responder.location || "",
      phone: responder.phone || "",
      role: responder.role || "responder",
      createdAt: responder.createdAt || undefined,
      verifiedAt: responder.verifiedAt || undefined,
    });
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, language: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentResponder) {
      await updateIsVerified(currentResponder.id, formData.isVerified);
      await updateLanguage(currentResponder.id, formData.language);
    }
    setShowForm(false);
  };

  // Function to format location for display
  const formatLocation = (loc: Responder["location"]) => {
    if (typeof loc === "object" && loc !== null) {
      return `${loc._lat || 0}° N, ${loc._long || 0}° E`;
    }
    return loc || "N/A";
  };

  return (
    <>
      <ComponentCard title={"Responders"}>
        {loading && responders.length > 0 ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : responders.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      "Name",
                      "Verified",
                      "Language",
                      "Location",
                      "Phone",
                      "CreatedAt",
                      "VerifiedAt",
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
                  {responders.map((r: Responder) => (
                    <TableRow
                      key={r.id}
                      className="hover:bg-blue-50 dark:hover:bg-white/5 transition"
                    >
                      <TableCell className="py-3 px-5 text-gray-800 dark:text-gray-400">
                        {r.fullName}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={r.isVerified}
                          onChange={(e) =>
                            updateIsVerified(r.id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <select
                          value={r.language}
                          onChange={(e) => updateLanguage(r.id, e.target.value)}
                          className="p-1 border rounded"
                        >
                          <option value="en">English</option>
                          <option value="sv">Swedish</option>
                        </select>
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {formatLocation(r.location)}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {r.phone || "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {r?.createdAt?.toDate
                          ? r.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        {r?.verifiedAt?.toDate
                          ? r.verifiedAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-gray-600 dark:text-gray-400">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
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
<Modal isOpen={showForm} onClose={() => setShowForm(false)}>
  <div className="relative w-full">
    <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300 scale-100">
      <ComponentCard
        title={currentResponder ? "Edit Responder" : "Add Responder"}
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Responder 1"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="isVerified">Verified</Label>
            <Input
              type="checkbox"
              id="isVerified"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleLanguageChange}
              className="w-full p-2 border rounded"
            >
              <option value="en">English</option>
              <option value="sv">Swedish</option>
            </select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              placeholder="34.8774° N, 22.6665° E"
              value={formData.location || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              id="phone"
              name="phone"
              placeholder="+3866271662"
              value={formData.phone || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {currentResponder ? "Update Responder" : "Create Responder"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  </div>
</Modal>

    </>
  );
}
