import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/profile/UserMetaCard";
import UserInfoCard from "../components/profile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="User Profile | LinkAid Dashboard"
        description="View and manage user profile details including personal info, metadata, and address. Part of the LinkAid Admin Dashboard."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
        </div>
      </div>
    </>
  );
}
