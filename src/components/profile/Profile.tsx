// components/ProfilePage.tsx
import React from "react";
import { useProfile } from "../../hooks/useProfile";

const Profile = () => {
  const { user, profile, loading, error } = useProfile();

  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            No Profile Found
          </h2>
          <p className="text-gray-600">User profile data is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
              {profile.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {profile.username || "User"}
            </h1>
            <p className="text-blue-100">
              @{profile.username?.toLowerCase() || "user"}
            </p>
          </div>

          {/* Profile Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Personal Information
              </h2>
              <div className="space-y-4">
                <ProfileField label="Full Name" value={profile.username} />
                <ProfileField label="Email" value={profile.email} />
                <ProfileField label="Phone" value={profile.phone} />
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                <ProfileField
                  label="Role"
                  value={
                    profile.role
                      ? profile.role.charAt(0).toUpperCase() +
                        profile.role.slice(1)
                      : "User"
                  }
                />
                <ProfileField
                  label="Member Since"
                  value={formatDate(profile.createdAt)}
                />
                <ProfileField label="User ID" value={user?.uid} mono />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal helper component (not exported)
const ProfileField: React.FC<{
  label: string;
  value?: string | number;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p
      className={`font-medium ${mono ? "font-mono text-sm" : ""} text-gray-900`}
    >
      {value || "Not provided"}
    </p>
  </div>
);

export default Profile;
