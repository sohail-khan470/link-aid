// components/VehicleManager.tsx
import { useState } from "react";
import { useCompanyVehicles, Vehicle } from "../../hooks/useCompanyVehicles";

const VehiclesManagement = () => {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } =
    useCompanyVehicles();
  const [form, setForm] = useState<Vehicle>({ plate: "", type: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateVehicle(editingId, form);
      setEditingId(null);
    } else {
      await addVehicle(form);
    }
    setForm({ plate: "", type: "" });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setForm({ plate: vehicle.plate, type: vehicle.type });
    setEditingId(vehicle.id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      await deleteVehicle(id);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Manage Vehicles</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Vehicle Plate"
          value={form.plate}
          onChange={(e) => setForm({ ...form, plate: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Vehicle Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Plate:</strong> {vehicle.plate}
                </p>
                <p>
                  <strong>Type:</strong> {vehicle.type}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id!)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VehiclesManagement;
