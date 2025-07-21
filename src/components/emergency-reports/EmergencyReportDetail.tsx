import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useEmergencyReport from "../../hooks/useEmergencyReport";
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  Tag,
  Truck,
} from "lucide-react";
import LargeSlider from "../ui/slider/LargeImageSlider";

const EmergencyReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { report, responder, loading, error } = useEmergencyReport(id || "");

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md w-full">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  if (!report)
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="bg-gray-100 text-gray-700 p-6 rounded-lg max-w-md w-full">
          <p>Report not found.</p>
        </div>
      </div>
    );

  const createdAtDate = report.createdAt.toDate().toLocaleString();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 dark:text-gray-200 mb-4 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to reports
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {report.claimId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Emergency Report Details
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              report.priority === "High"
                ? "bg-red-500 text-white"
                : report.priority === "Medium"
                ? "bg-yellow-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {report.priority} Priority
          </span>
        </div>
      </div>

      {/* Image Slider Section */}
      {report.images && report.images.length > 0 && (
        <div className="w-full">
          <LargeSlider images={report.images} />
        </div>
      )}

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Incident Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Incident Details
            </h2>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <strong className="text-gray-800 dark:text-gray-200">
                  Created At
                </strong>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                {createdAtDate}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <strong className="text-gray-800 dark:text-gray-200">
                  Incident Description
                </strong>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                {report.incidentText}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <strong className="text-gray-800 dark:text-gray-200">
                  Location
                </strong>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                Lat: {report.location.lat}, Lng: {report.location.lng}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <strong className="text-gray-800 dark:text-gray-200">
                  Summary
                </strong>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-7">
                {report.summary}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <strong className="text-gray-800 dark:text-gray-200">
                  Tow Requested
                </strong>
              </div>
              <div className="ml-7">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.towRequested
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {report.towRequested ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Responder Details */}
          {responder && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <User className="w-6 h-6 mr-3" />
                Responder Details
              </h2>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <strong className="text-gray-800 dark:text-gray-200">
                    Name
                  </strong>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-7">
                  {responder.fullName}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <strong className="text-gray-800 dark:text-gray-200">
                    Phone
                  </strong>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-7">
                  {responder.phone}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <strong className="text-gray-800 dark:text-gray-200">
                    Region
                  </strong>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-7">
                  {responder.region}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <strong className="text-gray-800 dark:text-gray-200">
                    Status
                  </strong>
                </div>
                <div className="ml-7">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {responder.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <strong className="text-gray-800 dark:text-gray-200">
                    Last Updated
                  </strong>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-7">
                  {responder.lastUpdated.toDate().toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyReportDetail;
