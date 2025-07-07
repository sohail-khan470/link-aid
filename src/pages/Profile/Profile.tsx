import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthStore } from "../../store/auth.store";
import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";

const ProfilePage: React.FC = () => {
  const { user, userProfile, fetchUserProfile, loading, error } =
    useAuthStore();

  useEffect(() => {
    if (user) fetchUserProfile(user.uid);
  }, [user, fetchUserProfile]);

  console.log(userProfile);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {error || "The requested user profile could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <PageMeta title="Profile" description="User profile page" />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 flex items-center gap-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
            {userProfile.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {userProfile.username || "User"}
            </h1>
            <p className="text-indigo-500 dark:text-indigo-400">
              @{userProfile.username?.toLowerCase() || "user"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Personal Information
            </h2>
            <ProfileField label="Full Name" value={userProfile.username} />
            <ProfileField label="Email" value={userProfile.email} />
            <ProfileField
              label="Phone"
              value={userProfile.phone || "Not provided"}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Account Information
            </h2>
            <ProfileField
              label="Role"
              value={
                userProfile.role
                  ? userProfile.role.charAt(0).toUpperCase() +
                    userProfile.role.slice(1)
                  : "Standard user"
              }
            />
            <ProfileField
              label="Member Since"
              value={
                userProfile.createdAt
                  ? formatDate(userProfile.createdAt)
                  : "N/A"
              }
            />
            <ProfileField label="User ID" value={user?.uid} mono />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable profile field component
const ProfileField = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={`font-medium ${
        mono ? "font-mono text-sm" : ""
      } text-gray-900 dark:text-gray-100`}
    >
      {value}
    </p>
  </div>
);

export default ProfilePage;
