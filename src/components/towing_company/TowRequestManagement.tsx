// TowingRequestManagement.tsx
import React, { useState } from "react";
import { auth } from "../../../firebase";
import { useTowRequest } from "../../hooks/useTowRequest";
import axios from "axios";
import LoadingSpinner from "../ui/LoadingSpinner";
import MapComponent from "../map/MapComponent";
import Button from "../ui/button/Button";

const TowingRequestManagement = () => {
  const {
    towRequests,
    loading,
    formLoading,
    createTowRequest,
    updateTowRequest,
    deleteTowRequest,
  } = useTowRequest();

  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicleType: "",
    location: { lat: 0, lng: 0 },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [center, setCenter] = useState<[number, number]>([33.6844, 73.0479]); // Default to Islamabad
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);

  console.log("Tow Requests:", towRequests);

  // Fetch coordinates dynamically using Nominatim API
  const fetchCoordinates = async (
    city: string
  ): Promise<[number, number] | null> => {
    setIsLoadingCoords(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city
        )}&limit=1`
      );
      const data = response.data[0];
      if (data) {
        const { lat, lon } = data;
        return [parseFloat(lat), parseFloat(lon)];
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    } finally {
      setIsLoadingCoords(false);
    }
  };

  const handleUpdateMap = async () => {
    if (!searchQuery) return;

    const coords = await fetchCoordinates(searchQuery);
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        location: { lat: coords[0], lng: coords[1] },
      }));
      setCenter(coords);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please sign in to create tow requests");
      return;
    }

    if (currentRequest) {
      await updateTowRequest(currentRequest, formData);
    } else {
      setIsLoadingCoords(true);
      await createTowRequest({
        vehicleType: formData.vehicleType,
        location: formData.location,
        userId: auth.currentUser.uid,
      });
      setIsLoadingCoords(false);
    }

    setCurrentRequest(null);
    setFormData({
      vehicleType: "",
      location: { lat: 0, lng: 0 },
    });
    setSearchQuery("");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tow Requests</h2>

      <div className="mb-6 flex items-center space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search city or area (e.g., Islamabad, Lahore)"
          className="w-full p-2 border rounded"
        />
        <Button
          onClick={handleUpdateMap}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!searchQuery || isLoadingCoords}
        >
          {isLoadingCoords ? "Searching..." : "Set Location"}
        </Button>
        {isLoadingCoords && <LoadingSpinner />}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 bg-white rounded shadow"
      >
        <div className="mb-4">
          <label className="block mb-2">Vehicle Type</label>
          <input
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            placeholder="Car, Truck, etc."
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Location</label>
          {formData.location.lat !== 0 && (
            <div className="mt-2">
              Latitude: {formData.location.lat.toFixed(6)}, Longitude:{" "}
              {formData.location.lng.toFixed(6)}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={formLoading || formData.location.lat === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {formLoading || isLoadingCoords
            ? "Processing..."
            : currentRequest
            ? "Update Request"
            : "Create Request"}
        </Button>
        {isLoadingCoords && <LoadingSpinner />}
      </form>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Map View</h3>
        <MapComponent
          center={center}
          requests={towRequests.filter(
            (req) => req.userId === auth.currentUser?.uid
          )}
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Your Requests</h3>
        {towRequests
          .filter((request) => request.userId === auth.currentUser?.uid)
          .map((request) => (
            <div
              key={request.id}
              className="mb-4 p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium">
                  {request.vehicleType || "Unknown Vehicle"}
                </h4>
                <p>
                  <strong>Status:</strong> {request.status}
                </p>
                <p>
                  <strong>Location:</strong> {request.location.lat.toFixed(4)},{" "}
                  {request.location.lng.toFixed(4)}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {request.createdAt?.toLocaleString()}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={() => {
                    setCurrentRequest(request.id);
                    setFormData({
                      vehicleType: request.vehicleType,
                      location: request.location,
                    });
                    setCenter([request.location.lat, request.location.lng]);
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteTowRequest(request.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </Button>
                {request.status === "requested" && (
                  <Button
                    onClick={() =>
                      updateTowRequest(request.id, { status: "cancelled" })
                    }
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TowingRequestManagement;
