import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TowingCompanyManagement from "../../components/towing_company/TowingCompanyManagement";

export default function TowingCompanyPage() {
  return (
    <>
      <PageMeta
        title="Towing Company Management | LinkAid Dashboard"
        description="View and manage basic data tables in the LinkAid Admin Dashboard built with React and Tailwind CSS."
      />

      <PageBreadcrumb pageTitle="Towing Company" />
      <div className="space-y-6">
        <TowingCompanyManagement />
      </div>
    </>
  );
}
