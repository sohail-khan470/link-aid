// components/MapComponent.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapComponentProps {
  center: [number, number];
  requests?: {
    id: string;
    location: { lat: number; lng: number };
    vehicleType: string;
    status: string;
  }[];
}

const MapComponent: React.FC<MapComponentProps> = ({ center, requests }) => {
  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer center={center} zoom={10} className="h-96 w-full rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {requests?.map((request) => (
        <Marker
          key={request.id}
          position={[request.location.lat, request.location.lng]}
          icon={customIcon}
        >
          <Popup>
            {request.vehicleType} - {request.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
