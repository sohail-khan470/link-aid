import { useProfile } from "../../hooks/useProfile";
import Badge from "../ui/badge/Badge";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function UserMetaCard() {
  const { profile, loading } = useProfile();

  if (loading) return <LoadingSpinner />;
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.png" alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {profile?.fullName || "Unknown User"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge color="info">{profile?.role || "Team Manager"}</Badge>
                </p>
                {profile?.location && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile?.location || "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end"></div>
          </div>
        </div>
      </div>
    </>
  );
}
