// components/EmergencyReportCard.tsx
import React from "react";
import { EmergencyReport } from "../../hooks/useEmergencyReports";
import ImageSlider from "../ui/slider/ImageSlider";

interface EmergencyReportCardProps {
  report: EmergencyReport;
  onClick: () => void;
}

const EmergencyReportCard: React.FC<EmergencyReportCardProps> = ({
  report,
  onClick,
}) => {
  const createdAtDate = report.createdAt.toDate().toLocaleString();

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {report.claimId}
        </h2>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            report.priority === "High"
              ? "bg-red-100 text-red-800"
              : report.priority === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {report.priority}
        </span>
      </div>

      {report.images && report.images.length > 0 && (
        <div className="mb-3">
          <ImageSlider images={report.images} />
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          <span className="font-medium">Incident:</span> {report.incidentText}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Location:</span>{" "}
          {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Reported:</span> {createdAtDate}
        </p>
      </div>
    </div>
  );
};

export default EmergencyReportCard;
