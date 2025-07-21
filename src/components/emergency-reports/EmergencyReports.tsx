// components/EmergencyReports.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import EmergencyReportCard from "./EmergencyReportCard";
import useEmergencyReports from "../../hooks/useEmergencyReports";

const EmergencyReports: React.FC = () => {
  const { emergencyReports, loading, error } = useEmergencyReports();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 my-6 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Emergency Reports
      </h1>

      {emergencyReports.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p>No emergency reports available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emergencyReports.map((report) => (
            <EmergencyReportCard
              key={report.id}
              report={report}
              onClick={() => navigate(`/emergency-reports/${report.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyReports;
