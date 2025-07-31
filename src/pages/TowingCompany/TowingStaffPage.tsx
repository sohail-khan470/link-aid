import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TowingStaffManagement from "../../components/towing_company/TowingStaffManagement";

export default function TowingStaffPage() {
  return (
    <>
      <PageMeta
        title="Towing Staff Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Towing Operators" />
      <div className="space-y-6">
        <TowingStaffManagement />
      </div>
    </>
  );
}

//  <TowingSta